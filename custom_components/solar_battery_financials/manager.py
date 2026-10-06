"""Financial Manager for Solar & Battery Financials.

Coordinates real-time entity updates, computes financial rates (earnings,
costs, savings, device breakdowns), and notifies registered sensor entities.

Calculation and writing are decoupled: every input change recalculates the
rates and lets the cumulative sensors integrate them (so no accuracy is lost),
but sensor states are only written on a fixed interval. This keeps the number
of recorder rows independent of how often the input sensors update.
"""
from __future__ import annotations

import logging
from typing import Any, Callable

from datetime import timedelta

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_track_time_interval,
)
import homeassistant.util.dt as dt_util

from .const import POWER_UNIT_FACTORS, RATE_WRITE_INTERVAL_SECONDS, TOTAL_WRITE_INTERVAL_SECONDS, device_key

_LOGGER = logging.getLogger(__name__)


class FinancialManager:
    """Core financial calculation engine."""

    def __init__(
        self,
        hass: HomeAssistant,
        grid: str,
        solar: str | None,
        battery: str | None,
        price: str,
        export_price: str | None,
        penalty: float,
        penalty_pct: float = 0.0,
        inverter_ac: str | None = None,
        invert_inverter_ac: bool = False,
        tracked_devices: list[str] | None = None,
        sub_devices: list[str] | None = None,
        device_names: dict[str, str] | None = None,
        ac_solar: str | None = None,
    ) -> None:
        self.hass = hass
        self.tracked_devices = tracked_devices or []
        self.sub_devices = sub_devices or []
        self.device_names = device_names or {}
        self.device_parents: dict[str, str] = {}

        self.grid_id = grid
        self.solar_id = solar
        self.ac_solar_id = ac_solar
        self.battery_id = battery
        self.price_id = price
        self.export_price_id = export_price
        self.inverter_ac_id = inverter_ac
        self.invert_inverter_ac = invert_inverter_ac
        self.penalty_fixed = penalty
        self.penalty_pct = penalty_pct

        # Input entity -> value keys it feeds. System inputs are "core": while any
        # of them is unavailable the totals stop integrating instead of treating
        # the missing value as 0 (which would book phantom earnings or costs).
        self._input_keys: dict[str, list[str]] = {}
        for entity_id, key in (
            (grid, "grid"),
            (price, "price"),
            (export_price, "export_price"),
            (solar, "solar"),
            (ac_solar, "ac_solar"),
            (battery, "battery"),
            (inverter_ac, "inverter_ac"),
        ):
            if entity_id:
                self._input_keys.setdefault(entity_id, []).append(key)
        self._core_inputs = set(self._input_keys)
        for dev in self.tracked_devices:
            self._input_keys.setdefault(dev, []).append(device_key(dev, "power"))
        self.input_entities = list(self._input_keys)
        self._unavailable: set[str] = set()

        self.values: dict[str, float] = {
            "grid": 0.0,
            "solar": 0.0,
            "ac_solar": 0.0,
            "battery": 0.0,
            "price": 0.0,
            "export_price": 0.0,
            "inverter_ac": 0.0,
            "total_power_consumption": 0.0,
            "total_cost_rate": 0.0,
            "net_grid_cost_rate": 0.0,
            "net_grid_energy_rate": 0.0,
            "system_earnings_rate": 0.0,
            "solar_only_earnings_rate": 0.0,
            "battery_added_value_rate": 0.0,
            "effective_price": 0.0,
            "total_system_cost_rate": 0.0,
            "total_system_energy_rate": 0.0,
            "untracked_power": 0.0,
            "untracked_cost_rate": 0.0,
            "untracked_energy_rate": 0.0,
            "inverter_loss_power": 0.0,
            "inverter_loss_cost_rate": 0.0,
            "inverter_efficiency": 96.0,
        }
        for dev in self.tracked_devices:
            for kind in ("power", "cost_rate", "energy_rate"):
                self.values[device_key(dev, kind)] = 0.0

        # Called on every recalculation with the elapsed hours (integration step).
        self.listeners: list[Callable[[float], None]] = []
        # Called on a timer to write states: instantaneous rates and running totals.
        self.rate_writers: list[Callable[[], None]] = []
        self.total_writers: list[Callable[[], None]] = []
        self._unsubs: list[CALLBACK_TYPE] = []
        self._last_update = None
        self._last_efficiency = 0.96

    async def async_start(self) -> None:
        """Initialize values and subscribe to state change events."""
        for entity_id in self.input_entities:
            self._update_value(entity_id, self.hass.states.get(entity_id))

        self.recalculate()
        self._unsubs.append(
            async_track_state_change_event(self.hass, self.input_entities, self._state_changed)
        )
        self._unsubs.append(
            async_track_time_interval(
                self.hass,
                self._write_rates,
                timedelta(seconds=RATE_WRITE_INTERVAL_SECONDS),
                name="sbf rate writer",
            )
        )
        self._unsubs.append(
            async_track_time_interval(
                self.hass,
                self._write_totals,
                timedelta(seconds=TOTAL_WRITE_INTERVAL_SECONDS),
                name="sbf total writer",
            )
        )
        # Publish initial values immediately rather than waiting for the first tick.
        self._write_rates()
        self._write_totals()

    @callback
    def async_stop(self) -> None:
        """Unsubscribe from all listeners (called when the entry unloads)."""
        while self._unsubs:
            self._unsubs.pop()()

    @callback
    def _write_rates(self, _now: Any = None) -> None:
        for writer in list(self.rate_writers):
            writer()

    @callback
    def _write_totals(self, _now: Any = None) -> None:
        # Integrate up to "now" first so totals don't lag when inputs are quiet.
        self.recalculate()
        for writer in list(self.total_writers):
            writer()

    @callback
    def _state_changed(self, event: Any) -> None:
        """Handle state changes of watched entities."""
        entity_id = event.data.get("entity_id")
        new_state = event.data.get("new_state")
        self._update_value(entity_id, new_state)
        self.recalculate()

    @property
    def paused(self) -> bool:
        """True while a core input is unavailable; totals don't integrate meanwhile."""
        return bool(self._unavailable)

    def _update_value(self, entity_id: str, state: Any) -> None:
        """Parse an input's state into self.values.

        Unavailable core inputs keep their last value and pause integration;
        unavailable tracked devices count as 0 W.
        """
        try:
            val = float(state.state) if state is not None else None
        except ValueError:
            val = None
        if val is not None and entity_id not in (self.price_id, self.export_price_id):
            # Power inputs may be in W or kW; everything is calculated in W.
            val *= POWER_UNIT_FACTORS.get(state.attributes.get("unit_of_measurement"), 1.0)
        if entity_id in self._core_inputs:
            if val is None:
                self._unavailable.add(entity_id)
                return
            self._unavailable.discard(entity_id)
        for key in self._input_keys.get(entity_id, ()):
            self.values[key] = val if val is not None else 0.0

    def recalculate(self) -> None:
        """Perform full recalculation of all financial metrics."""
        now = dt_util.utcnow()
        delta_hours = 0.0
        if self._last_update and not self.paused:
            delta_hours = (now - self._last_update).total_seconds() / 3600.0

        grid = self.values["grid"]
        raw_solar = self.values["solar"]
        ac_solar = self.values["ac_solar"]
        raw_battery = self.values["battery"]
        price = self.values["price"]
        raw_export_price = (
            self.values["export_price"]
            if self.export_price_id and self.export_price_id != self.price_id
            else price
        )
        inverter_ac = self.values["inverter_ac"]
        if self.invert_inverter_ac:  # Some inverters (e.g. Deye) report negative while supplying
            inverter_ac = -inverter_ac

        # 1. Total power & efficiency
        total_power, total_load_kw, grid_kw = self._calculate_total_power(
            grid, raw_solar, raw_battery, inverter_ac, ac_solar
        )

        # 2. Grid costs & effective electricity price
        gross_cost, export_price, net_grid_cost, effective_price = self._calculate_grid_costs(
            price, raw_export_price, grid_kw, total_load_kw
        )

        # 3. Tracked devices and untracked power/cost
        self._calculate_device_costs(total_power, effective_price)

        # 4. System & solar-only earnings, and battery added value
        self._calculate_earnings(
            gross_cost, net_grid_cost, total_load_kw, raw_solar, ac_solar, price, raw_export_price
        )

        # 5. Inverter losses power and cost rate
        self._calculate_inverter_losses(
            raw_solar, raw_battery, inverter_ac, grid_kw, price, export_price
        )

        # 6. Notify listeners
        for listener in self.listeners:
            listener(delta_hours)

        self._last_update = now

    def _calculate_total_power(
        self, grid: float, raw_solar: float, raw_battery: float, inverter_ac: float, ac_solar: float
    ) -> tuple[float, float, float]:
        """Compute total household power consumption and update efficiency if meter is present.

        AC-coupled solar (panels with their own micro-inverter, on a separate house
        circuit) never passes the main inverter: it adds to the load directly and is
        kept out of the efficiency and loss calculations.
        """
        if self.inverter_ac_id:
            total_power = grid + inverter_ac + ac_solar
            if inverter_ac > 0:
                dc_to_ac = max(raw_solar, 0.0) + raw_battery
                if dc_to_ac > 50:
                    eff = inverter_ac / dc_to_ac
                    if 0.8 <= eff <= 1.0:
                        self._last_efficiency = eff
                        self.values["inverter_efficiency"] = eff * 100.0
        else:
            net_dc = max(raw_solar, 0.0) + raw_battery
            if net_dc > 0:
                est_inverter_loss = net_dc * (1.0 - self._last_efficiency)
            else:
                est_inverter_loss = (
                    abs(net_dc) * ((1.0 / self._last_efficiency) - 1.0)
                    if self._last_efficiency > 0
                    else 0.0
                )
            total_power = grid + raw_solar + raw_battery - est_inverter_loss + ac_solar

        self.values["total_power_consumption"] = total_power
        total_load_kw = total_power / 1000.0
        grid_kw = grid / 1000.0
        return total_power, total_load_kw, grid_kw

    def _calculate_grid_costs(
        self, price: float, raw_export_price: float, grid_kw: float, total_load_kw: float
    ) -> tuple[float, float, float, float]:
        """Compute gross cost, net grid cost, effective price, and total system rates."""
        gross_cost = total_load_kw * price
        self.values["total_cost_rate"] = gross_cost

        export_price = raw_export_price * (1.0 - self.penalty_pct / 100.0) - self.penalty_fixed
        if grid_kw > 0:
            net_grid_cost = grid_kw * price
            if total_load_kw > 0:
                import_fraction = min(1.0, grid_kw / total_load_kw)
                effective_price = (import_fraction * price) + ((1.0 - import_fraction) * export_price)
            else:
                effective_price = 0.0
        else:
            net_grid_cost = grid_kw * export_price
            effective_price = export_price

        self.values["net_grid_cost_rate"] = net_grid_cost
        self.values["net_grid_energy_rate"] = grid_kw
        self.values["effective_price"] = effective_price
        self.values["total_system_cost_rate"] = total_load_kw * effective_price
        self.values["total_system_energy_rate"] = total_load_kw
        return gross_cost, export_price, net_grid_cost, effective_price

    def _calculate_device_costs(self, total_power: float, effective_price: float) -> None:
        """Compute cost and energy rates for tracked individual and sub-devices, plus untracked."""
        tracked_power_sum = 0.0
        for dev in self.tracked_devices:
            dev_kw = max(self.values[device_key(dev, "power")], 0.0) / 1000.0
            if dev_kw > 0 and dev not in self.sub_devices:
                tracked_power_sum += dev_kw * 1000.0
            self.values[device_key(dev, "cost_rate")] = dev_kw * effective_price
            self.values[device_key(dev, "energy_rate")] = dev_kw

        # Not clamped at 0: device totals + untracked must always add up to the house total,
        # even when the plugs measure slightly more than the main meter.
        untracked_power = total_power - tracked_power_sum
        self.values["untracked_power"] = untracked_power
        self.values["untracked_cost_rate"] = (untracked_power / 1000.0) * effective_price
        self.values["untracked_energy_rate"] = untracked_power / 1000.0

    def _calculate_earnings(
        self,
        gross_cost: float,
        net_grid_cost: float,
        total_load_kw: float,
        raw_solar: float,
        ac_solar: float,
        price: float,
        raw_export_price: float,
    ) -> None:
        """Compute system earnings, solar-only earnings, and battery added value."""
        system_earnings = gross_cost - net_grid_cost
        self.values["system_earnings_rate"] = system_earnings

        # --- Solar Only Earnings Rate Calculation ---
        # Formula: solar_only = gross_cost - sim_net_cost
        # 1. Convert DC solar to AC using inverter efficiency, plus AC-coupled solar as is:
        #    sim_solar_ac = max(raw_solar, 0) * efficiency + ac_solar
        # 2. Simulate net grid balance without battery: sim_grid = total_load_kw - sim_solar_kw
        # 3. Calculate simulated net bill:
        #    - If sim_grid > 0 (importing): sim_net_cost = sim_grid * price
        #    - If sim_grid <= 0 (exporting): sim_net_cost = sim_grid * effective_export_price
        sim_solar_ac = max(raw_solar, 0.0) * self._last_efficiency + ac_solar
        sim_grid = total_load_kw - (sim_solar_ac / 1000.0)
        if sim_grid > 0:
            sim_net_cost = sim_grid * price
        else:
            sim_net_cost = sim_grid * (
                raw_export_price * (1.0 - self.penalty_pct / 100.0) - self.penalty_fixed
            )

        solar_only = gross_cost - sim_net_cost
        self.values["solar_only_earnings_rate"] = solar_only

        # --- Battery Added Value Rate Calculation ---
        # Formula: battery_added = system_earnings - solar_only
        battery_added = system_earnings - solar_only
        self.values["battery_added_value_rate"] = battery_added

    def _calculate_inverter_losses(
        self,
        raw_solar: float,
        raw_battery: float,
        inverter_ac: float,
        grid_kw: float,
        price: float,
        export_price: float,
    ) -> None:
        """Compute inverter power loss and monetary cost of that loss."""
        net_dc = max(raw_solar, 0.0) + raw_battery
        if self.inverter_ac_id and inverter_ac != 0:
            if inverter_ac > 0:
                inverter_loss_w = max(0.0, net_dc - inverter_ac)
            else:
                inverter_loss_w = max(0.0, abs(inverter_ac) - abs(net_dc))
        else:
            if net_dc > 0:
                inverter_loss_w = net_dc * (1.0 - self._last_efficiency)
            else:
                inverter_loss_w = (
                    abs(net_dc) * ((1.0 / self._last_efficiency) - 1.0)
                    if self._last_efficiency > 0
                    else 0.0
                )

        marginal_price = price if grid_kw > 0 else export_price
        self.values["inverter_loss_power"] = inverter_loss_w
        self.values["inverter_loss_cost_rate"] = (inverter_loss_w / 1000.0) * marginal_price
