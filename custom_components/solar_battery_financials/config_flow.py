"""Config and options flow for Solar & Battery Financials.

Setup: one form with sections (grid & prices, system, export adjustments, devices,
advanced), then device names and device hierarchy when devices are tracked.
Options: a menu (sensors / export prices / devices) so a single change doesn't
require walking through every step. The entity prefix is only set at setup,
because changing it later would change every entity ID.
"""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import section
from homeassistant.helpers import selector

from .const import (
    CONF_BATTERY_SENSOR,
    CONF_DEVICE_NAMES,
    CONF_DEVICE_PARENTS,
    CONF_EXPORT_PRICE_SENSOR,
    CONF_FEED_IN_PENALTY,
    CONF_FEED_IN_PENALTY_PERCENT,
    CONF_GRID_SENSOR,
    CONF_INVERT_INVERTER_AC,
    CONF_INVERTER_AC_SENSOR,
    CONF_PREFIX,
    CONF_PRICE_SENSOR,
    CONF_SOLAR_SENSOR,
    CONF_SUB_DEVICES,
    CONF_TRACKED_DEVICES,
    DEFAULT_FEED_IN_PENALTY,
    DEFAULT_FEED_IN_PENALTY_PERCENT,
    DEFAULT_INVERT_INVERTER_AC,
    DEFAULT_PREFIX,
    DOMAIN,
    POWER_UNIT_FACTORS,
    default_device_name,
)

# Section → keys it contains. Optional keys left empty are saved as None, so a
# cleared field really clears the setting.
GRID_KEYS = (CONF_GRID_SENSOR, CONF_PRICE_SENSOR, CONF_EXPORT_PRICE_SENSOR)
SYSTEM_KEYS = (CONF_SOLAR_SENSOR, CONF_BATTERY_SENSOR, CONF_INVERTER_AC_SENSOR, CONF_INVERT_INVERTER_AC)
EXPORT_KEYS = (CONF_FEED_IN_PENALTY, CONF_FEED_IN_PENALTY_PERCENT)
POWER_KEYS = (CONF_GRID_SENSOR, CONF_SOLAR_SENSOR, CONF_BATTERY_SENSOR, CONF_INVERTER_AC_SENSOR)

PARENT_NONE = "none"  # independent device
PARENT_UNSPECIFIED = "unspecified"  # sub-device of some device that isn't tracked or chosen


def _marker(cfg: dict[str, Any], key: str, required: bool = False, default: Any = None) -> vol.Marker:
    """Required/Optional marker pre-filled with the current value, if any."""
    value = cfg.get(key, default)
    kind = vol.Required if required else vol.Optional
    return kind(key, default=value) if value is not None else kind(key)


def _sensor(multiple: bool = False) -> selector.EntitySelector:
    return selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor", multiple=multiple))


def _number(unit: str, step: float) -> selector.NumberSelector:
    return selector.NumberSelector(
        selector.NumberSelectorConfig(mode=selector.NumberSelectorMode.BOX, step=step, unit_of_measurement=unit)
    )


def _grid_schema(cfg: dict[str, Any]) -> vol.Schema:
    return vol.Schema({
        _marker(cfg, CONF_GRID_SENSOR, required=True): _sensor(),
        _marker(cfg, CONF_PRICE_SENSOR, required=True): _sensor(),
        _marker(cfg, CONF_EXPORT_PRICE_SENSOR): _sensor(),
    })


def _system_schema(cfg: dict[str, Any]) -> vol.Schema:
    return vol.Schema({
        _marker(cfg, CONF_SOLAR_SENSOR): _sensor(),
        _marker(cfg, CONF_BATTERY_SENSOR): _sensor(),
        _marker(cfg, CONF_INVERTER_AC_SENSOR): _sensor(),
        _marker(cfg, CONF_INVERT_INVERTER_AC, default=DEFAULT_INVERT_INVERTER_AC): selector.BooleanSelector(),
    })


def _export_schema(cfg: dict[str, Any]) -> vol.Schema:
    return vol.Schema({
        _marker(cfg, CONF_FEED_IN_PENALTY, default=DEFAULT_FEED_IN_PENALTY): _number("/kWh", 0.001),
        _marker(cfg, CONF_FEED_IN_PENALTY_PERCENT, default=DEFAULT_FEED_IN_PENALTY_PERCENT): _number("%", 0.1),
    })


def _devices_schema(cfg: dict[str, Any]) -> vol.Schema:
    return vol.Schema({_marker(cfg, CONF_TRACKED_DEVICES, default=[]): _sensor(multiple=True)})


def _flatten(user_input: dict[str, Any]) -> dict[str, Any]:
    """Merge section dicts into one flat dict."""
    flat: dict[str, Any] = {}
    for key, value in user_input.items():
        if isinstance(value, dict):
            flat.update(value)
        else:
            flat[key] = value
    return flat


def _with_cleared(values: dict[str, Any], keys: tuple[str, ...]) -> dict[str, Any]:
    """Values for `keys`, with fields left empty stored as None."""
    return {key: values.get(key) for key in keys}


def _validate(hass: HomeAssistant, cfg: dict[str, Any]) -> tuple[dict[str, str], dict[str, str]]:
    """Check units and the inverter sign. Returns (errors, description placeholders)."""
    power_sensors = [cfg.get(k) for k in POWER_KEYS] + list(cfg.get(CONF_TRACKED_DEVICES) or [])
    for entity_id in filter(None, power_sensors):
        state = hass.states.get(entity_id)
        unit = state.attributes.get("unit_of_measurement") if state else None
        if unit is not None and unit not in POWER_UNIT_FACTORS:
            return {"base": "unsupported_unit"}, {"sensor": entity_id, "unit": str(unit)}

    def watts(entity_id: str | None) -> float | None:
        state = hass.states.get(entity_id) if entity_id else None
        try:
            factor = POWER_UNIT_FACTORS.get(state.attributes.get("unit_of_measurement"), 1.0)
            return float(state.state) * factor
        except (AttributeError, TypeError, ValueError):
            return None

    # While the panels produce, the inverter supplies the house: its AC reading should be positive.
    solar, inverter = watts(cfg.get(CONF_SOLAR_SENSOR)), watts(cfg.get(CONF_INVERTER_AC_SENSOR))
    if solar is not None and inverter is not None and solar > 100:
        invert = bool(cfg.get(CONF_INVERT_INVERTER_AC))
        if (inverter < -50 and not invert) or (inverter > 50 and invert):
            return {"base": "inverter_sign"}, {}
    return {}, {}


class DeviceStepsMixin:
    """Shared device steps: names, then hierarchy (which device each one is part of)."""

    flow_data: dict[str, Any]

    def _current(self) -> dict[str, Any]:
        """Existing configuration (empty during first setup)."""
        return {}

    def _finish(self) -> ConfigFlowResult:
        raise NotImplementedError

    def _devices(self) -> list[str]:
        return list(self.flow_data.get(CONF_TRACKED_DEVICES) or [])

    def _name(self, device: str) -> str:
        return self.flow_data.get(CONF_DEVICE_NAMES, {}).get(device) or default_device_name(device)

    def _labels(self) -> dict[str, str]:
        """Unique field label per device (its name, plus the entity ID if names collide)."""
        names = {d: self._name(d) for d in self._devices()}
        counts: dict[str, int] = {}
        for name in names.values():
            counts[name] = counts.get(name, 0) + 1
        return {d: (n if counts[n] == 1 else f"{n} ({d})") for d, n in names.items()}

    async def async_step_device_names(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Friendly names for the tracked devices."""
        if user_input is not None:
            self.flow_data[CONF_DEVICE_NAMES] = {d: n.strip() for d, n in user_input.items() if n and n.strip()}
            return await self.async_step_device_parents()
        existing = self._current().get(CONF_DEVICE_NAMES, {})
        schema = {
            vol.Optional(d, description={"suggested_value": existing.get(d, default_device_name(d))}): str
            for d in self._devices()
        }
        return self.async_show_form(step_id="device_names", data_schema=vol.Schema(schema), last_step=False)

    async def async_step_device_parents(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """For each device: independent, or part of another (tracked) device."""
        devices = self._devices()
        labels = self._labels()
        errors: dict[str, str] = {}
        if user_input is not None:
            choice = {d: user_input.get(labels[d], PARENT_NONE) for d in devices}
            parents = {d: p for d, p in choice.items() if p not in (PARENT_NONE, PARENT_UNSPECIFIED)}
            if any(choice.get(p) != PARENT_NONE for p in parents.values()):
                errors["base"] = "parent_not_independent"  # one level only: parents must be independent
            else:
                self.flow_data[CONF_SUB_DEVICES] = [d for d, p in choice.items() if p != PARENT_NONE]
                self.flow_data[CONF_DEVICE_PARENTS] = parents
                return self._finish()

        current = self._current()
        subs = set(current.get(CONF_SUB_DEVICES) or [])
        known_parents = current.get(CONF_DEVICE_PARENTS) or {}
        defaults = {}
        for device in devices:
            parent = known_parents.get(device)
            defaults[device] = parent if parent in devices else PARENT_UNSPECIFIED if device in subs else PARENT_NONE
        if user_input is not None:  # keep the user's choices when showing an error
            defaults.update({d: user_input.get(labels[d], defaults[d]) for d in devices})
        # Only devices that are currently independent can be chosen as a parent.
        candidates = [d for d in devices if defaults[d] == PARENT_NONE]
        schema: dict[vol.Marker, Any] = {}
        for device in devices:
            default = defaults[device]
            options = [
                selector.SelectOptionDict(value=PARENT_NONE, label="Independent"),
                selector.SelectOptionDict(value=PARENT_UNSPECIFIED, label="Part of another device (not specified)"),
            ] + [
                selector.SelectOptionDict(value=other, label=f"Part of {labels[other]}")
                for other in candidates
                if other != device
            ]
            schema[vol.Required(labels[device], default=default)] = selector.SelectSelector(
                selector.SelectSelectorConfig(options=options, mode=selector.SelectSelectorMode.DROPDOWN)
            )
        return self.async_show_form(
            step_id="device_parents", data_schema=vol.Schema(schema), errors=errors, last_step=True
        )


class SolarBatteryFinancialsConfigFlow(DeviceStepsMixin, config_entries.ConfigFlow, domain=DOMAIN):
    """Initial setup."""

    VERSION = 2

    def __init__(self) -> None:
        self.flow_data: dict[str, Any] = {}

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> SolarBatteryFinancialsOptionsFlow:
        return SolarBatteryFinancialsOptionsFlow()

    def _finish(self) -> ConfigFlowResult:
        return self.async_create_entry(title="Solar & Battery Financials", data=self.flow_data)

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        placeholders: dict[str, str] = {}
        cfg: dict[str, Any] = {}
        if user_input is not None:
            cfg = _flatten(user_input)
            errors, placeholders = _validate(self.hass, cfg)
            if not errors:
                self.flow_data = {
                    **_with_cleared(cfg, GRID_KEYS + SYSTEM_KEYS + EXPORT_KEYS),
                    CONF_TRACKED_DEVICES: cfg.get(CONF_TRACKED_DEVICES) or [],
                    CONF_PREFIX: cfg.get(CONF_PREFIX) or DEFAULT_PREFIX,
                }
                if self._devices():
                    return await self.async_step_device_names()
                return self._finish()

        schema = vol.Schema({
            vol.Required("grid"): section(_grid_schema(cfg), {"collapsed": False}),
            vol.Required("system"): section(_system_schema(cfg), {"collapsed": False}),
            vol.Required("export"): section(_export_schema(cfg), {"collapsed": True}),
            vol.Required("devices"): section(_devices_schema(cfg), {"collapsed": False}),
            vol.Required("advanced"): section(
                vol.Schema({_marker(cfg, CONF_PREFIX, default=DEFAULT_PREFIX): str}), {"collapsed": True}
            ),
        })
        return self.async_show_form(
            step_id="user", data_schema=schema, errors=errors, description_placeholders=placeholders,
            last_step=False,  # device steps usually follow
        )


class SolarBatteryFinancialsOptionsFlow(DeviceStepsMixin, OptionsFlow):
    """Change settings later, one area at a time."""

    def __init__(self) -> None:
        self.flow_data: dict[str, Any] = {}

    def _current(self) -> dict[str, Any]:
        return {**self.config_entry.data, **self.config_entry.options}

    def _save(self, changes: dict[str, Any]) -> ConfigFlowResult:
        return self.async_create_entry(data={**self.config_entry.options, **changes})

    def _finish(self) -> ConfigFlowResult:
        return self._save(self.flow_data)

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        return self.async_show_menu(step_id="init", menu_options=["sensors", "export", "devices"])

    async def async_step_sensors(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        placeholders: dict[str, str] = {}
        cfg = self._current()
        if user_input is not None:
            changes = _with_cleared(_flatten(user_input), GRID_KEYS + SYSTEM_KEYS)
            errors, placeholders = _validate(self.hass, {**cfg, **changes})
            if not errors:
                return self._save(changes)
            cfg = {**cfg, **changes}
        schema = vol.Schema({
            vol.Required("grid"): section(_grid_schema(cfg), {"collapsed": False}),
            vol.Required("system"): section(_system_schema(cfg), {"collapsed": False}),
        })
        return self.async_show_form(
            step_id="sensors", data_schema=schema, errors=errors, description_placeholders=placeholders
        )

    async def async_step_export(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self._save(_with_cleared(user_input, EXPORT_KEYS))
        return self.async_show_form(step_id="export", data_schema=_export_schema(self._current()))

    async def async_step_devices(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        placeholders: dict[str, str] = {}
        if user_input is not None:
            devices = user_input.get(CONF_TRACKED_DEVICES) or []
            errors, placeholders = _validate(self.hass, {CONF_TRACKED_DEVICES: devices})
            if not errors:
                self.flow_data = {CONF_TRACKED_DEVICES: devices}
                if devices:
                    return await self.async_step_device_names()
                return self._save({CONF_TRACKED_DEVICES: [], CONF_DEVICE_NAMES: {}, CONF_SUB_DEVICES: [], CONF_DEVICE_PARENTS: {}})
        return self.async_show_form(
            step_id="devices", data_schema=_devices_schema(self._current()), errors=errors,
            description_placeholders=placeholders, last_step=False,
        )
