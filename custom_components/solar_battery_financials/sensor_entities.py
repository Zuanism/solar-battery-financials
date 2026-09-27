"""Sensor entities for Solar & Battery Financials.

Two entity types, both configured by descriptions (see sensor.py):
- RateSensor: an instantaneous value from FinancialManager (power, cost rates).
- CumulativeSensor: the running total (integral) of a rate, with today / this
  week / this month / this year exposed as unrecorded attributes.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.restore_state import RestoredExtraData, RestoreEntity
import homeassistant.util.dt as dt_util

from .const import DOMAIN, PERIOD_ATTRIBUTES

if TYPE_CHECKING:
    from .manager import FinancialManager

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True, kw_only=True)
class SbfSensorDescription(SensorEntityDescription):
    """Describes a sensor. `key` is the FinancialManager.values key it reads.

    `unit` may contain "{currency}", filled in from the Home Assistant config.
    """

    unit: str
    group: str  # device group: "system" or "house"
    expose_config: bool = False  # add the integration's config as attributes
    precision: int = 4  # decimals kept; fewer decimals means fewer recorded changes
    requires_inverter_ac: bool = False  # only meaningful with an inverter AC sensor


@dataclass(frozen=True)
class SbfDevice:
    """Device an entity is grouped under."""

    identifier: str
    name: str

    @property
    def info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, self.identifier)},
            name=self.name,
            manufacturer="Solar & Battery Financials",
        )


class SbfSensorBase(SensorEntity):
    """Shared setup: naming, IDs, device, unit and change-only writes."""

    _attr_should_poll = False

    def __init__(
        self,
        manager: FinancialManager,
        *,
        name: str,
        unique_id: str,
        entity_id: str,
        unit: str,
        device: SbfDevice,
        source_entity: str | None = None,
    ) -> None:
        self.manager = manager
        self._attr_name = name
        self._attr_unique_id = unique_id
        self.entity_id = entity_id
        self._attr_native_unit_of_measurement = unit
        self._attr_device_info = device.info
        self._source_entity = source_entity
        self._last_written: Any = None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"source_entity_id": self._source_entity} if self._source_entity else {}

    def _snapshot(self) -> Any:
        """What must change for a write to be worth recording."""
        return self.native_value

    @callback
    def _write_if_changed(self) -> None:
        snapshot = self._snapshot()
        if snapshot != self._last_written:
            self._last_written = snapshot
            self.async_write_ha_state()


class RateSensor(SbfSensorBase):
    """Instantaneous value from FinancialManager, written on the rate timer."""

    entity_description: SbfSensorDescription

    def __init__(
        self,
        manager: FinancialManager,
        description: SbfSensorDescription,
        prefix: str,
        device: SbfDevice,
        currency: str,
    ) -> None:
        super().__init__(
            manager,
            name=str(description.name),
            unique_id=f"{prefix}{description.key}",
            entity_id=f"sensor.{prefix}{description.key}",
            unit=description.unit.format(currency=currency),
            device=device,
        )
        self.entity_description = description

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.manager.rate_writers.append(self._write_if_changed)
        self.async_on_remove(lambda: self.manager.rate_writers.remove(self._write_if_changed))

    @property
    def available(self) -> bool:
        return not self.manager.paused

    def _snapshot(self) -> Any:
        return (self.native_value, self.available)

    @property
    def native_value(self) -> float:
        desc = self.entity_description
        return round(self.manager.values[desc.key], desc.precision)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        if not self.entity_description.expose_config:
            return {}
        m = self.manager
        return {
            "tracked_devices": m.tracked_devices,
            "device_names": m.device_names,
            "sub_devices": m.sub_devices,
            "device_parents": m.device_parents,
            "grid_sensor": m.grid_id,
            "solar_sensor": m.solar_id,
            "battery_sensor": m.battery_id,
            "price_sensor": m.price_id,
            "export_price_sensor": m.export_price_id,
        }


def _period_start(period: str, now: datetime) -> datetime:
    """Start (local midnight) of the calendar period that `now` falls in."""
    day = now.date()
    if period == "this_week":
        day -= timedelta(days=day.weekday())
    elif period == "this_month":
        day = day.replace(day=1)
    elif period == "this_year":
        day = day.replace(month=1, day=1)
    return dt_util.start_of_local_day(day)


def _period_key(period: str, now: datetime) -> str:
    """Identify the calendar period (in local time) that `now` falls in."""
    if period == "today":
        return now.date().isoformat()
    if period == "this_week":
        year, week, _ = now.isocalendar()
        return f"{year}-W{week:02d}"
    if period == "this_month":
        return f"{now.year}-{now.month:02d}"
    return str(now.year)


class CumulativeSensor(SbfSensorBase, RestoreEntity):
    """Running total (integral) of a rate from FinancialManager.

    Integrates on every recalculation but writes on the manager's total timer.
    The period attributes are excluded from the recorder (they are derivable
    from this sensor's long-term statistics) and survive restarts through the
    restore-state cache, together with the full-precision total.
    """

    _attr_state_class = SensorStateClass.TOTAL
    _unrecorded_attributes = frozenset(PERIOD_ATTRIBUTES)

    def __init__(
        self,
        manager: FinancialManager,
        *,
        name: str,
        source_key: str,
        unique_id: str,
        entity_id: str,
        unit: str,
        device_class: SensorDeviceClass,
        device: SbfDevice,
        source_entity: str | None = None,
    ) -> None:
        super().__init__(
            manager,
            name=name,
            unique_id=unique_id,
            entity_id=entity_id,
            unit=unit,
            device=device,
            source_entity=source_entity,
        )
        self._attr_device_class = device_class
        self._source_key = source_key
        self._state = 0.0
        self._previous_rate = 0.0
        # Running total at the start of each current period, and which period that is.
        self._baselines: dict[str, float] = {}
        self._period_keys: dict[str, str] = {}
        # Whether the baselines were checked against long-term statistics. Entries
        # restored from before this existed (or from a fresh install) get checked once.
        self._seeded = False

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        extra = await self.async_get_last_extra_data()
        extra_data = extra.as_dict() if extra else {}

        if isinstance(extra_data.get("total"), (int, float)):
            self._state = float(extra_data["total"])
        elif (state := await self.async_get_last_state()) is not None:
            try:
                self._state = float(state.state)
            except ValueError:
                pass

        now = dt_util.now()
        saved_baselines = extra_data.get("baselines") or {}
        saved_keys = extra_data.get("period_keys") or {}
        for period in PERIOD_ATTRIBUTES:
            key = _period_key(period, now)
            if saved_keys.get(period) == key and isinstance(saved_baselines.get(period), (int, float)):
                self._baselines[period] = float(saved_baselines[period])
            else:  # new sensor, or the period rolled over while Home Assistant was down
                self._baselines[period] = self._state
            self._period_keys[period] = key

        self._seeded = extra_data.get("seeded") is True
        if not self._seeded:
            self.hass.async_create_task(self._async_seed_baselines())

        self._previous_rate = self.manager.values[self._source_key]
        self.manager.listeners.append(self._integrate)
        self.manager.total_writers.append(self._write_if_changed)
        self.async_on_remove(lambda: self.manager.listeners.remove(self._integrate))
        self.async_on_remove(lambda: self.manager.total_writers.remove(self._write_if_changed))

    async def _async_seed_baselines(self) -> None:
        """Derive the period baselines from this sensor's long-term statistics.

        Without saved baselines (after an upgrade, or on a first run) the current
        periods would otherwise only count from the moment Home Assistant started.
        """
        try:
            from homeassistant.components.recorder import get_instance
            from homeassistant.components.recorder.statistics import statistic_during_period

            now = dt_util.now()
            changes = {}
            for period in PERIOD_ATTRIBUTES:
                result = await get_instance(self.hass).async_add_executor_job(
                    statistic_during_period,
                    self.hass,
                    _period_start(period, now),
                    None,
                    self.entity_id,
                    {"change"},
                    None,
                )
                changes[period] = (result or {}).get("change")
        except Exception as err:  # noqa: BLE001 - keep the restored baselines
            _LOGGER.debug("Could not read statistics for %s: %s", self.entity_id, err)
            return
        for period, change in changes.items():
            if isinstance(change, (int, float)):
                self._baselines[period] = self._state - change
        self._seeded = True
        self.async_write_ha_state()

    @callback
    def _integrate(self, delta_hours: float) -> None:
        if delta_hours > 0:
            self._state += self._previous_rate * delta_hours
        self._previous_rate = self.manager.values[self._source_key]
        now = dt_util.now()
        for period in PERIOD_ATTRIBUTES:
            key = _period_key(period, now)
            if self._period_keys.get(period) != key:
                self._period_keys[period] = key
                self._baselines[period] = self._state

    def _period_values(self) -> dict[str, float]:
        return {
            period: round(self._state - self._baselines.get(period, self._state), 4)
            for period in PERIOD_ATTRIBUTES
        }

    def _snapshot(self) -> Any:
        return (self.native_value, tuple(self._period_values().values()))

    @property
    def native_value(self) -> float:
        return round(self._state, 4)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {**super().extra_state_attributes, **self._period_values()}

    @property
    def extra_restore_state_data(self) -> RestoredExtraData:
        return RestoredExtraData(
            {
                "total": self._state,
                "baselines": dict(self._baselines),
                "period_keys": dict(self._period_keys),
                "seeded": self._seeded,
            }
        )
