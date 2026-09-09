"""Sensor platform setup for Solar & Battery Financials.

Orchestrates creation of rate, cumulative, periodic, house, and device sensors,
and manages registry cleanup for removed devices.
"""
from __future__ import annotations

import logging
import re
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback

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
)
from .manager import FinancialManager
from .sensor_entities import (
    AverageRateSensor,
    BatteryAddedValueRateSensor,
    CumulativeSensor,
    ManagedSensor,
    NetGridCostRateSensor,
    PeriodSensor,
    SolarOnlyEarningsRateSensor,
    SystemEarningsRateSensor,
    TotalCostRateSensor,
    TotalPowerSensor,
)

_LOGGER = logging.getLogger(__name__)

PERIODS = ["daily", "weekly", "monthly", "yearly"]


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Solar & Battery Financials sensors."""
    config = {**config_entry.data, **config_entry.options}

    grid_sensor = config[CONF_GRID_SENSOR]
    solar_sensor = config.get(CONF_SOLAR_SENSOR)
    battery_sensor = config.get(CONF_BATTERY_SENSOR)
    price_sensor = config[CONF_PRICE_SENSOR]
    export_price_sensor = config.get(CONF_EXPORT_PRICE_SENSOR)
    penalty = config.get(CONF_FEED_IN_PENALTY, 0.0)
    penalty_pct = config.get(CONF_FEED_IN_PENALTY_PERCENT, 0.0)
    prefix = config.get(CONF_PREFIX, "sbf_")
    inverter_ac_sensor = config.get(CONF_INVERTER_AC_SENSOR)
    tracked_devices = config.get(CONF_TRACKED_DEVICES, [])
    device_names = config.get("device_names", {})
    sub_devices = config.get("sub_devices", [])
    generate_rate_sensors = config.get(CONF_GENERATE_RATE_SENSORS, True)

    manager = FinancialManager(
        hass,
        grid_sensor,
        solar_sensor,
        battery_sensor,
        price_sensor,
        export_price_sensor,
        penalty,
        penalty_pct,
        inverter_ac_sensor,
        tracked_devices,
        sub_devices,
        device_names,
    )

    sys_id = f"{prefix}system_financials"
    sys_name = "System Financials"
    house_id = f"{prefix}house_untracked"
    house_name = "House & Untracked"

    sensors: list[SensorEntity] = []
    sensors.extend(_create_rate_sensors(manager, prefix, sys_id, sys_name, house_id, house_name))
    sensors.extend(
        _create_cumulative_and_period_sensors(manager, prefix, sys_id, sys_name, house_id, house_name)
    )
    sensors.extend(
        _create_house_and_untracked_sensors(
            manager, prefix, house_id, house_name, generate_rate_sensors
        )
    )

    dev_sensors, expected_unique_ids = _create_device_sensors(
        manager, prefix, tracked_devices, device_names, generate_rate_sensors
    )
    sensors.extend(dev_sensors)

    _cleanup_orphaned_entities(hass, config_entry.entry_id, prefix, expected_unique_ids)

    async_add_entities(sensors)
    await manager.async_start()


def _create_rate_sensors(
    manager: FinancialManager,
    prefix: str,
    sys_id: str,
    sys_name: str,
    house_id: str,
    house_name: str,
) -> list[SensorEntity]:
    """Create instantaneous rate sensors for power, costs, and earnings."""
    return [
        TotalPowerSensor(manager, prefix, device_id_suffix=sys_id, device_name=sys_name),
        TotalCostRateSensor(manager, prefix, device_id_suffix=sys_id, device_name=sys_name),
        NetGridCostRateSensor(manager, prefix, device_id_suffix=house_id, device_name=house_name),
        SystemEarningsRateSensor(manager, prefix, device_id_suffix=sys_id, device_name=sys_name),
        SolarOnlyEarningsRateSensor(manager, prefix, device_id_suffix=sys_id, device_name=sys_name),
        BatteryAddedValueRateSensor(manager, prefix, device_id_suffix=sys_id, device_name=sys_name),
    ]


def _create_cumulative_and_period_sensors(
    manager: FinancialManager,
    prefix: str,
    sys_id: str,
    sys_name: str,
    house_id: str,
    house_name: str,
) -> list[SensorEntity]:
    """Create cumulative and periodic sensors for system earnings and grid metrics."""
    sensors: list[SensorEntity] = [
        CumulativeSensor(
            manager, prefix, "System Earnings Cumulative", "system_earnings_rate", "EUR",
            device_id_suffix=sys_id, device_name=sys_name,
        ),
        CumulativeSensor(
            manager, prefix, "Solar Only Earnings Cumulative", "solar_only_earnings_rate", "EUR",
            device_id_suffix=sys_id, device_name=sys_name,
        ),
        CumulativeSensor(
            manager, prefix, "Battery Added Value Cumulative", "battery_added_value_rate", "EUR",
            device_id_suffix=sys_id, device_name=sys_name,
        ),
        CumulativeSensor(
            manager, prefix, "Net Grid Cost Cumulative", "net_grid_cost_rate", "EUR",
            device_id_suffix=house_id, device_name=house_name,
        ),
        CumulativeSensor(
            manager, prefix, "Net Grid Energy Cumulative", "net_grid_energy_rate", "kWh",
            SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name,
        ),
    ]

    for period in PERIODS:
        cap_period = period.capitalize()
        sensors.extend([
            PeriodSensor(
                manager, prefix, f"System Earnings {cap_period}", "system_earnings_rate", "EUR",
                period, device_id_suffix=sys_id, device_name=sys_name,
            ),
            PeriodSensor(
                manager, prefix, f"Solar Only Earnings {cap_period}", "solar_only_earnings_rate", "EUR",
                period, device_id_suffix=sys_id, device_name=sys_name,
            ),
            PeriodSensor(
                manager, prefix, f"Battery Added Value {cap_period}", "battery_added_value_rate", "EUR",
                period, device_id_suffix=sys_id, device_name=sys_name,
            ),
            PeriodSensor(
                manager, prefix, f"Net Grid Cost {cap_period}", "net_grid_cost_rate", "EUR",
                period, device_id_suffix=house_id, device_name=house_name,
            ),
            PeriodSensor(
                manager, prefix, f"Net Grid Energy {cap_period}", "net_grid_energy_rate", "kWh",
                period, SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name,
            ),
        ])

    sensors.append(
        PeriodSensor(
            manager, prefix, "Inverter Losses Cost Daily", "inverter_loss_cost_rate", "EUR",
            "daily", SensorDeviceClass.MONETARY, device_id_suffix=sys_id, device_name=sys_name,
        )
    )
    sensors.append(
        ManagedSensor(
            manager, prefix, "Effective Price", "effective_price", "EUR/kWh",
            SensorDeviceClass.MONETARY, house_id, house_name,
        )
    )
    return sensors


def _create_house_and_untracked_sensors(
    manager: FinancialManager,
    prefix: str,
    house_id: str,
    house_name: str,
    generate_rate_sensors: bool,
) -> list[SensorEntity]:
    """Create Total System and Untracked cost/energy sensors."""
    sensors: list[SensorEntity] = []

    # Total System
    ts_cost_cum = CumulativeSensor(
        manager, prefix, "Total System Cost Cumulative", "total_system_cost_rate", "EUR",
        device_id_suffix=house_id, device_name=house_name,
    )
    ts_energy_cum = CumulativeSensor(
        manager, prefix, "Total System Energy Cumulative", "total_system_energy_rate", "kWh",
        SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name,
    )
    sensors.extend([ts_cost_cum, ts_energy_cum])
    if generate_rate_sensors:
        sensors.append(
            AverageRateSensor(
                manager, prefix, "Total System Avg Rate Cumulative", ts_cost_cum, ts_energy_cum,
                "total_system_avg_rate_cumulative", device_id_suffix=house_id, device_name=house_name,
            )
        )

    for period in PERIODS:
        cap = period.capitalize()
        ts_cost_p = PeriodSensor(
            manager, prefix, f"Total System Cost {cap}", "total_system_cost_rate", "EUR",
            period, device_id_suffix=house_id, device_name=house_name,
        )
        ts_energy_p = PeriodSensor(
            manager, prefix, f"Total System Energy {cap}", "total_system_energy_rate", "kWh",
            period, SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name,
        )
        sensors.extend([ts_cost_p, ts_energy_p])
        if generate_rate_sensors:
            sensors.append(
                AverageRateSensor(
                    manager, prefix, f"Total System Avg Rate {cap}", ts_cost_p, ts_energy_p,
                    f"total_system_avg_rate_{period}", device_id_suffix=house_id, device_name=house_name,
                )
            )

    # Untracked
    sensors.append(
        ManagedSensor(
            manager, prefix, "Untracked Power", "untracked_power", "W",
            SensorDeviceClass.POWER, house_id, house_name,
        )
    )
    ut_cost_cum = CumulativeSensor(
        manager, prefix, "Untracked Cost Cumulative", "untracked_cost_rate", "EUR",
        device_id_suffix=house_id, device_name=house_name,
    )
    ut_energy_cum = CumulativeSensor(
        manager, prefix, "Untracked Energy Cumulative", "untracked_energy_rate", "kWh",
        SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name,
    )
    sensors.extend([ut_cost_cum, ut_energy_cum])
    if generate_rate_sensors:
        sensors.append(
            AverageRateSensor(
                manager, prefix, "Untracked Avg Rate Cumulative", ut_cost_cum, ut_energy_cum,
                "untracked_avg_rate_cumulative", device_id_suffix=house_id, device_name=house_name,
            )
        )

    for period in PERIODS:
        cap = period.capitalize()
        ut_cost_p = PeriodSensor(
            manager, prefix, f"Untracked Cost {cap}", "untracked_cost_rate", "EUR",
            period, device_id_suffix=house_id, device_name=house_name,
        )
        ut_energy_p = PeriodSensor(
            manager, prefix, f"Untracked Energy {cap}", "untracked_energy_rate", "kWh",
            period, SensorDeviceClass.ENERGY, device_id_suffix=house_id, device_name=house_name,
        )
        sensors.extend([ut_cost_p, ut_energy_p])
        if generate_rate_sensors:
            sensors.append(
                AverageRateSensor(
                    manager, prefix, f"Untracked Avg Rate {cap}", ut_cost_p, ut_energy_p,
                    f"untracked_avg_rate_{period}", device_id_suffix=house_id, device_name=house_name,
                )
            )

    return sensors


def _create_device_sensors(
    manager: FinancialManager,
    prefix: str,
    tracked_devices: list[str],
    device_names: dict[str, str],
    generate_rate_sensors: bool,
) -> tuple[list[SensorEntity], set[str]]:
    """Create per-device cost, energy, and average rate sensors."""
    sensors: list[SensorEntity] = []
    expected_unique_ids: set[str] = set()

    for device_id in tracked_devices:
        clean_id = device_id.replace("sensor.", "")
        name_prefix = device_names.get(
            device_id, clean_id.replace("_power", "").replace("_", " ").title()
        )
        safe_key = clean_id.replace(".", "_")
        slugified_name = re.sub(r"[^a-z0-9]+", "_", name_prefix.lower()).strip("_")
        base_id = f"dev_{slugified_name}"

        dev_id = f"{prefix}dev_financials_{safe_key}"
        dev_name = f"{name_prefix} Financials"

        # Track unique IDs for registry cleanup
        expected_unique_ids.add(f"{prefix}{base_id}_cost_rate_cumulative")
        expected_unique_ids.add(f"{prefix}{base_id}_energy_rate_cumulative")
        expected_unique_ids.add(f"{prefix}{base_id}_avg_rate_cumulative")
        for period in PERIODS:
            expected_unique_ids.add(f"{prefix}{base_id}_cost_rate_{period}")
            expected_unique_ids.add(f"{prefix}{base_id}_energy_rate_{period}")
            expected_unique_ids.add(f"{prefix}{base_id}_avg_rate_{period}")

        # Cumulative
        dev_cost_cum = CumulativeSensor(
            manager, prefix, f"{name_prefix} Cost Cumulative", f"dev_{safe_key}_cost_rate", "EUR",
            device_id_suffix=dev_id, device_name=dev_name, entity_id_base=f"{base_id}_cost_rate",
            source_entity=device_id,
        )
        dev_energy_cum = CumulativeSensor(
            manager, prefix, f"{name_prefix} Energy Cumulative", f"dev_{safe_key}_energy_rate", "kWh",
            SensorDeviceClass.ENERGY, device_id_suffix=dev_id, device_name=dev_name,
            entity_id_base=f"{base_id}_energy_rate", source_entity=device_id,
        )
        sensors.extend([dev_cost_cum, dev_energy_cum])
        if generate_rate_sensors:
            sensors.append(
                AverageRateSensor(
                    manager, prefix, f"{name_prefix} Avg Rate Cumulative", dev_cost_cum, dev_energy_cum,
                    f"{base_id}_avg_rate_cumulative", device_id_suffix=dev_id, device_name=dev_name,
                    source_entity=device_id,
                )
            )

        # Periodic
        for period in PERIODS:
            cap = period.capitalize()
            dev_cost_p = PeriodSensor(
                manager, prefix, f"{name_prefix} Cost {cap}", f"dev_{safe_key}_cost_rate", "EUR",
                period, device_id_suffix=dev_id, device_name=dev_name,
                entity_id_base=f"{base_id}_cost_rate", source_entity=device_id,
            )
            dev_energy_p = PeriodSensor(
                manager, prefix, f"{name_prefix} Energy {cap}", f"dev_{safe_key}_energy_rate", "kWh",
                period, SensorDeviceClass.ENERGY, device_id_suffix=dev_id, device_name=dev_name,
                entity_id_base=f"{base_id}_energy_rate", source_entity=device_id,
            )
            sensors.extend([dev_cost_p, dev_energy_p])
            if generate_rate_sensors:
                sensors.append(
                    AverageRateSensor(
                        manager, prefix, f"{name_prefix} Avg Rate {cap}", dev_cost_p, dev_energy_p,
                        f"{base_id}_avg_rate_{period}", device_id_suffix=dev_id, device_name=dev_name,
                        source_entity=device_id,
                    )
                )

    return sensors, expected_unique_ids


def _cleanup_orphaned_entities(
    hass: HomeAssistant, entry_id: str, prefix: str, expected_unique_ids: set[str]
) -> None:
    """Remove orphaned device entities from the entity registry."""
    registry = er.async_get(hass)
    entries = er.async_entries_for_config_entry(registry, entry_id)
    for entry in entries:
        if f"{prefix}dev_" in entry.unique_id and entry.unique_id not in expected_unique_ids:
            _LOGGER.info(
                "Removing orphaned device entity from Solar Battery Financials: %s",
                entry.entity_id,
            )
            registry.async_remove(entry.entity_id)
