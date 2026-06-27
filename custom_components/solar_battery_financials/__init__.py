import os
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig

from .const import DOMAIN

PLATFORMS = ["sensor"]

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Solar & Battery Financials component."""
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Solar & Battery Financials from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    
    # 1. Register static frontend path
    script_url = "/solar_battery_financials/strategy.js"
    strategy_path = hass.config.path("custom_components/solar_battery_financials/frontend/strategy.js")
    if os.path.exists(strategy_path):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(script_url, strategy_path, False)]
        )
        # 2. Globally inject script into HA Frontend (Zero-config + Cache Busting!)
        add_extra_js_url(hass, f"{script_url}?v=2026_06_27_v3")

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
