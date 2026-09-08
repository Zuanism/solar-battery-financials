import logging
from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Define our dashboard configuration helpers
DASHBOARD_HELPERS = [
    {
        "id": "sbf_financial_view_period",
        "name": "Financial View Period",
        "options": ["Daily", "Weekly", "Monthly", "Yearly", "All-Time"],
        "icon": "mdi:calendar",
        "default": "Daily",
    },
    {
        "id": "sbf_chart_daily_days",
        "name": "Daily Chart Span",
        "options": ["7", "14", "30", "60", "90"],
        "icon": "mdi:calendar-today",
        "default": "7",
    },
    {
        "id": "sbf_chart_weekly_weeks",
        "name": "Weekly Chart Span",
        "options": ["4", "8", "12", "26", "52"],
        "icon": "mdi:calendar-week",
        "default": "12",
    },
    {
        "id": "sbf_chart_monthly_months",
        "name": "Monthly Chart Span",
        "options": ["6", "12", "24", "36"],
        "icon": "mdi:calendar-month",
        "default": "12",
    },
    {
        "id": "sbf_power_chart_days",
        "name": "Power Chart Span",
        "options": ["1", "3", "7", "14"],
        "icon": "mdi:calendar-range",
        "default": "1",
    },
]

async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up Solar & Battery Financials select entities."""
    # We only want to generate these once per Home Assistant instance for the dashboard.
    # We can check if they already exist, but standard HA behavior is to create them
    # and if multiple config entries exist, they might duplicate unless we use a static unique_id.
    
    entities = []
    for helper in DASHBOARD_HELPERS:
        entities.append(SBFDashboardSelect(helper, entry.entry_id))

    async_add_entities(entities)

class SBFDashboardSelect(SelectEntity, RestoreEntity):
    """Representation of a Solar & Battery Financials Dashboard Select helper."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, helper_config: dict, entry_id: str) -> None:
        """Initialize the select entity."""
        self._attr_unique_id = f"sbf_dashboard_helper_{helper_config['id']}"
        self.entity_id = f"select.{helper_config['id']}"
        self._attr_name = helper_config["name"]
        self._attr_icon = helper_config["icon"]
        self._attr_options = helper_config["options"]
        self._attr_current_option = helper_config["default"]
        
        # Optionally link to a global configuration device if it existed,
        # but for now, making it a standalone entity or linking to the integration.
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "sbf_dashboard_helpers")},
            name="Solar & Battery Financials Dashboard",
            manufacturer="Custom Integration",
        )

    async def async_added_to_hass(self) -> None:
        """Handle entity which will be added."""
        await super().async_added_to_hass()
        last_state = await self.async_get_last_state()
        if last_state and last_state.state in self._attr_options:
            self._attr_current_option = last_state.state

    async def async_select_option(self, option: str) -> None:
        """Change the selected option."""
        if option in self._attr_options:
            self._attr_current_option = option
            self.async_write_ha_state()
        else:
            _LOGGER.warning(
                "Invalid option: %s (possible options: %s)",
                option,
                ", ".join(self._attr_options),
            )
