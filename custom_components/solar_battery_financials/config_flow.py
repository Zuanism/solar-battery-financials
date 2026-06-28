import voluptuous as vol
from homeassistant import config_entries, core
from homeassistant.helpers import selector

from .const import (
    DOMAIN,
    CONF_GRID_SENSOR,
    CONF_SOLAR_SENSOR,
    CONF_BATTERY_SENSOR,
    CONF_INVERTER_AC_SENSOR,
    CONF_PRICE_SENSOR,
    CONF_EXPORT_PRICE_SENSOR,
    CONF_FEED_IN_PENALTY,
    CONF_FEED_IN_PENALTY_PERCENT,
    CONF_PREFIX,
    CONF_TRACKED_DEVICES,
    DEFAULT_FEED_IN_PENALTY,
    DEFAULT_FEED_IN_PENALTY_PERCENT,
    DEFAULT_PREFIX,
)

class SolarBatteryFinancialsOptionsFlowHandler(config_entries.OptionsFlowWithConfigEntry):
    """Handle options flow for Solar & Battery Financials."""
    
    def __init__(self, config_entry):
        super().__init__(config_entry)
        self.options_data = {}

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            self.options_data = dict(self.config_entry.options)
            self.options_data.update(user_input)
            if self.options_data.get(CONF_TRACKED_DEVICES):
                return await self.async_step_device_names()
            else:
                self.options_data["device_names"] = {}
                return self.async_create_entry(title="", data=self.options_data)

        config = dict(self.config_entry.data)
        config.update(self.config_entry.options or {})

        schema_dict = {}

        for key in [CONF_GRID_SENSOR, CONF_PRICE_SENSOR]:
            val = config.get(key)
            if val is not None:
                schema_dict[vol.Required(key, default=val)] = selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                )
            else:
                schema_dict[vol.Required(key)] = selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                )
                
        for key in [CONF_SOLAR_SENSOR, CONF_BATTERY_SENSOR, CONF_EXPORT_PRICE_SENSOR]:
            val = config.get(key)
            if val is not None:
                schema_dict[vol.Optional(key, default=val)] = selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                )
            else:
                schema_dict[vol.Optional(key)] = selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                )

        inv_ac = config.get(CONF_INVERTER_AC_SENSOR)
        if inv_ac is not None:
            schema_dict[vol.Optional(CONF_INVERTER_AC_SENSOR, default=inv_ac)] = selector.EntitySelector(
                selector.EntitySelectorConfig(domain="sensor")
            )
        else:
            schema_dict[vol.Optional(CONF_INVERTER_AC_SENSOR)] = selector.EntitySelector(
                selector.EntitySelectorConfig(domain="sensor")
            )

        penalty = config.get(CONF_FEED_IN_PENALTY)
        if penalty is not None:
            schema_dict[vol.Optional(CONF_FEED_IN_PENALTY, default=penalty)] = vol.Coerce(float)
        else:
            schema_dict[vol.Optional(CONF_FEED_IN_PENALTY, default=DEFAULT_FEED_IN_PENALTY)] = vol.Coerce(float)

        penalty_pct = config.get(CONF_FEED_IN_PENALTY_PERCENT)
        if penalty_pct is not None:
            schema_dict[vol.Optional(CONF_FEED_IN_PENALTY_PERCENT, default=penalty_pct)] = vol.Coerce(float)
        else:
            schema_dict[vol.Optional(CONF_FEED_IN_PENALTY_PERCENT, default=DEFAULT_FEED_IN_PENALTY_PERCENT)] = vol.Coerce(float)

        prefix = config.get(CONF_PREFIX)
        if prefix is not None:
            schema_dict[vol.Optional(CONF_PREFIX, default=prefix)] = str
        else:
            schema_dict[vol.Optional(CONF_PREFIX, default=DEFAULT_PREFIX)] = str

        tracked_devices = config.get(CONF_TRACKED_DEVICES, [])
        schema_dict[vol.Optional(CONF_TRACKED_DEVICES, default=tracked_devices)] = selector.EntitySelector(
            selector.EntitySelectorConfig(domain="sensor", multiple=True)
        )

        data_schema = vol.Schema(schema_dict)

        return self.async_show_form(
            step_id="init", data_schema=data_schema
        )

    async def async_step_device_names(self, user_input=None):
        if user_input is not None:
            self.options_data["device_names"] = user_input
            return await self.async_step_sub_devices()

        schema_dict = {}
        existing_names = self.config_entry.options.get("device_names", {})
        if not existing_names:
            existing_names = self.config_entry.data.get("device_names", {})

        for device_id in self.options_data.get(CONF_TRACKED_DEVICES, []):
            default_name = existing_names.get(
                device_id, 
                device_id.replace("sensor.", "").replace("_power", "").replace("_", " ").title()
            )
            schema_dict[vol.Required(device_id, default=default_name)] = str

        return self.async_show_form(step_id="device_names", data_schema=vol.Schema(schema_dict))

    async def async_step_sub_devices(self, user_input=None):
        if user_input is not None:
            self.options_data["sub_devices"] = user_input.get("sub_devices", [])
            return self.async_create_entry(title="", data=self.options_data)
            
        options = []
        for dev_id in self.options_data.get(CONF_TRACKED_DEVICES, []):
            name = self.options_data["device_names"].get(dev_id, dev_id)
            options.append(selector.SelectOptionDict(value=dev_id, label=name))
            
        existing_sub_devices = self.config_entry.options.get("sub_devices", [])
        if not existing_sub_devices:
            existing_sub_devices = self.config_entry.data.get("sub_devices", [])
            
        valid_subs = [d for d in existing_sub_devices if d in self.options_data.get(CONF_TRACKED_DEVICES, [])]

        schema_dict = {
            vol.Optional("sub_devices", default=valid_subs): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=options,
                    multiple=True,
                    mode=selector.SelectSelectorMode.DROPDOWN
                )
            )
        }
        
        return self.async_show_form(step_id="sub_devices", data_schema=vol.Schema(schema_dict))

class SolarBatteryFinancialsConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Solar & Battery Financials."""

    VERSION = 1

    def __init__(self):
        self.config_data = {}

    @staticmethod
    @core.callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return SolarBatteryFinancialsOptionsFlowHandler(config_entry)

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            self.config_data.update(user_input)
            if self.config_data.get(CONF_TRACKED_DEVICES):
                return await self.async_step_device_names()
            else:
                self.config_data["device_names"] = {}
                return self.async_create_entry(title="Solar & Battery Financials", data=self.config_data)

        data_schema = vol.Schema(
            {
                vol.Required(CONF_GRID_SENSOR): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(CONF_SOLAR_SENSOR): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(CONF_BATTERY_SENSOR): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(CONF_INVERTER_AC_SENSOR): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Required(CONF_PRICE_SENSOR): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(CONF_EXPORT_PRICE_SENSOR): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(CONF_FEED_IN_PENALTY, default=DEFAULT_FEED_IN_PENALTY): vol.Coerce(float),
                vol.Optional(CONF_FEED_IN_PENALTY_PERCENT, default=DEFAULT_FEED_IN_PENALTY_PERCENT): vol.Coerce(float),
                vol.Optional(CONF_PREFIX, default=DEFAULT_PREFIX): str,
                vol.Optional(CONF_TRACKED_DEVICES, default=[]): selector.EntitySelector(
                    selector.EntitySelectorConfig(domain="sensor", multiple=True)
                ),
            }
        )

        return self.async_show_form(
            step_id="user", data_schema=data_schema, errors=errors
        )

    async def async_step_device_names(self, user_input=None):
        if user_input is not None:
            self.config_data["device_names"] = user_input
            return await self.async_step_sub_devices()

        schema_dict = {}
        for device_id in self.config_data.get(CONF_TRACKED_DEVICES, []):
            default_name = device_id.replace("sensor.", "").replace("_power", "").replace("_", " ").title()
            schema_dict[vol.Required(device_id, default=default_name)] = str

        return self.async_show_form(step_id="device_names", data_schema=vol.Schema(schema_dict))

    async def async_step_sub_devices(self, user_input=None):
        if user_input is not None:
            self.config_data["sub_devices"] = user_input.get("sub_devices", [])
            return self.async_create_entry(title="Solar & Battery Financials", data=self.config_data)
            
        options = []
        for dev_id in self.config_data.get(CONF_TRACKED_DEVICES, []):
            name = self.config_data["device_names"].get(dev_id, dev_id)
            options.append(selector.SelectOptionDict(value=dev_id, label=name))
            
        schema_dict = {
            vol.Optional("sub_devices", default=[]): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=options,
                    multiple=True,
                    mode=selector.SelectSelectorMode.DROPDOWN
                )
            )
        }
        
        return self.async_show_form(step_id="sub_devices", data_schema=vol.Schema(schema_dict))
