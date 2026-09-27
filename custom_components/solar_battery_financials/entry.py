"""Config entry lifecycle: setup, unload, reload on option changes, and migration.

Kept separate from __init__.py so that changes here never require touching the
package entry point.
"""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from .const import CONF_INVERT_INVERTER_AC, DOMAIN
from .frontend_resource import async_setup_frontend

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor"]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Solar & Battery Financials from a config entry."""
    await async_setup_frontend(hass)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload after the options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Upgrade config entries from older versions.

    Version 1 → 2 (integration 2.0.0):
    - store the inverter AC sign explicitly: version 1 entries without the option
      always inverted it, so they get `invert_inverter_ac: true`;
    - remove the retired dashboard helper selects and their device.
    """
    if entry.version > 2:
        return False  # created by a newer version; don't guess

    if entry.version == 1:
        data = dict(entry.data)
        if CONF_INVERT_INVERTER_AC not in data and CONF_INVERT_INVERTER_AC not in entry.options:
            data[CONF_INVERT_INVERTER_AC] = True

        ent_reg = er.async_get(hass)
        for reg_entry in er.async_entries_for_config_entry(ent_reg, entry.entry_id):
            if reg_entry.domain == "select":
                ent_reg.async_remove(reg_entry.entity_id)
        dev_reg = dr.async_get(hass)
        if device := dev_reg.async_get_device(identifiers={(DOMAIN, "sbf_dashboard_helpers")}):
            dev_reg.async_remove_device(device.id)

        hass.config_entries.async_update_entry(entry, data=data, version=2)
        _LOGGER.info("Migrated Solar & Battery Financials config entry to version 2")

    return True
