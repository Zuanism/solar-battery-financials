"""Correct the cumulative sensors' history after a configuration mistake.

Backs the `recalculate_history` action, for when a wrong setting (a sign, a sensor)
has made the totals wrong for a while. FinancialManager's math is replayed over the
recorded inputs twice, with the previous (wrong) and with the current settings, and
only the difference is added to what was recorded. The cumulative sensors'
long-term and short-term statistics are corrected, together with their running
totals.

Why the difference instead of recalculating from scratch:
- Totals the mistake didn't affect stay exactly as recorded.
- Both replays use the current tracked devices. A device that was added, removed or
  replaced (under the same name) since then is the same in both and cancels out,
  instead of moving its consumption to or from "untracked".
- With only hourly means, the averaging error largely cancels too (see below).

Where to get the inputs from:
- Within the recorder's state history (`purge_keep_days`, 10 days by default) the
  replay is exact: every recorded state change is applied in order, just as the
  live manager would have seen it.
- Before that, only the inputs' hourly means (long-term statistics) remain, and
  whatever happened within an hour (import and export in the same hour, a price
  change at :15) is averaged away. Each hour is calculated once per setting from
  the means. Calculated directly, earnings of a battery that trades within the hour
  come out 10 % or more off; as a difference, the correction is roughly right
  (about 12 % too small in a test with a wrong inverter sign). Inputs without
  statistics make those hours unrecoverable.

Because only a difference is added, running twice over a period would apply it
twice. Real runs are therefore logged in `.storage`, and overlapping runs refused.

How the statistics are corrected:
- Per hour (long-term) and per 5 minutes (short-term) the recorded increase of
  each total is replaced by the recalculated one. Every row from there on is shifted
  by the correction accumulated so far, in both `sum` and `state`, and the live
  total by the whole correction. That keeps the recorder's next compiles
  continuous: they continue from the corrected last row and the corrected state.
- Slots without a recorded row (Home Assistant was down) and hours that can't be
  recalculated keep their recorded increase.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.storage import Store
import homeassistant.util.dt as dt_util

from .const import (
    CONF_AC_SOLAR_SENSOR,
    CONF_BATTERY_SENSOR,
    CONF_ERE_OFFSET,
    CONF_ERE_OFFSET_SENSOR,
    CONF_EV_CHARGER,
    CONF_EXPORT_PRICE_SENSOR,
    CONF_FEED_IN_PENALTY,
    CONF_FEED_IN_PENALTY_PERCENT,
    CONF_GRID_SENSOR,
    CONF_INVERTER_AC_SENSOR,
    CONF_INVERT_INVERTER_AC,
    CONF_PRICE_SENSOR,
    CONF_SOLAR_SENSOR,
    DOMAIN,
)
from .manager import FinancialManager

_LOGGER = logging.getLogger(__name__)

SERVICE_RECALCULATE_HISTORY = "recalculate_history"
RUNS_STORAGE_KEY = f"{DOMAIN}.recalculations"  # real runs, so a period is never corrected twice
SLOT = timedelta(minutes=5)
HOUR = timedelta(hours=1)
CHUNK = timedelta(days=1)  # state history is read one day at a time

_SENSOR_SETTING = vol.Any(None, cv.entity_id)
# Settings that were different during the period, as stored in the config entry.
PREVIOUS_SETTINGS_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_GRID_SENSOR): cv.entity_id,
        vol.Optional(CONF_PRICE_SENSOR): cv.entity_id,
        vol.Optional(CONF_EXPORT_PRICE_SENSOR): _SENSOR_SETTING,
        vol.Optional(CONF_SOLAR_SENSOR): _SENSOR_SETTING,
        vol.Optional(CONF_AC_SOLAR_SENSOR): _SENSOR_SETTING,
        vol.Optional(CONF_BATTERY_SENSOR): _SENSOR_SETTING,
        vol.Optional(CONF_INVERTER_AC_SENSOR): _SENSOR_SETTING,
        vol.Optional(CONF_INVERT_INVERTER_AC): cv.boolean,
        vol.Optional(CONF_FEED_IN_PENALTY): vol.Coerce(float),
        vol.Optional(CONF_FEED_IN_PENALTY_PERCENT): vol.Coerce(float),
        vol.Optional(CONF_EV_CHARGER): _SENSOR_SETTING,
        vol.Optional(CONF_ERE_OFFSET): vol.Coerce(float),
        vol.Optional(CONF_ERE_OFFSET_SENSOR): _SENSOR_SETTING,
    }
)

RECALCULATE_SCHEMA = vol.Schema(
    {
        vol.Required("start"): cv.datetime,
        vol.Optional("end"): cv.datetime,
        vol.Required("previous_settings"): PREVIOUS_SETTINGS_SCHEMA,
        vol.Optional("dry_run", default=True): cv.boolean,
        vol.Optional("entity_id"): cv.entity_ids,
        vol.Optional("statistics_only", default=False): cv.boolean,
    }
)


def async_register_service(hass: HomeAssistant) -> None:
    """Register the action once; it serves the (single) loaded config entry."""
    if hass.services.has_service(DOMAIN, SERVICE_RECALCULATE_HISTORY):
        return
    lock = asyncio.Lock()

    async def handle(call: ServiceCall) -> ServiceResponse:
        entries = [
            e for e in hass.config_entries.async_entries(DOMAIN) if e.entry_id in hass.data.get(DOMAIN, {})
        ]
        if not entries:
            raise ServiceValidationError("Solar & Battery Financials is not loaded")
        if lock.locked():
            raise ServiceValidationError("A recalculation is already running")
        async with lock:
            return await async_recalculate(
                hass,
                entries[0],
                start=_to_utc(call.data["start"]),
                end=_to_utc(call.data["end"]) if "end" in call.data else None,
                previous_settings=call.data["previous_settings"],
                dry_run=call.data["dry_run"],
                entity_ids=call.data.get("entity_id"),
                statistics_only=call.data["statistics_only"],
            )

    hass.services.async_register(
        DOMAIN, SERVICE_RECALCULATE_HISTORY, handle, schema=RECALCULATE_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )


def _to_utc(value: datetime) -> datetime:
    """Datetimes from the action form are naive local time."""
    if value.tzinfo is None:
        value = value.replace(tzinfo=dt_util.get_default_time_zone())
    return dt_util.as_utc(value)


def _floor(t: datetime, step: timedelta) -> datetime:
    epoch = t.timestamp()
    return dt_util.utc_from_timestamp(epoch - epoch % step.total_seconds())


@dataclass
class Replay:
    """Difference between the current and the previous settings, per 5-minute slot and per hour.

    Both are calculated from the same inputs and with the same (current) tracked
    devices, so only the settings' difference remains: a device that was added or
    replaced later is the same in both and cancels out.
    """

    slot_deltas: dict[str, dict[float, float]] = field(default_factory=dict)  # key -> slot start ts -> delta
    hour_deltas: dict[str, dict[float, float]] = field(default_factory=dict)  # key -> hour start ts -> delta
    # Approximate hours: the previous settings' estimate, to compare with what was recorded.
    hour_previous: dict[str, dict[float, float]] = field(default_factory=dict)
    exact_hours: set[float] = field(default_factory=set)
    approximate_hours: set[float] = field(default_factory=set)
    skipped_hours: set[float] = field(default_factory=set)  # an input has no hourly mean


async def async_recalculate(
    hass: HomeAssistant,
    entry: ConfigEntry,
    *,
    start: datetime,
    end: datetime | None,
    previous_settings: dict[str, Any],
    dry_run: bool,
    entity_ids: list[str] | None,
    statistics_only: bool,
) -> dict[str, Any]:
    from homeassistant.components.recorder import get_instance

    recorder = get_instance(hass)
    now = dt_util.utcnow()
    start = _floor(start, HOUR)
    end = _floor(min(end or now, now), HOUR)
    if start >= end:
        raise ServiceValidationError("Nothing to do: the period must contain at least one whole hour before now")
    if statistics_only and not dry_run:
        raise ServiceValidationError("'Statistics only' is for comparing methods in a dry run; turn on 'Dry run'")
    config = {**entry.data, **entry.options}
    if not _differences(config, previous_settings):
        raise ServiceValidationError(
            "Nothing to correct: the previous settings are the same as the current ones"
        )

    sensors = hass.data[DOMAIN][entry.entry_id]
    if entity_ids:
        unknown = set(entity_ids) - {s.entity_id for s in sensors}
        if unknown:
            raise ServiceValidationError(
                f"Not a cumulative sensor of this integration: {', '.join(sorted(unknown))}"
            )
        sensors = [s for s in sensors if s.entity_id in entity_ids]

    manager = FinancialManager.from_config(hass, config)
    previous = FinancialManager.from_config(hass, {**config, **previous_settings})
    keys = sorted({s._source_key for s in sensors})  # noqa: SLF001 - same integration
    stat_ids = [s.entity_id for s in sensors]
    store = Store(hass, 1, RUNS_STORAGE_KEY)
    runs: list[dict[str, Any]] = (await store.async_load()) or []
    overlapping = [
        run for run in runs
        if run["start"] < end.timestamp() and start.timestamp() < run["end"] and set(run["sensors"]) & set(stat_ids)
    ]
    if overlapping and not dry_run:
        first = overlapping[0]
        raise ServiceValidationError(
            f"This period overlaps a recalculation made on {_local(first['ran_at'])} for "
            f"{_local(first['start'])} – {_local(first['end'])}. Running again would apply the correction "
            "twice; restore the backup made before that run instead, or choose another period or sensors."
        )
    await recorder.async_block_till_done()

    # Where state history starts; before that only hourly statistics are left.
    states_from = end
    cutoff = _floor(now - timedelta(days=recorder.keep_days), HOUR) + HOUR
    if not statistics_only and max(start, cutoff) < end:
        states_from = await recorder.async_add_executor_job(
            _states_available_from, hass, [manager, previous], max(start, cutoff), end
        )

    replay = Replay()
    if start < states_from:
        await recorder.async_add_executor_job(
            _replay_statistics, hass, manager, previous, keys, start, states_from, replay
        )
    if states_from < end:
        await recorder.async_add_executor_job(
            _replay_states, hass, manager, previous, keys, states_from, end, replay
        )

    # System Earnings always exists: its rows tell when Home Assistant was running, for
    # totals that didn't exist yet during (part of) the period.
    reference = next(
        s.entity_id for s in hass.data[DOMAIN][entry.entry_id] if s._source_key == "system_earnings_rate"  # noqa: SLF001
    )
    recorded = await recorder.async_add_executor_job(
        _read_rows, hass, sorted({*stat_ids, reference}), start, now
    )
    running = _running(recorded.get(reference), start, end)
    plans = {
        s.entity_id: _plan(recorded.get(s.entity_id), replay, s._source_key, start, end, running)  # noqa: SLF001
        for s in sensors
    }

    result: dict[str, Any] = {
        "start": dt_util.as_local(start).isoformat(),
        "end": dt_util.as_local(end).isoformat(),
        "dry_run": dry_run,
        "previous_settings": _differences(config, previous_settings),
        "hours": {
            "exact": len(replay.exact_hours),
            "approximate": len(replay.approximate_hours),
            "skipped": len(replay.skipped_hours),
        },
        "sensors": {entity_id: plan.summary() for entity_id, plan in plans.items()},
    }
    if overlapping:
        result["overlaps_earlier_runs"] = [
            {"ran_at": _local(r["ran_at"]), "start": _local(r["start"]), "end": _local(r["end"])} for r in overlapping
        ]
    if dry_run:
        return result

    # Logged before writing: a run that fails halfway may still have changed rows.
    runs.append({
        "ran_at": dt_util.utcnow().timestamp(), "start": start.timestamp(), "end": end.timestamp(),
        "sensors": stat_ids, "previous_settings": result["previous_settings"],
    })
    await store.async_save(runs)

    await _async_wait_for_quiet_time()
    await recorder.async_block_till_done()
    # Rows compiled while the replay ran come after the window: shift them along.
    latest = await recorder.async_add_executor_job(_read_rows, hass, stat_ids, now - HOUR, dt_util.utcnow())
    metadata = await recorder.async_add_executor_job(_read_metadata, hass, stat_ids)
    for sensor in sensors:
        plan = plans[sensor.entity_id]
        if not plan.total and not plan.long_rows and not plan.short_rows:
            continue
        plan.add_latest(latest.get(sensor.entity_id))
        meta = metadata.get(sensor.entity_id)
        if meta is None:
            continue
        _import(hass, recorder, meta, plan)
        sensor.apply_correction(plan.total, plan.correction_before)
    return result


_SETTING_DEFAULTS = {
    CONF_INVERT_INVERTER_AC: False, CONF_FEED_IN_PENALTY: 0.0, CONF_FEED_IN_PENALTY_PERCENT: 0.0, CONF_ERE_OFFSET: 0.0,
}


def _differences(config: dict[str, Any], previous_settings: dict[str, Any]) -> dict[str, Any]:
    """The previous settings that really differ from the current configuration."""
    return {
        key: value
        for key, value in previous_settings.items()
        if value != config.get(key, _SETTING_DEFAULTS.get(key))
    }


def _local(ts: float) -> str:
    return dt_util.as_local(dt_util.utc_from_timestamp(ts)).strftime("%Y-%m-%d %H:%M")


def _states_available_from(
    hass: HomeAssistant, managers: list[FinancialManager], candidate: datetime, end: datetime
) -> datetime:
    """First whole hour from which every core input has state history."""
    from homeassistant.components.recorder import history

    core = sorted({e for m in managers for e in m.input_entities if e in m._core_inputs})  # noqa: SLF001
    states = history.get_significant_states(
        hass, candidate, min(candidate + CHUNK, end), core,
        include_start_time_state=True, significant_changes_only=False, no_attributes=True,
    )
    first = candidate
    for entity_id in core:
        rows = states.get(entity_id)
        if not rows:
            return end  # no states at all near the start: use statistics throughout
        first = max(first, rows[0].last_updated)
    return min(end, _floor(first, HOUR) + (HOUR if first > candidate else timedelta()))


def _input_unit(hass: HomeAssistant, entity_id: str) -> str | None:
    state = hass.states.get(entity_id)
    return state.attributes.get("unit_of_measurement") if state else None


def _replay_statistics(
    hass: HomeAssistant,
    manager: FinancialManager,
    previous: FinancialManager,
    keys: list[str],
    start: datetime,
    end: datetime,
    replay: Replay,
) -> None:
    """Approximate hours from the inputs' hourly means (see the module docstring)."""
    from homeassistant.components.recorder.statistics import get_metadata, statistics_during_period

    managers = [manager, previous]
    inputs = {e for m in managers for e in m.input_entities}
    stats = statistics_during_period(hass, start, end, inputs, "hour", None, {"mean"})
    units = {sid: meta.get("unit_of_measurement") for sid, (_id, meta) in get_metadata(hass, statistic_ids=inputs).items()}
    means: dict[float, dict[str, float]] = {}
    for entity_id, rows in stats.items():
        for row in rows:
            if row.get("mean") is not None:
                means.setdefault(row["start"], {})[entity_id] = row["mean"]

    hour = start
    while hour < end:
        ts = hour.timestamp()
        values = means.get(ts, {})
        for m in managers:
            for entity_id in m.input_entities:
                m.set_input(entity_id, values.get(entity_id), units.get(entity_id))
        if any(m.paused for m in managers):  # a core input has no mean for this hour
            replay.skipped_hours.add(ts)
            hour += HOUR
            continue
        for m in managers:
            m.compute()
        for key in keys:  # rates × 1 h
            replay.hour_deltas.setdefault(key, {})[ts] = manager.values[key] - previous.values[key]
            replay.hour_previous.setdefault(key, {})[ts] = previous.values[key]
        replay.approximate_hours.add(ts)
        hour += HOUR


class _Integrator:
    """Integrates one manager's rates into 5-minute slots, like CumulativeSensor does live."""

    def __init__(self, manager: FinancialManager, keys: list[str], sign: float, out: dict[str, dict[float, float]]) -> None:
        self.manager, self.keys, self.sign, self.out = manager, keys, sign, out
        self.slot = 0.0  # slot of the interval being integrated, set before each recalculation
        self.previous = {key: 0.0 for key in keys}
        manager.listeners.append(self)

    def __call__(self, delta_hours: float) -> None:
        for key in self.keys:
            if delta_hours > 0:
                bucket = self.out.setdefault(key, {})
                bucket[self.slot] = bucket.get(self.slot, 0.0) + self.sign * self.previous[key] * delta_hours
            self.previous[key] = self.manager.values[key]


def _replay_states(
    hass: HomeAssistant,
    manager: FinancialManager,
    previous: FinancialManager,
    keys: list[str],
    start: datetime,
    end: datetime,
    replay: Replay,
) -> None:
    """Exact replay of every recorded input change, with both settings side by side.

    The current settings' rates add to the slot deltas and the previous settings'
    rates subtract from them, so the slots end up holding the difference.
    """
    from homeassistant.components.recorder import history

    managers = [manager, previous]
    inputs = sorted({e for m in managers for e in m.input_entities})
    units = {e: _input_unit(hass, e) for e in inputs}
    integrators = [
        _Integrator(manager, keys, 1.0, replay.slot_deltas),
        _Integrator(previous, keys, -1.0, replay.slot_deltas),
    ]
    chunk_start = start
    first_chunk = True
    while chunk_start < end:
        chunk_end = min(chunk_start + CHUNK, end)
        states = history.get_significant_states(
            hass, chunk_start, chunk_end, inputs,
            include_start_time_state=True, significant_changes_only=False, no_attributes=True,
        )
        events: list[tuple[float, str | None, float | None]] = []
        for entity_id, rows in states.items():
            for state in rows:
                try:
                    value = float(state.state)
                except ValueError:
                    value = None
                events.append((max(state.last_updated, chunk_start).timestamp(), entity_id, value))
        if first_chunk:
            # Inputs without any state yet are unavailable, as they would be live.
            seen = {e for _t, e, _v in events}
            for m in managers:
                for entity_id in m.input_entities:
                    if entity_id not in seen:
                        m.set_input(entity_id, None, None)
        slot = chunk_start
        while slot <= chunk_end:  # slot boundaries, so no interval spans two slots
            events.append((slot.timestamp(), None, None))
            slot += SLOT
        events.sort(key=lambda event: (event[0], event[1] is None))

        for ts, entity_id, value in events:
            when = dt_util.utc_from_timestamp(ts)
            for m, integrator in zip(managers, integrators):
                if entity_id is not None:
                    m.set_input(entity_id, value, units.get(entity_id))  # no-op for another manager's input
                last = m._last_update  # noqa: SLF001
                integrator.slot = _floor(last, SLOT).timestamp() if last else ts
                m.recalculate(when)
        first_chunk = False
        chunk_start = chunk_end

    hour = start
    while hour < end:
        replay.exact_hours.add(hour.timestamp())
        hour += HOUR
    # Per hour too, for exact hours that have no 5-minute rows to correct slot by slot.
    for key, slots in replay.slot_deltas.items():
        hours = replay.hour_deltas.setdefault(key, {})
        for ts, value in slots.items():
            if ts < end.timestamp():
                hour_ts = ts - ts % HOUR.total_seconds()
                hours[hour_ts] = hours.get(hour_ts, 0.0) + value


def _read_rows(hass: HomeAssistant, stat_ids: list[str], start: datetime, end: datetime) -> dict[str, dict[str, list]]:
    """Recorded rows of the totals, with the row before `start` for the first increase."""
    from homeassistant.components.recorder.statistics import statistics_during_period

    types = {"state", "sum", "last_reset"}
    long = statistics_during_period(hass, start - timedelta(days=7), end, set(stat_ids), "hour", None, types)
    short = statistics_during_period(hass, start - HOUR, end, set(stat_ids), "5minute", None, types)
    return {sid: {"hour": long.get(sid, []), "5minute": short.get(sid, [])} for sid in stat_ids}


def _read_metadata(hass: HomeAssistant, stat_ids: list[str]) -> dict[str, dict[str, Any]]:
    from homeassistant.components.recorder.statistics import get_metadata

    return {sid: dict(meta) for sid, (_id, meta) in get_metadata(hass, statistic_ids=set(stat_ids)).items()}


@dataclass
class Plan:
    """Corrected rows for one total."""

    recorded: float = 0.0  # recorded increase over the recalculated hours
    recalculated: float = 0.0
    total: float = 0.0  # whole correction
    # Approximate hours with previous settings: recorded vs. estimated from the means.
    check_recorded: float | None = None
    check_estimated: float = 0.0
    long_rows: dict[float, dict[str, Any]] = field(default_factory=dict)  # start ts -> corrected row
    short_rows: dict[float, dict[str, Any]] = field(default_factory=dict)
    cumulative: list[tuple[float, float]] = field(default_factory=list)  # (hour end ts, correction so far)

    def summary(self) -> dict[str, Any]:
        summary: dict[str, Any] = {
            "recorded": round(self.recorded, 4),
            "recalculated": round(self.recalculated, 4),
            "correction": round(self.total, 4),
        }
        if self.check_recorded is not None:
            # How well hourly means reproduce the recorded history; the closer, the
            # more the correction of the approximate hours can be trusted.
            summary["approximation_check"] = {
                "recorded": round(self.check_recorded, 4),
                "estimated_with_previous_settings": round(self.check_estimated, 4),
            }
        return summary

    def correction_before(self, when: datetime) -> float:
        ts = when.timestamp()
        before = 0.0
        for hour_end, correction in self.cumulative:
            if hour_end > ts:
                break
            before = correction
        return before

    def add_latest(self, rows: dict[str, list] | None) -> None:
        """Shift rows compiled after the plan was made, which all lie after the window."""
        if not rows or not self.total:
            return
        for table, target in (("hour", self.long_rows), ("5minute", self.short_rows)):
            known = max(target, default=0.0)
            for row in rows[table]:
                if row["start"] > known:
                    target[row["start"]] = _shifted(row, self.total)


def _shifted(row: dict[str, Any], correction: float) -> dict[str, Any]:
    data: dict[str, Any] = {
        "start": dt_util.utc_from_timestamp(row["start"]),
        "state": (row.get("state") or 0.0) + correction,
        "sum": (row.get("sum") or 0.0) + correction,
    }
    if row.get("last_reset") is not None:
        data["last_reset"] = dt_util.utc_from_timestamp(row["last_reset"])
    return data


def _increases(rows: list[dict[str, Any]]) -> dict[float, float]:
    """Recorded increase per row, relative to the previous existing row."""
    increases = {}
    for previous, row in zip(rows, rows[1:]):
        if previous.get("sum") is not None and row.get("sum") is not None:
            increases[row["start"]] = row["sum"] - previous["sum"]
    return increases


@dataclass
class Running:
    """When Home Assistant was running in the period: the hours and 5-minute slots it compiled."""

    hours: set[float] = field(default_factory=set)
    slots: dict[float, list[float]] = field(default_factory=dict)  # hour start ts -> slot start ts


def _running(rows: dict[str, list] | None, start: datetime, end: datetime) -> Running:
    running = Running()
    start_ts, end_ts, hour_s = start.timestamp(), end.timestamp(), HOUR.total_seconds()
    for row in (rows or {}).get("hour", []):
        if start_ts <= row["start"] < end_ts:
            running.hours.add(row["start"])
    for row in (rows or {}).get("5minute", []):
        if start_ts <= row["start"] < end_ts:
            running.slots.setdefault(row["start"] - row["start"] % hour_s, []).append(row["start"])
    return running


def _add_new_rows(rows: dict[str, list], replay: Replay, start: datetime, end: datetime, running: Running) -> dict[str, list]:
    """Rows with nothing recorded, for the hours before a total existed (e.g. one added later).

    Only for hours in which Home Assistant was running (per the reference total), and only
    before the total's first row: a gap in an existing total (Home Assistant was down)
    stays a gap. Each new row starts at 0, so its whole recalculated value is a correction,
    and the plan creates it. The row before the first one is a 0 too, so increases work.
    """
    existing = [r["start"] for table in ("hour", "5minute") for r in rows[table]]
    first = min(existing, default=end.timestamp())
    start_ts, hour_s = start.timestamp(), HOUR.total_seconds()
    if first <= start_ts:
        return rows
    new_hours = [h for h in sorted(running.hours | set(running.slots)) if h + hour_s <= first]
    if not new_hours:
        return rows
    zero = lambda ts: {"start": ts, "state": 0.0, "sum": 0.0, "new": True}  # noqa: E731
    hour = [zero(new_hours[0] - hour_s)] + [zero(h) for h in new_hours if h in running.hours]
    short = [zero(new_hours[0] - SLOT.total_seconds())] + [
        zero(t) for h in new_hours if h in replay.exact_hours for t in running.slots.get(h, [])
    ]
    return {"hour": hour + rows["hour"], "5minute": short + rows["5minute"]}


def _plan(
    rows: dict[str, list] | None, replay: Replay, key: str, start: datetime, end: datetime, running: Running | None = None
) -> Plan:
    plan = Plan()
    if running is not None:
        rows = _add_new_rows(rows or {"hour": [], "5minute": []}, replay, start, end, running)
    if not rows:
        return plan
    start_ts, end_ts, hour_s = start.timestamp(), end.timestamp(), HOUR.total_seconds()
    slot_deltas = replay.slot_deltas.get(key, {})
    deltas = replay.hour_deltas.get(key, {})
    previous_estimates = replay.hour_previous.get(key, {})
    long_increases = _increases(rows["hour"])
    short_increases = _increases(rows["5minute"])

    # Recorded 5-minute rows per hour of the window. Exact hours are corrected slot by
    # slot over these, so the hourly and 5-minute corrections always agree, and slots
    # without a row (Home Assistant was down) never get a correction.
    slots_by_hour: dict[float, list[float]] = {}
    for ts in sorted(short_increases):
        if start_ts <= ts < end_ts:
            slots_by_hour.setdefault(ts - ts % hour_s, []).append(ts)

    hour_delta: dict[float, float] = {}
    hours = {ts for ts in long_increases if start_ts <= ts < end_ts} | set(slots_by_hour)
    for ts in sorted(hours):
        if ts in replay.exact_hours and ts in slots_by_hour:
            old = sum(short_increases[t] for t in slots_by_hour[ts])
            new = old + sum(slot_deltas.get(t, 0.0) for t in slots_by_hour[ts])
        elif ts in long_increases and ts in deltas:
            old = long_increases[ts]
            new = old + deltas[ts]
            if ts in replay.approximate_hours:
                plan.check_recorded = (plan.check_recorded or 0.0) + old
                plan.check_estimated += previous_estimates[ts]
        else:
            continue  # not recalculable: keep what was recorded
        hour_delta[ts] = new - old
        plan.recorded += old
        plan.recalculated += new
        plan.total += new - old
        plan.cumulative.append((ts + hour_s, plan.total))

    # Long-term: each row shifts by the correction up to and including its hour.
    for row in rows["hour"]:
        if row["start"] >= start_ts:
            correction = plan.correction_before(dt_util.utc_from_timestamp(row["start"] + hour_s))
            if correction:
                plan.long_rows[row["start"]] = _shifted(row, correction)

    # Short-term: the correction before the hour, plus the hour's slots so far.
    for row in rows["5minute"]:
        ts = row["start"]
        if ts < start_ts:
            continue
        hour_ts = ts - ts % hour_s
        correction = plan.correction_before(dt_util.utc_from_timestamp(hour_ts))
        if hour_ts >= end_ts:
            correction = plan.total
        elif hour_ts in hour_delta and hour_ts in replay.exact_hours and hour_ts in slots_by_hour:
            correction += sum(slot_deltas.get(t, 0.0) for t in slots_by_hour[hour_ts] if t <= ts)
        elif hour_ts in hour_delta:  # approximate hour: spread its correction evenly
            correction += hour_delta[hour_ts] * ((ts - hour_ts) / SLOT.total_seconds() + 1) / 12
        if correction:
            plan.short_rows[ts] = _shifted(row, correction)
    return plan


def _import(hass: HomeAssistant, recorder: Any, metadata: dict[str, Any], plan: Plan) -> None:
    """Queue the corrected rows; the recorder updates existing rows in place."""
    from homeassistant.components.recorder.db_schema import StatisticsShortTerm
    from homeassistant.components.recorder.statistics import async_import_statistics

    if plan.long_rows:
        async_import_statistics(hass, metadata, [plan.long_rows[ts] for ts in sorted(plan.long_rows)])
    if plan.short_rows:
        try:
            # Not public API: the recorder's own import, pointed at the 5-minute table.
            recorder.async_import_statistics(
                metadata, [plan.short_rows[ts] for ts in sorted(plan.short_rows)], StatisticsShortTerm
            )
        except Exception as err:  # noqa: BLE001 - long-term rows are what matter most
            _LOGGER.warning("Could not correct 5-minute statistics of %s: %s", metadata.get("statistic_id"), err)


async def _async_wait_for_quiet_time() -> None:
    """Stay clear of the recorder's compile, which runs 10 s after every 5 minutes."""
    while True:
        now = dt_util.utcnow()
        into_cycle = (now.minute % 5) * 60 + now.second
        if 40 <= into_cycle <= 270:
            return
        await asyncio.sleep(5)
