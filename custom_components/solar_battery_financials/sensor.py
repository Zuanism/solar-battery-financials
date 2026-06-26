import logging
from datetime import timedelta
from homeassistant.components.sensor import SensorEntity, SensorDeviceClass, SensorStateClass
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers import entity_registry as er
from homeassistant.core import HomeAssistant, callback
import homeassistant.util.dt as dt_util
import re

from .const import (
    DOMAIN,
    CONF_GRID_SENSOR,
    CONF_SOLAR_SENSOR,
    CONF_BATTERY_SENSOR,
    CONF_PRICE_SENSOR,
    CONF_FEED_IN_PENALTY,
    CONF_FEED_IN_PENALTY_PERCENT,
    CONF_PREFIX,
    CONF_INVERTER_AC_SENSOR,
    CONF_TRACKED_DEVICES,
)

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up the sensors."""
    config = {**config_entry.data, **config_entry.options}

    grid_sensor = config[CONF_GRID_SENSOR]
    solar_sensor = config.get(CONF_SOLAR_SENSOR)
    battery_sensor = config.get(CONF_BATTERY_SENSOR)
    price_sensor = config[CONF_PRICE_SENSOR]
    penalty = config.get(CONF_FEED_IN_PENALTY, 0.0)
    penalty_pct = config.get(CONF_FEED_IN_PENALTY_PERCENT, 0.0)
    prefix = config.get(CONF_PREFIX, "sbf_")
    inverter_ac_sensor = config.get(CONF_INVERTER_AC_SENSOR)
    tracked_devices = config.get(CONF_TRACKED_DEVICES, [])
    device_names = config.get("device_names", {})
    sub_devices = config.get("sub_devices", [])

    manager = FinancialManager(
        hass, grid_sensor, solar_sensor, battery_sensor, price_sensor, penalty, penalty_pct, inverter_ac_sensor, tracked_devices, sub_devices
    )

    sys_id = f"{prefix}system_financials"
    sys_name = "System Financials"
    house_id = f"{prefix}house_untracked"
    house_name = "House & Untracked"

    sensors = [
        TotalPowerSensor(manager, prefix, device_id_suffix=sys_id, device_name=sys_name),
        TotalCostRateSensor(manager, prefix, device_id_suffix=sys_id, device_name=sys_name),
        NetGridCostRateSensor(manager, prefix, device_id_suffix=house_id, device_name=house_name),
        SystemEarningsRateSensor(manager, prefix, device_id_suffix=sys_id, device_name=sys_name),
        SolarOnlyEarningsRateSensor(manager, prefix, device_id_suffix=sys_id, device_name=sys_name),
        BatteryAddedValueRateSensor(manager, prefix, device_id_suffix=sys_id, device_name=sys_name),
    ]
    
    sensors.extend([
        CumulativeSensor(manager, prefix, "System Earnings Cumulative", "system_earnings_rate", "EUR", device_id_suffix=sys_id, device_name=sys_name),
        CumulativeSensor(manager, prefix, "Solar Only Earnings Cumulative", "solar_only_earnings_rate", "EUR", device_id_suffix=sys_id, device_name=sys_name),
        CumulativeSensor(manager, prefix, "Battery Added Value Cumulative", "battery_added_value_rate", "EUR", device_id_suffix=sys_id, device_name=sys_name),
        CumulativeSensor(manager, prefix, "Net Grid Cost Cumulative", "net_grid_cost_rate", "EUR", device_id_suffix=house_id, device_name=house_name),
        CumulativeSensor(manager, prefix, "Net Grid Energy Cumulative", "net_grid_energy_rate", "kWh", SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name),
    ])

    for period in ["daily", "weekly", "monthly", "yearly"]:
        sensors.extend([
            PeriodSensor(manager, prefix, f"System Earnings {period.capitalize()}", "system_earnings_rate", "EUR", period, device_id_suffix=sys_id, device_name=sys_name),
            PeriodSensor(manager, prefix, f"Solar Only Earnings {period.capitalize()}", "solar_only_earnings_rate", "EUR", period, device_id_suffix=sys_id, device_name=sys_name),
            PeriodSensor(manager, prefix, f"Battery Added Value {period.capitalize()}", "battery_added_value_rate", "EUR", period, device_id_suffix=sys_id, device_name=sys_name),
            PeriodSensor(manager, prefix, f"Net Grid Cost {period.capitalize()}", "net_grid_cost_rate", "EUR", period, device_id_suffix=house_id, device_name=house_name),
            PeriodSensor(manager, prefix, f"Net Grid Energy {period.capitalize()}", "net_grid_energy_rate", "kWh", period, SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name),
        ])

    sensors.append(ManagedSensor(manager, prefix, "Effective Price", "effective_price", "EUR/kWh", SensorDeviceClass.MONETARY, house_id, house_name))
    
    # Total System
    sensors.append(CumulativeSensor(manager, prefix, "Total System Cost Cumulative", "total_system_cost_rate", "EUR", device_id_suffix=house_id, device_name=house_name))
    sensors.append(CumulativeSensor(manager, prefix, "Total System Energy Cumulative", "total_system_energy_rate", "kWh", SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name))
    
    for period in ["daily", "weekly", "monthly", "yearly"]:
        sensors.append(PeriodSensor(manager, prefix, f"Total System Cost {period.capitalize()}", "total_system_cost_rate", "EUR", period, device_id_suffix=house_id, device_name=house_name))
        sensors.append(PeriodSensor(manager, prefix, f"Total System Energy {period.capitalize()}", "total_system_energy_rate", "kWh", period, SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name))

    # Untracked
    sensors.append(ManagedSensor(manager, prefix, "Untracked Power", "untracked_power", "W", SensorDeviceClass.POWER, house_id, house_name))
    sensors.append(CumulativeSensor(manager, prefix, "Untracked Cost Cumulative", "untracked_cost_rate", "EUR", device_id_suffix=house_id, device_name=house_name))
    sensors.append(CumulativeSensor(manager, prefix, "Untracked Energy Cumulative", "untracked_energy_rate", "kWh", SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name))
    
    for period in ["daily", "weekly", "monthly", "yearly"]:
        sensors.append(PeriodSensor(manager, prefix, f"Untracked Cost {period.capitalize()}", "untracked_cost_rate", "EUR", period, device_id_suffix=house_id, device_name=house_name))
        sensors.append(PeriodSensor(manager, prefix, f"Untracked Energy {period.capitalize()}", "untracked_energy_rate", "kWh", period, SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name))

    expected_device_unique_ids = set()
    for device_id in tracked_devices:
        clean_id = device_id.replace("sensor.", "")
        name_prefix = device_names.get(device_id, clean_id.replace("_power", "").replace("_", " ").title())
        safe_key = clean_id.replace(".", "_")
        slugified_name = re.sub(r'[^a-z0-9]+', '_', name_prefix.lower()).strip('_')
        base_id = f"dev_{slugified_name}"
        
        dev_id = f"{prefix}dev_financials_{safe_key}"
        dev_name = f"{name_prefix} Financials"
        
        expected_device_unique_ids.add(f"{prefix}{base_id}_cost_rate_cumulative")
        expected_device_unique_ids.add(f"{prefix}{base_id}_cost_rate_daily")
        expected_device_unique_ids.add(f"{prefix}{base_id}_cost_rate_weekly")
        expected_device_unique_ids.add(f"{prefix}{base_id}_cost_rate_monthly")
        expected_device_unique_ids.add(f"{prefix}{base_id}_cost_rate_yearly")
        expected_device_unique_ids.add(f"{prefix}{base_id}_energy_rate_cumulative")
        expected_device_unique_ids.add(f"{prefix}{base_id}_energy_rate_daily")
        expected_device_unique_ids.add(f"{prefix}{base_id}_energy_rate_weekly")
        expected_device_unique_ids.add(f"{prefix}{base_id}_energy_rate_monthly")
        expected_device_unique_ids.add(f"{prefix}{base_id}_energy_rate_yearly")
        
        sensors.append(CumulativeSensor(manager, prefix, f"{name_prefix} Cost Cumulative", f"dev_{safe_key}_cost_rate", "EUR", device_id_suffix=dev_id, device_name=dev_name, entity_id_base=f"{base_id}_cost_rate"))
        sensors.append(CumulativeSensor(manager, prefix, f"{name_prefix} Energy Cumulative", f"dev_{safe_key}_energy_rate", "kWh", SensorDeviceClass.ENERGY, device_id_suffix=dev_id, device_name=dev_name, entity_id_base=f"{base_id}_energy_rate"))
        
        for period in ["daily", "weekly", "monthly", "yearly"]:
            sensors.append(PeriodSensor(manager, prefix, f"{name_prefix} Cost {period.capitalize()}", f"dev_{safe_key}_cost_rate", "EUR", period, device_id_suffix=dev_id, device_name=dev_name, entity_id_base=f"{base_id}_cost_rate"))
            sensors.append(PeriodSensor(manager, prefix, f"{name_prefix} Energy {period.capitalize()}", f"dev_{safe_key}_energy_rate", "kWh", period, SensorDeviceClass.ENERGY, device_id_suffix=dev_id, device_name=dev_name, entity_id_base=f"{base_id}_energy_rate"))

    registry = er.async_get(hass)
    entries = er.async_entries_for_config_entry(registry, config_entry.entry_id)
    for entry in entries:
        if f"{prefix}dev_" in entry.unique_id and entry.unique_id not in expected_device_unique_ids:
            _LOGGER.info("Removing orphaned device entity from Solar Battery Financials: %s", entry.entity_id)
            registry.async_remove(entry.entity_id)

    async_add_entities(sensors)
    await manager.async_start()

class FinancialManager:
    def __init__(self, hass, grid, solar, battery, price, penalty, penalty_pct=0.0, inverter_ac=None, tracked_devices=None, sub_devices=None):
        self.hass = hass
        self.entities = [grid, price]
        if solar:
            self.entities.append(solar)
        if battery:
            self.entities.append(battery)
        if inverter_ac:
            self.entities.append(inverter_ac)
            
        self.tracked_devices = tracked_devices or []
        self.sub_devices = sub_devices or []
        for dev in self.tracked_devices:
            self.entities.append(dev)
            
        self.grid_id = grid
        self.solar_id = solar
        self.battery_id = battery
        self.price_id = price
        self.inverter_ac_id = inverter_ac
        self.penalty_fixed = penalty
        self.penalty_pct = penalty_pct
        
        self.values = {
            "grid": 0.0,
            "solar": 0.0,
            "battery": 0.0,
            "price": 0.0,
            "inverter_ac": 0.0,
            "total_power_consumption": 0.0,
            "total_cost_rate": 0.0,
            "net_grid_cost_rate": 0.0,
            "net_grid_energy_rate": 0.0,
            "system_earnings_rate": 0.0,
            "solar_only_earnings_rate": 0.0,
            "battery_added_value_rate": 0.0,
            "effective_price": 0.0,
            "total_system_cost_rate": 0.0,
            "total_system_energy_rate": 0.0,
            "untracked_power": 0.0,
            "untracked_cost_rate": 0.0,
            "untracked_energy_rate": 0.0,
        }
        for dev in self.tracked_devices:
            safe_key = dev.replace("sensor.", "").replace(".", "_")
            self.values[f"dev_{safe_key}_power"] = 0.0
            self.values[f"dev_{safe_key}_cost_rate"] = 0.0
            self.values[f"dev_{safe_key}_energy_rate"] = 0.0
            
        self.listeners = []
        self._last_update = None
        self._last_efficiency = 0.96

    async def async_start(self):
        for entity_id in self.entities:
            state = self.hass.states.get(entity_id)
            self._update_value(entity_id, state)
            
        self.recalculate()
        async_track_state_change_event(self.hass, self.entities, self._state_changed)

    @callback
    def _state_changed(self, event):
        entity_id = event.data.get("entity_id")
        new_state = event.data.get("new_state")
        self._update_value(entity_id, new_state)
        self.recalculate()

    def _update_value(self, entity_id, state):
        val = 0.0
        if state and state.state not in ("unknown", "unavailable"):
            try:
                val = float(state.state)
            except ValueError:
                pass
                
        if entity_id == self.grid_id:
            self.values["grid"] = val
        elif entity_id == self.solar_id:
            self.values["solar"] = val
        elif entity_id == self.battery_id:
            self.values["battery"] = val
        elif entity_id == self.inverter_ac_id:
            self.values["inverter_ac"] = val
        elif entity_id == self.price_id:
            self.values["price"] = val
        elif entity_id in self.tracked_devices:
            safe_key = entity_id.replace("sensor.", "").replace(".", "_")
            self.values[f"dev_{safe_key}_power"] = val

    def recalculate(self):
        now = dt_util.utcnow()
        delta_hours = 0.0
        if self._last_update:
            delta_hours = (now - self._last_update).total_seconds() / 3600.0
            
        grid = self.values["grid"]
        raw_solar = self.values["solar"]
        raw_battery = self.values["battery"]
        price = self.values["price"]
        inverter_ac = -self.values["inverter_ac"] # Inverted: Deye L1 is Negative when supplying power

        if self.inverter_ac_id:
            total_power = grid + inverter_ac
            
            if inverter_ac > 0:
                dc_to_ac = max(raw_solar, 0.0) + raw_battery
                if dc_to_ac > 50:
                    eff = inverter_ac / dc_to_ac
                    if 0.8 <= eff <= 1.0:
                        self._last_efficiency = eff
        else:
            total_power = grid + raw_solar + raw_battery
            
        self.values["total_power_consumption"] = total_power
        
        total_load_kw = total_power / 1000.0
        grid_kw = grid / 1000.0
        
        gross_cost = total_load_kw * price
        self.values["total_cost_rate"] = gross_cost
        
        export_price = price * (1.0 - self.penalty_pct / 100.0) - self.penalty_fixed
        if grid_kw > 0:
            net_grid_cost = grid_kw * price
            
            if total_load_kw > 0:
                import_fraction = min(1.0, grid_kw / total_load_kw)
                effective_price = (import_fraction * price) + ((1.0 - import_fraction) * export_price)
            else:
                effective_price = 0.0
        else:
            net_grid_cost = grid_kw * export_price
            effective_price = export_price
            
        self.values["net_grid_cost_rate"] = net_grid_cost
        self.values["net_grid_energy_rate"] = grid_kw
        self.values["effective_price"] = effective_price
        self.values["total_system_cost_rate"] = total_load_kw * effective_price
        self.values["total_system_energy_rate"] = total_load_kw
        
        tracked_power_sum = 0.0
        for dev in self.tracked_devices:
            safe_key = dev.replace("sensor.", "").replace(".", "_")
            dev_power = self.values.get(f"dev_{safe_key}_power", 0.0)
            if dev_power > 0:
                if dev not in self.sub_devices:
                    tracked_power_sum += dev_power
                dev_kw = dev_power / 1000.0
                self.values[f"dev_{safe_key}_cost_rate"] = dev_kw * effective_price
                self.values[f"dev_{safe_key}_energy_rate"] = dev_kw
            else:
                self.values[f"dev_{safe_key}_cost_rate"] = 0.0
                self.values[f"dev_{safe_key}_energy_rate"] = 0.0
                
        untracked_power = max(0.0, total_power - tracked_power_sum)
        self.values["untracked_power"] = untracked_power
        self.values["untracked_cost_rate"] = (untracked_power / 1000.0) * effective_price
        self.values["untracked_energy_rate"] = untracked_power / 1000.0
        
        system_earnings = gross_cost - net_grid_cost
        self.values["system_earnings_rate"] = system_earnings
        
        sim_solar_ac = max(raw_solar, 0.0) * self._last_efficiency
        sim_grid = total_load_kw - (sim_solar_ac / 1000.0)
        if sim_grid > 0:
            sim_net_cost = sim_grid * price
        else:
            sim_net_cost = sim_grid * (price * (1.0 - self.penalty_pct / 100.0) - self.penalty_fixed)
            
        solar_only = gross_cost - sim_net_cost
        self.values["solar_only_earnings_rate"] = solar_only
        
        battery_added = system_earnings - solar_only
        self.values["battery_added_value_rate"] = battery_added

        for listener in self.listeners:
            listener(delta_hours)
            
        self._last_update = now

class ManagedSensor(SensorEntity):
    def __init__(self, manager, prefix, name, key, unit, device_class=None, device_id_suffix=None, device_name=None):
        self.manager = manager
        self._attr_name = name
        self._attr_unique_id = f"{prefix}{key}"
        self.entity_id = f"sensor.{prefix}{key}"
        self._attr_native_unit_of_measurement = unit
        self._key = key
        if device_class:
            self._attr_device_class = device_class
        self._device_id_suffix = device_id_suffix
        self._device_name = device_name
            
    @property
    def device_info(self):
        if self._device_id_suffix and self._device_name:
            return {
                "identifiers": {(DOMAIN, self._device_id_suffix)},
                "name": self._device_name,
                "manufacturer": "Solar & Battery Financials",
            }
        return None

    async def async_added_to_hass(self):
        self.manager.listeners.append(self._handle_update)
        
    @callback
    def _handle_update(self, delta_hours):
        self.async_write_ha_state()

    @property
    def native_value(self):
        return round(self.manager.values[self._key], 4)

class TotalPowerSensor(ManagedSensor):
    def __init__(self, manager, prefix, device_id_suffix=None, device_name=None):
        super().__init__(manager, prefix, "Total Power Consumption", "total_power_consumption", "W", SensorDeviceClass.POWER, device_id_suffix, device_name)
        self._attr_state_class = SensorStateClass.MEASUREMENT

    @property
    def extra_state_attributes(self):
        return {
            "tracked_devices": self.manager.tracked_devices,
            "sub_devices": self.manager.sub_devices,
            "grid_sensor": self.manager.grid_id,
            "solar_sensor": self.manager.solar_id,
            "battery_sensor": self.manager.battery_id,
            "price_sensor": self.manager.price_id,
        }

class TotalCostRateSensor(ManagedSensor):
    def __init__(self, manager, prefix, device_id_suffix=None, device_name=None):
        super().__init__(manager, prefix, "Total Cost Rate", "total_cost_rate", "EUR/h", None, device_id_suffix, device_name)
        self._attr_state_class = SensorStateClass.MEASUREMENT

class NetGridCostRateSensor(ManagedSensor):
    def __init__(self, manager, prefix, device_id_suffix=None, device_name=None):
        super().__init__(manager, prefix, "Net Grid Cost Rate", "net_grid_cost_rate", "EUR/h", None, device_id_suffix, device_name)
        self._attr_state_class = SensorStateClass.MEASUREMENT

class SystemEarningsRateSensor(ManagedSensor):
    def __init__(self, manager, prefix, device_id_suffix=None, device_name=None):
        super().__init__(manager, prefix, "System Earnings Rate", "system_earnings_rate", "EUR/h", None, device_id_suffix, device_name)
        self._attr_state_class = SensorStateClass.MEASUREMENT

class SolarOnlyEarningsRateSensor(ManagedSensor):
    def __init__(self, manager, prefix, device_id_suffix=None, device_name=None):
        super().__init__(manager, prefix, "Solar Only Earnings Rate", "solar_only_earnings_rate", "EUR/h", None, device_id_suffix, device_name)
        self._attr_state_class = SensorStateClass.MEASUREMENT

class BatteryAddedValueRateSensor(ManagedSensor):
    def __init__(self, manager, prefix, device_id_suffix=None, device_name=None):
        super().__init__(manager, prefix, "Battery Added Value Rate", "battery_added_value_rate", "EUR/h", None, device_id_suffix, device_name)
        self._attr_state_class = SensorStateClass.MEASUREMENT

class CumulativeSensor(SensorEntity, RestoreEntity):
    def __init__(self, manager, prefix, name, source_key, unit, device_class=SensorDeviceClass.MONETARY, device_id_suffix=None, device_name=None, entity_id_base=None):
        self.manager = manager
        self._attr_name = name
        base = entity_id_base if entity_id_base else source_key
        self._attr_unique_id = f"{prefix}{base}_cumulative"
        self.entity_id = f"sensor.{prefix}{base}_cumulative"
        self._attr_native_unit_of_measurement = unit
        self._attr_state_class = SensorStateClass.TOTAL
        self._attr_device_class = device_class
        self._source_key = source_key
        self._state = 0.0
        self._previous_rate = 0.0
        self._device_id_suffix = device_id_suffix
        self._device_name = device_name

    @property
    def device_info(self):
        if self._device_id_suffix and self._device_name:
            return {
                "identifiers": {(DOMAIN, self._device_id_suffix)},
                "name": self._device_name,
                "manufacturer": "Solar & Battery Financials",
            }
        return None

    async def async_added_to_hass(self):
        await super().async_added_to_hass()
        state = await self.async_get_last_state()
        if state and state.state not in ("unknown", "unavailable"):
            try:
                self._state = float(state.state)
            except ValueError:
                pass
        self.manager.listeners.append(self._handle_update)
        self._previous_rate = self.manager.values[self._source_key]

    @callback
    def _handle_update(self, delta_hours):
        if delta_hours > 0:
            added = self._previous_rate * delta_hours
            self._state += added
            
        self._previous_rate = self.manager.values[self._source_key]
        self.async_write_ha_state()

    @property
    def native_value(self):
        return round(self._state, 4)

class PeriodSensor(SensorEntity, RestoreEntity):
    def __init__(self, manager, prefix, name, source_key, unit, period, device_class=SensorDeviceClass.MONETARY, device_id_suffix=None, device_name=None, entity_id_base=None):
        self.manager = manager
        self._attr_name = name
        base = entity_id_base if entity_id_base else source_key
        self._attr_unique_id = f"{prefix}{base}_{period}"
        self.entity_id = f"sensor.{prefix}{base}_{period}"
        self._attr_native_unit_of_measurement = unit
        self._attr_state_class = SensorStateClass.TOTAL
        self._attr_device_class = device_class
        self._source_key = source_key
        self._period = period
        self._state = 0.0
        self._previous_rate = 0.0
        self._last_reset = None
        self._device_id_suffix = device_id_suffix
        self._device_name = device_name

    @property
    def device_info(self):
        if self._device_id_suffix and self._device_name:
            return {
                "identifiers": {(DOMAIN, self._device_id_suffix)},
                "name": self._device_name,
                "manufacturer": "Solar & Battery Financials",
            }
        return None

    async def async_added_to_hass(self):
        await super().async_added_to_hass()
        state = await self.async_get_last_state()
        if state and state.state not in ("unknown", "unavailable"):
            try:
                self._state = float(state.state)
            except ValueError:
                pass
            
            if "internal_last_reset" in state.attributes and state.attributes["internal_last_reset"]:
                try:
                    self._last_reset = dt_util.parse_datetime(state.attributes["internal_last_reset"])
                except Exception:
                    pass

        if not self._last_reset:
            self._last_reset = dt_util.now()

        self.manager.listeners.append(self._handle_update)
        self._previous_rate = self.manager.values[self._source_key]

    def _check_reset(self, now):
        if not self._last_reset:
            self._last_reset = now
            return False

        reset = False
        if self._period == "daily":
            if now.date() != self._last_reset.date():
                reset = True
        elif self._period == "weekly":
            if now.isocalendar()[:2] != self._last_reset.isocalendar()[:2]:
                reset = True
        elif self._period == "monthly":
            if now.month != self._last_reset.month or now.year != self._last_reset.year:
                reset = True
        elif self._period == "yearly":
            if now.year != self._last_reset.year:
                reset = True

        if reset:
            self._state = 0.0
            self._last_reset = now
            return True
        return False

    @callback
    def _handle_update(self, delta_hours):
        now = dt_util.now()
        if self._check_reset(now):
            self._attr_last_reset = now

        if delta_hours > 0:
            added = self._previous_rate * delta_hours
            self._state += added
            
        self._previous_rate = self.manager.values[self._source_key]
        self.async_write_ha_state()

    @property
    def native_value(self):
        return round(self._state, 4)

    @property
    def extra_state_attributes(self):
        return {
            "internal_last_reset": self._last_reset.isoformat() if self._last_reset else None
        }
