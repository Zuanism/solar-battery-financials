import logging
import os
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import HomeAssistant
from homeassistant.components.http import StaticPathConfig

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor", "select"]

async def async_register_strategy_resource(hass: HomeAssistant) -> bool:
    """Register strategy.js as a Lovelace resource in storage mode."""
    lovelace = hass.data.get("lovelace")
    if not lovelace:
        return False

    resources = getattr(lovelace, "resources", None)
    if resources is None and isinstance(lovelace, dict):
        resources = lovelace.get("resources")

    if not resources or not hasattr(resources, "async_get_info"):
        return False

    try:
        await resources.async_get_info()
    except Exception as err:
        _LOGGER.warning("Could not load Lovelace resources: %s", err)
        return False

    script_url = "/solar_battery_financials/strategy.js"

    # Check if already registered
    for item in resources.async_items():
        url = item.get("url", "")
        if url == script_url or url.startswith(f"{script_url}?"):
            return True

    try:
        await resources.async_create_item({
            "res_type": "module",
            "url": script_url,
        })
        _LOGGER.info("Registered Solar & Battery Financials strategy as Lovelace resource")
        return True
    except Exception as err:
        _LOGGER.warning("Failed to auto-register Lovelace resource: %s", err)
        return False

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Solar & Battery Financials component."""
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Solar & Battery Financials from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    
    # 1. Register static frontend path
    if not hass.data[DOMAIN].get("static_paths_registered"):
        script_url = "/solar_battery_financials/strategy.js"
        strategy_path = hass.config.path("custom_components/solar_battery_financials/frontend/strategy.js")
        if await hass.async_add_executor_job(os.path.exists, strategy_path):
            try:
                await hass.http.async_register_static_paths(
                    [StaticPathConfig(script_url, strategy_path, False)]
                )
            except RuntimeError:
                pass
        hass.data[DOMAIN]["static_paths_registered"] = True

    # 2. Automatically register Lovelace resource if in storage mode
    async def _register_lovelace_resource(*_):
        await async_register_strategy_resource(hass)

    if not await async_register_strategy_resource(hass):
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register_lovelace_resource)

    entry.async_on_unload(entry.add_update_listener(update_listener))
    
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True

async def update_listener(hass: HomeAssistant, entry: ConfigEntry):
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    return unload_ok
