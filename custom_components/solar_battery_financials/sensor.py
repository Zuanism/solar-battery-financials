"""Sensor platform setup for Solar & Battery Financials.

Entities are declared as data (RATE_SENSORS, CUMULATIVE_SENSORS, plus two
cumulative sensors per tracked device). Sensors of devices that are no longer
tracked are removed from the entity registry on setup.
"""
from __future__ import annotations

from dataclasses import dataclass
import logging
import re

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    CONF_BATTERY_SENSOR,
    CONF_DEVICE_NAMES,
    CONF_DEVICE_PARENTS,
    CONF_EXPORT_PRICE_SENSOR,
    CONF_FEED_IN_PENALTY,
    CONF_FEED_IN_PENALTY_PERCENT,
    CONF_GRID_SENSOR,
    CONF_INVERTER_AC_SENSOR,
    CONF_INVERT_INVERTER_AC,
    CONF_PREFIX,
    CONF_PRICE_SENSOR,
    CONF_SOLAR_SENSOR,
    CONF_SUB_DEVICES,
    CONF_TRACKED_DEVICES,
    DEFAULT_INVERT_INVERTER_AC,
    DEFAULT_PREFIX,
    default_device_name,
    device_key,
    safe_id,
)
from .manager import FinancialManager
from .sensor_entities import (
    CumulativeSensor,
    RateSensor,
    SbfDevice,
    SbfSensorDescription,
)

_LOGGER = logging.getLogger(__name__)

MONEY = "{currency}"
ENERGY = "kWh"

RATE_SENSORS: tuple[SbfSensorDescription, ...] = (
    SbfSensorDescription(
        key="total_power_consumption", name="Total Power Consumption", unit="W",
        device_class=SensorDeviceClass.POWER, state_class=SensorStateClass.MEASUREMENT,
        group="system", expose_config=True,
    ),
    SbfSensorDescription(
        key="total_cost_rate", name="Total Cost Rate", unit="{currency}/h",
        state_class=SensorStateClass.MEASUREMENT, group="system",
    ),
    SbfSensorDescription(
        key="system_earnings_rate", name="System Earnings Rate", unit="{currency}/h",
        state_class=SensorStateClass.MEASUREMENT, group="system",
    ),
    SbfSensorDescription(
        key="solar_only_earnings_rate", name="Solar Only Earnings Rate", unit="{currency}/h",
        state_class=SensorStateClass.MEASUREMENT, group="system",
    ),
    SbfSensorDescription(
        key="battery_added_value_rate", name="Battery Added Value Rate", unit="{currency}/h",
        state_class=SensorStateClass.MEASUREMENT, group="system",
    ),
    SbfSensorDescription(
        key="net_grid_cost_rate", name="Net Grid Cost Rate", unit="{currency}/h",
        state_class=SensorStateClass.MEASUREMENT, group="house",
    ),
    SbfSensorDescription(
        key="effective_price", name="Effective Price", unit="{currency}/kWh", group="house",
    ),
    SbfSensorDescription(
        key="untracked_power", name="Untracked Power", unit="W",
        device_class=SensorDeviceClass.POWER, state_class=SensorStateClass.MEASUREMENT,
        group="house",
    ),
    SbfSensorDescription(
        key="inverter_efficiency", name="Inverter Efficiency", unit="%",
        state_class=SensorStateClass.MEASUREMENT, group="system",
        icon="mdi:sine-wave", precision=1, requires_inverter_ac=True,
    ),
)


@dataclass(frozen=True)
class CumulativeDef:
    """A system-level cumulative sensor: the integral of manager value `source_key`."""

    source_key: str
    name: str
    unit: str
    group: str


CUMULATIVE_SENSORS: tuple[CumulativeDef, ...] = (
    CumulativeDef("system_earnings_rate", "System Earnings Cumulative", MONEY, "system"),
    CumulativeDef("solar_only_earnings_rate", "Solar Only Earnings Cumulative", MONEY, "system"),
    CumulativeDef("battery_added_value_rate", "Battery Added Value Cumulative", MONEY, "system"),
    CumulativeDef("inverter_loss_cost_rate", "Inverter Losses Cost Cumulative", MONEY, "system"),
    CumulativeDef("net_grid_cost_rate", "Net Grid Cost Cumulative", MONEY, "house"),
    CumulativeDef("net_grid_energy_rate", "Net Grid Energy Cumulative", ENERGY, "house"),
    CumulativeDef("total_system_cost_rate", "Total System Cost Cumulative", MONEY, "house"),
    CumulativeDef("total_system_energy_rate", "Total System Energy Cumulative", ENERGY, "house"),
    CumulativeDef("untracked_cost_rate", "Untracked Cost Cumulative", MONEY, "house"),
    CumulativeDef("untracked_energy_rate", "Untracked Energy Cumulative", ENERGY, "house"),
)

# Totals that existed briefly during 2.2/2.3 development; removed from the registry on setup.
RETIRED_TOTALS = ("grid_import_cost_rate", "solar_supply_value_rate", "battery_supply_value_rate")

DEVICE_METRICS = (("cost_rate", "Cost", MONEY), ("energy_rate", "Energy", ENERGY))


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Solar & Battery Financials sensors."""
    config = {**config_entry.data, **config_entry.options}
    prefix = config.get(CONF_PREFIX, DEFAULT_PREFIX)
    tracked_devices: list[str] = config.get(CONF_TRACKED_DEVICES, [])
    device_names: dict[str, str] = config.get(CONF_DEVICE_NAMES, {})
    currency = hass.config.currency

    manager = FinancialManager(
        hass,
        config[CONF_GRID_SENSOR],
        config.get(CONF_SOLAR_SENSOR),
        config.get(CONF_BATTERY_SENSOR),
        config[CONF_PRICE_SENSOR],
        config.get(CONF_EXPORT_PRICE_SENSOR),
        config.get(CONF_FEED_IN_PENALTY, 0.0),
        config.get(CONF_FEED_IN_PENALTY_PERCENT, 0.0),
        config.get(CONF_INVERTER_AC_SENSOR),
        config.get(CONF_INVERT_INVERTER_AC, DEFAULT_INVERT_INVERTER_AC),
        tracked_devices,
        config.get(CONF_SUB_DEVICES, []),
        device_names,
    )

    manager.device_parents = config.get(CONF_DEVICE_PARENTS) or {}
    registry = er.async_get(hass)
    devices = {
        "system": SbfDevice(f"{prefix}system_financials", "System Financials"),
        "house": SbfDevice(f"{prefix}house_untracked", "House & Untracked"),
    }

    sensors: list[SensorEntity] = [
        RateSensor(manager, desc, prefix, devices[desc.group], currency)
        for desc in RATE_SENSORS
        if not desc.requires_inverter_ac or manager.inverter_ac_id
    ]
    for cdef in CUMULATIVE_SENSORS:
        sensors.append(
            CumulativeSensor(
                manager,
                name=cdef.name,
                source_key=cdef.source_key,
                unique_id=f"{prefix}{cdef.source_key}_cumulative",
                entity_id=f"sensor.{prefix}{cdef.source_key}_cumulative",
                unit=cdef.unit.format(currency=currency),
                device_class=_device_class(cdef.unit),
                device=devices[cdef.group],
            )
        )

    expected_device_ids: set[str] = set()
    for source in tracked_devices:
        name = device_names.get(source) or default_device_name(source)
        device = SbfDevice(f"{prefix}dev_financials_{safe_id(source)}", f"{name} Financials")
        for kind, label, unit in DEVICE_METRICS:
            unique_id = f"{prefix}{device_key(source, kind)}_cumulative"
            # Unique ID follows the source entity (rename-safe); the entity ID is only
            # suggested from the name when the sensor is first created.
            name_base = f"dev_{_slug(name)}_{kind}"
            expected_device_ids.add(unique_id)
            sensors.append(
                CumulativeSensor(
                    manager,
                    name=f"{name} {label} Cumulative",
                    source_key=device_key(source, kind),
                    unique_id=unique_id,
                    entity_id=f"sensor.{prefix}{name_base}_cumulative",
                    unit=unit.format(currency=currency),
                    device_class=_device_class(unit),
                    device=device,
                    source_entity=source,
                )
            )

    _cleanup_registry(registry, config_entry.entry_id, prefix, expected_device_ids)

    async_add_entities(sensors)
    await manager.async_start()
    config_entry.async_on_unload(manager.async_stop)


def _device_class(unit: str) -> SensorDeviceClass:
    return SensorDeviceClass.ENERGY if unit == ENERGY else SensorDeviceClass.MONETARY


def _cleanup_registry(
    registry: er.EntityRegistry, entry_id: str, prefix: str, expected_device_ids: set[str]
) -> None:
    """Remove the sensors of devices that are no longer tracked, and retired sensors."""
    retired = {f"{prefix}{key}_cumulative" for key in RETIRED_TOTALS}
    for entry in er.async_entries_for_config_entry(registry, entry_id):
        uid = entry.unique_id
        if entry.domain == "sensor" and (
            uid in retired or (uid.startswith(f"{prefix}dev_") and uid not in expected_device_ids)
        ):
            _LOGGER.info("Removing sensor of untracked device: %s", entry.entity_id)
            registry.async_remove(entry.entity_id)
