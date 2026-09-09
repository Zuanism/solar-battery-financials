"""Config flow for Solar & Battery Financials integration."""
from __future__ import annotations

from typing import Any

from homeassistant import config_entries, core
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector
import voluptuous as vol

from .const import (
    CONF_BATTERY_SENSOR,
    CONF_EXPORT_PRICE_SENSOR,
    CONF_FEED_IN_PENALTY,
    CONF_FEED_IN_PENALTY_PERCENT,
    CONF_GENERATE_RATE_SENSORS,
    CONF_GRID_SENSOR,
    CONF_INVERTER_AC_SENSOR,
    CONF_PREFIX,
    CONF_PRICE_SENSOR,
    CONF_SOLAR_SENSOR,
    CONF_TRACKED_DEVICES,
    DEFAULT_FEED_IN_PENALTY,
    DEFAULT_FEED_IN_PENALTY_PERCENT,
    DEFAULT_GENERATE_RATE_SENSORS,
    DEFAULT_PREFIX,
    DOMAIN,
)


def _entity_field(
    config: dict[str, Any], key: str, required: bool = False, multiple: bool = False
) -> tuple[vol.Marker, selector.EntitySelector]:
    """Build an EntitySelector field tuple with appropriate default value."""
    selector_cfg = selector.EntitySelectorConfig(domain="sensor", multiple=multiple)
    default = [] if multiple else None
    val = config.get(key, default if multiple else None)
    if required:
        marker = vol.Required(key, default=val) if val is not None else vol.Required(key)
    else:
        marker = vol.Optional(key, default=val) if val is not None else vol.Optional(key)
    return marker, selector.EntitySelector(selector_cfg)


def _float_field(
    config: dict[str, Any], key: str, default: float
) -> tuple[vol.Optional, Any]:
    """Build a Coerce(float) field tuple with appropriate default value."""
    val = config.get(key, default)
    return vol.Optional(key, default=val), vol.Coerce(float)


def _str_field(
    config: dict[str, Any], key: str, default: str
) -> tuple[vol.Optional, type]:
    """Build a string field tuple with appropriate default value."""
    val = config.get(key, default)
    return vol.Optional(key, default=val), str


def _bool_field(
    config: dict[str, Any], key: str, default: bool
) -> tuple[vol.Optional, type]:
    """Build a boolean field tuple with appropriate default value."""
    val = config.get(key, default)
    return vol.Optional(key, default=val), bool


def build_config_schema(config: dict[str, Any] | None = None) -> vol.Schema:
    """Construct schema for main options/config step, reusing existing values if present."""
    cfg = config or {}
    fields = [
        _entity_field(cfg, CONF_GRID_SENSOR, required=True),
        _entity_field(cfg, CONF_SOLAR_SENSOR),
        _entity_field(cfg, CONF_BATTERY_SENSOR),
        _entity_field(cfg, CONF_INVERTER_AC_SENSOR),
        _entity_field(cfg, CONF_PRICE_SENSOR, required=True),
        _entity_field(cfg, CONF_EXPORT_PRICE_SENSOR),
        _float_field(cfg, CONF_FEED_IN_PENALTY, DEFAULT_FEED_IN_PENALTY),
        _float_field(cfg, CONF_FEED_IN_PENALTY_PERCENT, DEFAULT_FEED_IN_PENALTY_PERCENT),
        _str_field(cfg, CONF_PREFIX, DEFAULT_PREFIX),
        _bool_field(cfg, CONF_GENERATE_RATE_SENSORS, DEFAULT_GENERATE_RATE_SENSORS),
        _entity_field(cfg, CONF_TRACKED_DEVICES, multiple=True),
    ]
    return vol.Schema(dict(fields))


class DeviceConfigStepMixin:
    """Shared flow steps for configuring device custom names and sub-device exclusions."""

    flow_data: dict[str, Any]

    @property
    def existing_config(self) -> dict[str, Any]:
        """Return existing configuration/options dictionary."""
        return {}

    def _finish_flow(self) -> FlowResult:
        """Complete the flow; implemented by subclass."""
        raise NotImplementedError

    async def async_step_device_names(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Allow user to provide human-friendly names for tracked devices."""
        if user_input is not None:
            self.flow_data["device_names"] = user_input
            return await self.async_step_sub_devices()

        existing_names = self.existing_config.get("device_names", {})
        schema_dict: dict[vol.Marker, type] = {}
        for device_id in self.flow_data.get(CONF_TRACKED_DEVICES, []):
            default_name = existing_names.get(
                device_id,
                device_id.replace("sensor.", "").replace("_power", "").replace("_", " ").title(),
            )
            schema_dict[vol.Optional(device_id, description={"suggested_value": default_name})] = str

        return self.async_show_form(step_id="device_names", data_schema=vol.Schema(schema_dict))

    async def async_step_sub_devices(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Allow user to designate tracked devices as sub-devices (excluded from untracked calculation)."""
        if user_input is not None:
            self.flow_data["sub_devices"] = user_input.get("sub_devices", [])
            return self._finish_flow()

        tracked_devices = self.flow_data.get(CONF_TRACKED_DEVICES, [])
        options = [
            selector.SelectOptionDict(
                value=dev_id,
                label=self.flow_data.get("device_names", {}).get(dev_id, dev_id),
            )
            for dev_id in tracked_devices
        ]

        existing_subs = self.existing_config.get("sub_devices", [])
        valid_subs = [d for d in existing_subs if d in tracked_devices]

        schema_dict = {
            vol.Optional("sub_devices", default=valid_subs): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=options,
                    multiple=True,
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            )
        }
        return self.async_show_form(step_id="sub_devices", data_schema=vol.Schema(schema_dict))


class SolarBatteryFinancialsOptionsFlowHandler(
    DeviceConfigStepMixin, config_entries.OptionsFlowWithConfigEntry
):
    """Handle options flow for Solar & Battery Financials."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        super().__init__(config_entry)
        self.flow_data: dict[str, Any] = {}

    @property
    def existing_config(self) -> dict[str, Any]:
        cfg = dict(self.config_entry.data)
        cfg.update(self.config_entry.options or {})
        return cfg

    def _finish_flow(self) -> FlowResult:
        return self.async_create_entry(title="", data=self.flow_data)

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage integration options."""
        if user_input is not None:
            self.flow_data = dict(self.config_entry.options)
            self.flow_data.update(user_input)
            if self.flow_data.get(CONF_TRACKED_DEVICES):
                return await self.async_step_device_names()
            self.flow_data["device_names"] = {}
            return self._finish_flow()

        return self.async_show_form(
            step_id="init", data_schema=build_config_schema(self.existing_config)
        )


class SolarBatteryFinancialsConfigFlow(
    DeviceConfigStepMixin, config_entries.ConfigFlow, domain=DOMAIN
):
    """Handle a config flow for Solar & Battery Financials."""

    VERSION = 1

    def __init__(self) -> None:
        self.flow_data: dict[str, Any] = {}

    @property
    def existing_config(self) -> dict[str, Any]:
        return {}

    def _finish_flow(self) -> FlowResult:
        return self.async_create_entry(
            title="Solar & Battery Financials", data=self.flow_data
        )

    @staticmethod
    @core.callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> SolarBatteryFinancialsOptionsFlowHandler:
        """Get the options flow for this handler."""
        return SolarBatteryFinancialsOptionsFlowHandler(config_entry)

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial user step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            self.flow_data.update(user_input)
            if self.flow_data.get(CONF_TRACKED_DEVICES):
                return await self.async_step_device_names()
            self.flow_data["device_names"] = {}
            return self._finish_flow()

        return self.async_show_form(
            step_id="user", data_schema=build_config_schema(), errors=errors
        )
