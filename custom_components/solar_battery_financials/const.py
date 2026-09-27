DOMAIN = "solar_battery_financials"

CONF_GRID_SENSOR = "grid_sensor"
CONF_SOLAR_SENSOR = "solar_sensor"
CONF_BATTERY_SENSOR = "battery_sensor"
CONF_INVERTER_AC_SENSOR = "inverter_ac_sensor"
CONF_PRICE_SENSOR = "price_sensor"
CONF_EXPORT_PRICE_SENSOR = "export_price_sensor"
CONF_FEED_IN_PENALTY = "feed_in_penalty"
CONF_FEED_IN_PENALTY_PERCENT = "feed_in_penalty_percent"
CONF_PREFIX = "prefix"
CONF_TRACKED_DEVICES = "tracked_devices"
CONF_DEVICE_NAMES = "device_names"
CONF_SUB_DEVICES = "sub_devices"
CONF_DEVICE_PARENTS = "device_parents"  # {sub-device entity: parent device entity}
CONF_INVERT_INVERTER_AC = "invert_inverter_ac"

DEFAULT_FEED_IN_PENALTY = 0.0
DEFAULT_FEED_IN_PENALTY_PERCENT = 0.0
DEFAULT_PREFIX = "sbf_"
DEFAULT_INVERT_INVERTER_AC = False

# Accepted power units and their factor to watts.
POWER_UNIT_FACTORS = {"W": 1.0, "kW": 1000.0}


def safe_id(entity_id: str) -> str:
    """Entity ID without the sensor domain, usable inside other IDs."""
    return entity_id.replace("sensor.", "").replace(".", "_")


def default_device_name(entity_id: str) -> str:
    """Friendly name used for a tracked device the user didn't name."""
    return entity_id.replace("sensor.", "").replace("_power", "").replace("_", " ").title()


def device_key(entity_id: str, kind: str) -> str:
    """Key for a tracked device's value in FinancialManager.values (and its unique IDs).

    kind is "power", "cost_rate" or "energy_rate".
    """
    return f"dev_{safe_id(entity_id)}_{kind}"

# How often computed values are written to the state machine (and so the recorder).
# The financial math still integrates on every input change; only the writes are
# batched, which keeps the Home Assistant database small.
RATE_WRITE_INTERVAL_SECONDS = 5
TOTAL_WRITE_INTERVAL_SECONDS = 60

# Period totals exposed as (unrecorded) attributes on every cumulative sensor.
PERIOD_ATTRIBUTES = ("today", "this_week", "this_month", "this_year")
