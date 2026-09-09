"""Sensor entities for Solar & Battery Financials.

Defines the base sensor types (ManagedSensor, CumulativeSensor, PeriodSensor)
and specialized rate/earnings sensor classes.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.core import callback
from homeassistant.helpers.restore_state import RestoreEntity
import homeassistant.util.dt as dt_util

from .const import DOMAIN

if TYPE_CHECKING:
    from .manager import FinancialManager

_LOGGER = logging.getLogger(__name__)


class SbfSensorBase(SensorEntity):
    """Shared base for all Solar & Battery Financials sensors."""

    def __init__(
        self,
        manager: FinancialManager,
        prefix: str,
        name: str,
        device_id_suffix: str | None = None,
        device_name: str | None = None,
        source_entity: str | None = None,
    ) -> None:
        self.manager = manager
        self._prefix = prefix
        self._attr_name = name
        self._device_id_suffix = device_id_suffix
        self._device_name = device_name
        self._source_entity = source_entity

    @property
    def device_info(self) -> dict[str, Any] | None:
        if self._device_id_suffix and self._device_name:
            return {
                "identifiers": {(DOMAIN, self._device_id_suffix)},
                "name": self._device_name,
                "manufacturer": "Solar & Battery Financials",
            }
        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        attrs: dict[str, Any] = {}
        if self._source_entity:
            attrs["source_entity_id"] = self._source_entity
        return attrs


class ManagedSensor(SbfSensorBase):
    """Sensor that reflects an instantaneous value from FinancialManager."""

    def __init__(
        self,
        manager: FinancialManager,
        prefix: str,
        name: str,
        key: str,
        unit: str,
        device_class: SensorDeviceClass | None = None,
        device_id_suffix: str | None = None,
        device_name: str | None = None,
        source_entity: str | None = None,
    ) -> None:
        super().__init__(manager, prefix, name, device_id_suffix, device_name, source_entity)
        self._attr_unique_id = f"{prefix}{key}"
        self.entity_id = f"sensor.{prefix}{key}"
        self._attr_native_unit_of_measurement = unit
        self._key = key
        if device_class:
            self._attr_device_class = device_class

    async def async_added_to_hass(self) -> None:
        self.manager.listeners.append(self._handle_update)

    @callback
    def _handle_update(self, delta_hours: float) -> None:
        self.async_write_ha_state()

    @property
    def native_value(self) -> float:
        return round(self.manager.values[self._key], 4)


class TotalPowerSensor(ManagedSensor):
    """Instantaneous total household power consumption."""

    def __init__(
        self,
        manager: FinancialManager,
        prefix: str,
        device_id_suffix: str | None = None,
        device_name: str | None = None,
    ) -> None:
        super().__init__(
            manager,
            prefix,
            "Total Power Consumption",
            "total_power_consumption",
            "W",
            SensorDeviceClass.POWER,
            device_id_suffix,
            device_name,
        )
        self._attr_state_class = SensorStateClass.MEASUREMENT

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "tracked_devices": self.manager.tracked_devices,
            "device_names": self.manager.device_names,
            "sub_devices": self.manager.sub_devices,
            "grid_sensor": self.manager.grid_id,
            "solar_sensor": self.manager.solar_id,
            "battery_sensor": self.manager.battery_id,
            "price_sensor": self.manager.price_id,
            "export_price_sensor": self.manager.export_price_id,
        }


class TotalCostRateSensor(ManagedSensor):
    """Instantaneous total gross cost rate (EUR/h)."""

    def __init__(
        self,
        manager: FinancialManager,
        prefix: str,
        device_id_suffix: str | None = None,
        device_name: str | None = None,
    ) -> None:
        super().__init__(
            manager,
            prefix,
            "Total Cost Rate",
            "total_cost_rate",
            "EUR/h",
            None,
            device_id_suffix,
            device_name,
        )
        self._attr_state_class = SensorStateClass.MEASUREMENT


class NetGridCostRateSensor(ManagedSensor):
    """Instantaneous net grid cost rate (EUR/h)."""

    def __init__(
        self,
        manager: FinancialManager,
        prefix: str,
        device_id_suffix: str | None = None,
        device_name: str | None = None,
    ) -> None:
        super().__init__(
            manager,
            prefix,
            "Net Grid Cost Rate",
            "net_grid_cost_rate",
            "EUR/h",
            None,
            device_id_suffix,
            device_name,
        )
        self._attr_state_class = SensorStateClass.MEASUREMENT


class SystemEarningsRateSensor(ManagedSensor):
    """Instantaneous system earnings rate (EUR/h)."""

    def __init__(
        self,
        manager: FinancialManager,
        prefix: str,
        device_id_suffix: str | None = None,
        device_name: str | None = None,
    ) -> None:
        super().__init__(
            manager,
            prefix,
            "System Earnings Rate",
            "system_earnings_rate",
            "EUR/h",
            None,
            device_id_suffix,
            device_name,
        )
        self._attr_state_class = SensorStateClass.MEASUREMENT


class SolarOnlyEarningsRateSensor(ManagedSensor):
    """Instantaneous savings rate (EUR/h) attributable strictly to Solar PV.

    Formula:
        Gross Cost Rate - Simulated Net Cost Rate (with Solar only, no Battery)
    """

    def __init__(
        self,
        manager: FinancialManager,
        prefix: str,
        device_id_suffix: str | None = None,
        device_name: str | None = None,
    ) -> None:
        super().__init__(
            manager,
            prefix,
            "Solar Only Earnings Rate",
            "solar_only_earnings_rate",
            "EUR/h",
            None,
            device_id_suffix,
            device_name,
        )
        self._attr_state_class = SensorStateClass.MEASUREMENT


class BatteryAddedValueRateSensor(ManagedSensor):
    """Instantaneous savings rate (EUR/h) added specifically by the Battery.

    Formula:
        Total System Earnings Rate - Solar Only Earnings Rate
    """

    def __init__(
        self,
        manager: FinancialManager,
        prefix: str,
        device_id_suffix: str | None = None,
        device_name: str | None = None,
    ) -> None:
        super().__init__(
            manager,
            prefix,
            "Battery Added Value Rate",
            "battery_added_value_rate",
            "EUR/h",
            None,
            device_id_suffix,
            device_name,
        )
        self._attr_state_class = SensorStateClass.MEASUREMENT


class CumulativeSensor(SbfSensorBase, RestoreEntity):
    """Restorable running cumulative integral of an instantaneous rate sensor."""

    def __init__(
        self,
        manager: FinancialManager,
        prefix: str,
        name: str,
        source_key: str,
        unit: str,
        device_class: SensorDeviceClass = SensorDeviceClass.MONETARY,
        device_id_suffix: str | None = None,
        device_name: str | None = None,
        entity_id_base: str | None = None,
        source_entity: str | None = None,
    ) -> None:
        super().__init__(manager, prefix, name, device_id_suffix, device_name, source_entity)
        base = entity_id_base if entity_id_base else source_key
        self._attr_unique_id = f"{prefix}{base}_cumulative"
        self.entity_id = f"sensor.{prefix}{base}_cumulative"
        self._attr_native_unit_of_measurement = unit
        self._attr_state_class = SensorStateClass.TOTAL
        self._attr_device_class = device_class
        self._source_key = source_key
        self._state = 0.0
        self._previous_rate = 0.0

    async def async_added_to_hass(self) -> None:
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
    def _handle_update(self, delta_hours: float) -> None:
        if delta_hours > 0:
            added = self._previous_rate * delta_hours
            self._state += added

        self._previous_rate = self.manager.values[self._source_key]
        self.async_write_ha_state()

    @property
    def native_value(self) -> float:
        return round(self._state, 4)


class PeriodSensor(SbfSensorBase, RestoreEntity):
    """Restorable periodic (daily, weekly, monthly, yearly) integral sensor with auto-reset."""

    def __init__(
        self,
        manager: FinancialManager,
        prefix: str,
        name: str,
        source_key: str,
        unit: str,
        period: str,
        device_class: SensorDeviceClass = SensorDeviceClass.MONETARY,
        device_id_suffix: str | None = None,
        device_name: str | None = None,
        entity_id_base: str | None = None,
        source_entity: str | None = None,
    ) -> None:
        super().__init__(manager, prefix, name, device_id_suffix, device_name, source_entity)
        base = entity_id_base if entity_id_base else source_key
        self._attr_unique_id = f"{prefix}{base}_{period}"
        self.entity_id = f"sensor.{prefix}{base}_{period}"
        self._attr_native_unit_of_measurement = unit
        self._attr_state_class = SensorStateClass.TOTAL
        self._attr_device_class = device_class
        self._period = period
        self._source_key = source_key
        self._state = 0.0
        self._previous_rate = 0.0
        self._last_reset = None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        attrs = super().extra_state_attributes
        attrs["internal_last_reset"] = self._last_reset.isoformat() if self._last_reset else None
        return attrs

    async def async_added_to_hass(self) -> None:
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

    def _check_reset(self, now: Any) -> bool:
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
    def _handle_update(self, delta_hours: float) -> None:
        now = dt_util.now()
        if self._check_reset(now):
            self._attr_last_reset = now

        if delta_hours > 0:
            added = self._previous_rate * delta_hours
            self._state += added

        self._previous_rate = self.manager.values[self._source_key]
        self.async_write_ha_state()

    @property
    def native_value(self) -> float:
        return round(self._state, 4)
