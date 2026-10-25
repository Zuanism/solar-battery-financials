"""Sensor platform setup for Solar & Battery Financials.

Entities are declared as data (RATE_SENSORS, CUMULATIVE_SENSORS, plus two
cumulative sensors per tracked device). Sensors and devices of tracked devices
that are no longer tracked are removed from the registries on setup.
"""
from __future__ import annotations

from dataclasses import dataclass
import logging
import re

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    CONF_DEVICE_NAMES,
    CONF_PREFIX,
    CONF_TRACKED_DEVICES,
    DEFAULT_PREFIX,
    DOMAIN,
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

# Only with an EV charger configured: what its charged kWh earned (e.g. EREs sold).
ERE_INCOME = CumulativeDef("ere_income_rate", "ERE Income Cumulative", MONEY, "system")

# Totals that existed briefly during 2.2/2.3 development; removed from the registry on setup.
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

    manager = FinancialManager.from_config(hass, config)
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
    cumulative_defs = CUMULATIVE_SENSORS + ((ERE_INCOME,) if manager.ev_charger else ())
    for cdef in cumulative_defs:
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

    for source in tracked_devices:
        name = device_names.get(source) or default_device_name(source)
        device = SbfDevice(f"{prefix}dev_financials_{safe_id(source)}", f"{name} Financials")
        for kind, label, unit in DEVICE_METRICS:
            unique_id = f"{prefix}{device_key(source, kind)}_cumulative"
            # Unique ID follows the source entity (rename-safe); the entity ID is only
            # suggested from the name when the sensor is first created.
            name_base = f"dev_{_slug(name)}_{kind}"
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

    _cleanup_registry(registry, config_entry.entry_id, {s.unique_id for s in sensors})
    _cleanup_devices(
        dr.async_get(hass), registry, config_entry.entry_id,
        {d.identifier for d in devices.values()}
        | {f"{prefix}dev_financials_{safe_id(source)}" for source in tracked_devices},
    )

    async_add_entities(sensors)
    await manager.async_start()
    config_entry.async_on_unload(manager.async_stop)

    # For the recalculate_history action (history.py).
    hass.data.setdefault(DOMAIN, {})[config_entry.entry_id] = [
        s for s in sensors if isinstance(s, CumulativeSensor)
    ]

    def _forget_sensors() -> None:
        # Must return None: Home Assistant awaits whatever an unload callback returns.
        hass.data[DOMAIN].pop(config_entry.entry_id, None)

    config_entry.async_on_unload(_forget_sensors)


def _device_class(unit: str) -> SensorDeviceClass:
    return SensorDeviceClass.ENERGY if unit == ENERGY else SensorDeviceClass.MONETARY


def _cleanup_registry(registry: er.EntityRegistry, entry_id: str, expected: set[str]) -> None:
    """Remove this entry's sensors that are no longer created.

    Covers devices that are no longer tracked, retired totals, and the per-period
    sensors of versions before 1.3.0. Their statistics are kept.
    """
    for entry in er.async_entries_for_config_entry(registry, entry_id):
        if entry.domain == "sensor" and entry.unique_id not in expected:
            _LOGGER.info("Removing sensor that is no longer provided: %s", entry.entity_id)
            registry.async_remove(entry.entity_id)


def _cleanup_devices(
    dev_reg: dr.DeviceRegistry, registry: er.EntityRegistry, entry_id: str, expected: set[str]
) -> None:
    """Remove this entry's devices that are no longer used.

    A tracked device gets a device per power sensor; replacing or renaming that
    sensor otherwise leaves an empty "<name> Financials" device behind. Devices that
    still have entities are left alone.
    """
    for device in dr.async_entries_for_config_entry(dev_reg, entry_id):
        ours = {ident for domain, ident in device.identifiers if domain == DOMAIN}
        if ours and not ours & expected and not er.async_entries_for_device(registry, device.id, True):
            _LOGGER.info("Removing device that is no longer used: %s", device.name)
            dev_reg.async_remove_device(device.id)
