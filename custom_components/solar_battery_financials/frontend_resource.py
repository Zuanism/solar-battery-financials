"""Serve the dashboard strategy and keep its Lovelace resource URL current.

The resource URL carries a fingerprint of strategy.js (?v=<hash>), recomputed
every time the integration sets up. Any change to the file therefore gets a new
URL, so browsers and the app's cache can never keep serving an old version:
updates take effect after a restart (or a reload of the integration).
"""
from __future__ import annotations

import hashlib
import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

SCRIPT_URL = f"/{DOMAIN}/strategy.js"
SCRIPT_PATH = Path(__file__).parent / "frontend" / "strategy.js"


def _fingerprint() -> str | None:
    """Short content hash of strategy.js, or None if it is missing."""
    try:
        return hashlib.sha256(SCRIPT_PATH.read_bytes()).hexdigest()[:12]
    except OSError:
        return None


async def async_setup_frontend(hass: HomeAssistant) -> None:
    """Serve strategy.js and point the Lovelace resource at its current version."""
    fingerprint = await hass.async_add_executor_job(_fingerprint)
    if fingerprint is None:
        _LOGGER.warning("Dashboard strategy not found at %s", SCRIPT_PATH)
        return

    data = hass.data.setdefault(DOMAIN, {})
    if not data.get("static_path_registered"):
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(SCRIPT_URL, str(SCRIPT_PATH), cache_headers=False)]
            )
        except RuntimeError:
            pass  # already registered (e.g. after a reload)
        data["static_path_registered"] = True

    url = f"{SCRIPT_URL}?v={fingerprint}"
    if not await _async_update_resource(hass, url):
        # Lovelace resources may not be loaded yet during startup; retry once started.
        async def _retry(_event) -> None:
            await _async_update_resource(hass, url)

        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _retry)


async def _async_update_resource(hass: HomeAssistant, url: str) -> bool:
    """Create or update the strategy's Lovelace resource (storage-mode dashboards only)."""
    lovelace = hass.data.get("lovelace")
    resources = getattr(lovelace, "resources", None)
    if resources is None and isinstance(lovelace, dict):
        resources = lovelace.get("resources")
    if resources is None or not hasattr(resources, "async_create_item"):
        return False  # YAML-mode resources: the user manages them

    try:
        await resources.async_get_info()  # ensure the collection is loaded
        for item in resources.async_items():
            existing = item.get("url", "")
            if existing == SCRIPT_URL or existing.startswith(f"{SCRIPT_URL}?"):
                if existing != url:
                    await resources.async_update_item(item["id"], {"res_type": "module", "url": url})
                    _LOGGER.info("Updated dashboard strategy resource to %s", url)
                return True
        await resources.async_create_item({"res_type": "module", "url": url})
        _LOGGER.info("Registered dashboard strategy resource %s", url)
        return True
    except Exception as err:  # noqa: BLE001 - never block setup on the dashboard
        _LOGGER.warning("Could not register the dashboard strategy resource: %s", err)
        return False
