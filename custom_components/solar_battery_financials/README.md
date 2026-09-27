# Solar & Battery Financials

A Home Assistant integration that turns your power sensors and electricity prices into a live financial picture of your home: what your solar panels and battery earn, what your house costs, and what each tracked appliance costs to run.

It answers four questions, continuously:

1. How much is my whole system (solar + battery) saving me?
2. How much would I save with solar panels alone, without the battery?
3. How much value is the battery adding (or costing) on top of that?
4. What does each appliance really cost, given my dynamic tariff and where its power is coming from right now?

It also bundles a ready-made dashboard with a live power flow, per-device power, and a Financials tab where you can look up any day, week, month, year or custom range.

**Contents**

1. [Quick start](#1-quick-start)
2. [Configuration](#2-configuration)
3. [Sensors](#3-sensors)
4. [How the calculations work](#4-how-the-calculations-work)
5. [Behaviour and data handling](#5-behaviour-and-data-handling)
6. [Dashboard](#6-dashboard)
7. [Upgrading and version history](#7-upgrading-and-version-history)
8. [Troubleshooting](#8-troubleshooting)
9. [Developer reference](#9-developer-reference)

---

## 1. Quick start

1. Copy `custom_components/solar_battery_financials` into your Home Assistant `config/custom_components/` folder and restart Home Assistant.
2. Go to **Settings → Devices & services → Add integration → Solar & Battery Financials** and select your sensors (see [Configuration](#2-configuration)).
3. For the dashboard, install the frontend cards listed in [Dashboard → Requirements](#61-requirements), create a new dashboard, open **⋮ → Edit dashboard → ⋮ → Raw configuration editor**, and replace its contents with:

   ```yaml
   strategy:
     type: custom:solar-battery-financials
   ```

Only one instance of the integration can be added per Home Assistant installation.

---

## 2. Configuration

Everything is configured in the UI.

### 2.1 Setup

The setup form is divided into sections. The two collapsed ones can usually be left alone. Each field has help text underneath. Power sensors may report **W or kW**.

| Section | Setting | Required | Description |
|---|---|---|---|
| Grid & prices | Grid power | Yes | Power exchanged with the grid. **Positive = importing, negative = exporting.** |
| | Import price | Yes | Current price you pay per kWh (e.g. Nordpool, Tibber, a static template sensor). |
| | Export price | No | Current price you receive per kWh exported. If empty, the import price is used. |
| Solar, battery & inverter | Solar power | No | DC power from the panels. **Positive = producing.** Without it, the system is treated as having no solar. |
| | Battery power | No | **Positive = discharging into the house, negative = charging.** Without it, the system is treated as having no battery. |
| | Inverter AC power | No | AC power at the inverter's output. Enables measured inverter efficiency and exact loss tracking (see [4.6](#46-inverter-efficiency-and-losses)). Without it, a fixed 96 % efficiency is assumed. |
| | Invert inverter AC sensor | No | Enable if your inverter reports **negative** power while supplying the house (e.g. Deye). Default off. |
| Export price adjustments *(collapsed)* | Fixed deduction | No | Amount per kWh deducted from the export price (e.g. `0.02`). Default `0`. |
| | Percentage deduction | No | Percentage deducted from the export price (e.g. `20` if you are paid 80 % of the tariff). Default `0`. |
| Devices | Devices to track | No | Power sensors of individual appliances or circuits (smart plugs, sub-meters). |
| Advanced *(collapsed)* | Entity ID prefix | No | Text put in front of every entity ID the integration creates. Default `sbf_`. Only set here, because changing it later would change every entity ID. |

The two export deductions combine as:

```text
Effective export price = Export price × (1 − Percentage / 100) − Fixed deduction
```

A negative percentage or deduction acts as a feed-in **bonus**.

**Checks on submit.** The form refuses power sensors in a unit other than W or kW. While the panels produce more than 100 W, it also checks the inverter sign: an inverter AC reading below −50 W with *Invert* off (or above +50 W with it on) means the setting is wrong, and the form says so.

### 2.2 Device names and hierarchy

If you track devices, two short steps follow:

- **Name your devices.** Friendly names used for sensors and on the dashboard. Left empty, a name is derived from the entity ID (`sensor.shelly_keuken_power` → "Shelly Keuken"). Renaming later only changes the display name; entity IDs and history are kept.
- **Device hierarchy.** For each device, choose one of:
  - **Independent.**
  - **Part of *another tracked device*** (for example a dishwasher plug behind a kitchen circuit meter).
  - **Part of another device (not specified).**

  Devices that are part of another are *sub-devices*. They get their own cost and energy totals but are left out of the "Untracked" calculation, so their power isn't counted twice. Only independent devices can be chosen as a parent (one level deep).

### 2.3 Changing settings later

**Settings → Devices & services → Solar & Battery Financials → Configure** opens a menu:
- **Sensors:** grid, prices, solar, battery, inverter.
- **Export price adjustments.**
- **Devices:** which devices are tracked, their names and hierarchy.

Each saves on its own, and the integration reloads itself; no restart needed. Clearing an optional field removes that setting.

---

## 3. Sensors

Entity IDs below use the default prefix `sbf_`; yours use the prefix you configured. Money units follow the currency set in **Settings → System → General** (shown here as €).

With *N* tracked devices the integration creates **18 + 2 × N** sensors (19 + 2 × N with an inverter AC sensor).

### 3.1 Live (rate) sensors

Instantaneous values, recalculated on every input change and written at most every 5 seconds. While a core input is unavailable they show *unavailable* (see [5.2](#52-unavailable-inputs)).

| Sensor | Entity ID | Unit | Meaning |
|---|---|---|---|
| Total Power Consumption | `sensor.sbf_total_power_consumption` | W | Your real house load (see [4.1](#41-house-load)). Its attributes list the configured sensors, devices, sub-devices and device parents, which the dashboard uses. |
| Total Cost Rate | `sensor.sbf_total_cost_rate` | €/h | What the house would cost right now with no solar and no battery: load × import price. |
| Net Grid Cost Rate | `sensor.sbf_net_grid_cost_rate` | €/h | What you are actually paying (positive) or earning (negative) at the meter right now. |
| System Earnings Rate | `sensor.sbf_system_earnings_rate` | €/h | Savings of the whole system: Total Cost Rate − Net Grid Cost Rate. |
| Solar Only Earnings Rate | `sensor.sbf_solar_only_earnings_rate` | €/h | Savings you would have with solar panels but no battery (see [4.4](#44-solar-only-earnings-the-no-battery-simulation)). |
| Battery Added Value Rate | `sensor.sbf_battery_added_value_rate` | €/h | The battery's contribution: System Earnings − Solar Only Earnings. Often negative while charging (see [4.5](#45-battery-added-value-and-why-it-goes-negative)). |
| Effective Price | `sensor.sbf_effective_price` | €/kWh | The price currently applied to your consumption and devices (see [4.3](#43-effective-price-opportunity-cost)). |
| Untracked Power | `sensor.sbf_untracked_power` | W | House load not accounted for by tracked devices (sub-devices excluded). |
| Inverter Efficiency | `sensor.sbf_inverter_efficiency` | % | Last measured inverter efficiency. Only created with an inverter AC sensor. |

### 3.2 Cumulative sensors

Running totals (integrals) of the rates above. They have `state_class: total`, so Home Assistant keeps long-term statistics for them, and they are written once a minute.

| Sensor | Entity ID | Unit | Totals of |
|---|---|---|---|
| System Earnings Cumulative | `sensor.sbf_system_earnings_rate_cumulative` | € | System earnings |
| Solar Only Earnings Cumulative | `sensor.sbf_solar_only_earnings_rate_cumulative` | € | Solar-only earnings |
| Battery Added Value Cumulative | `sensor.sbf_battery_added_value_rate_cumulative` | € | Battery added value |
| Inverter Losses Cost Cumulative | `sensor.sbf_inverter_loss_cost_rate_cumulative` | € | Money lost to inverter conversion |
| Net Grid Cost Cumulative | `sensor.sbf_net_grid_cost_rate_cumulative` | € | Your net bill (imports minus export revenue) |
| Net Grid Energy Cumulative | `sensor.sbf_net_grid_energy_rate_cumulative` | kWh | Net grid energy (imports minus exports; can go negative) |
| Total System Cost Cumulative | `sensor.sbf_total_system_cost_rate_cumulative` | € | House consumption valued at the effective price |
| Total System Energy Cumulative | `sensor.sbf_total_system_energy_rate_cumulative` | kWh | House consumption |
| Untracked Cost Cumulative | `sensor.sbf_untracked_cost_rate_cumulative` | € | Cost of untracked consumption |
| Untracked Energy Cumulative | `sensor.sbf_untracked_energy_rate_cumulative` | kWh | Untracked consumption |
| *Name* Cost Cumulative | `sensor.sbf_dev_<name>_cost_rate_cumulative` | € | Cost of a tracked device (one per device) |
| *Name* Energy Cumulative | `sensor.sbf_dev_<name>_energy_rate_cumulative` | kWh | Energy of a tracked device (one per device) |

`<name>` is the device's friendly name at the time it was added, in lower case with underscores (e.g. "Washing machine" → `dev_washing_machine`). Device sensors carry a `source_entity_id` attribute pointing at the power sensor they track.

### 3.3 Period totals (attributes)

Every cumulative sensor also exposes its total for the current calendar periods, in Home Assistant's time zone:

| Attribute | Period |
|---|---|
| `today` | Since midnight |
| `this_week` | Since Monday 00:00 (ISO week) |
| `this_month` | Since the 1st of the month |
| `this_year` | Since 1 January |

Use them in templates, for example:

```jinja
{{ state_attr('sensor.sbf_system_earnings_rate_cumulative', 'today') }}
```

They update with the sensor (once a minute) and survive restarts. For **past** periods and charts, use the sensor's long-term statistics instead (Statistics Graph or Statistic card, or ApexCharts with `statistics: {type: change, period: day | week | month}`); that is what the bundled dashboard does.

### 3.4 Devices in Home Assistant

Sensors are grouped under these devices:

| Device | Contains |
|---|---|
| System Financials | Total power, cost and earnings rates, earnings and inverter-loss totals, inverter efficiency |
| House & Untracked | Net grid, effective price, total system and untracked sensors |
| *Name* Financials | The cost and energy totals of one tracked device |

### 3.5 Using the sensors elsewhere

- **Statistics and history:** all cumulative sensors have long-term statistics; the rate sensors for power, cost and earnings keep hourly mean/min/max statistics.
- **Energy dashboard:** the device and total-system *energy* sensors normally only increase and can be added as individual devices. *Net Grid Energy* can decrease (exports), so it is not suitable as a grid consumption source; use your meter's own sensors for that.
- **Automations:** the period attributes give you "today so far" values without extra helpers, e.g. notify when `today` of a device's cost sensor exceeds a limit.

---

## 4. How the calculations work

All calculations run in `FinancialManager.recalculate()` (`manager.py`) every time an input sensor changes. Power inputs in kW are first converted to W; rates are in €/h.

### 4.1 House load

**With an inverter AC sensor**, the load is what the grid and inverter together deliver:

```text
Load (W) = Grid + Inverter AC
```

**Without one**, the inverter's AC output is estimated from the DC side, minus estimated conversion losses at the current efficiency (96 % unless measured):

```text
Net DC      = max(Solar, 0) + Battery
Loss (W)    = Net DC × (1 − efficiency)          when Net DC > 0 (inverter supplying)
            = |Net DC| × (1 / efficiency − 1)    when Net DC ≤ 0 (charging from AC)
Load (W)    = Grid + Solar + Battery − Loss
```

### 4.2 Grid costs

```text
Gross cost rate  = Load (kW) × Import price                   → Total Cost Rate
Net grid cost    = Grid (kW) × Import price                   when importing
                 = Grid (kW) × Effective export price         when exporting (negative = revenue)
System earnings  = Gross cost rate − Net grid cost
```

### 4.3 Effective price (opportunity cost)

The effective price answers: *what does one extra kWh of consumption cost me right now?* It depends on what is happening at the meter:

- **Exporting, or self-sufficient (grid ≤ 0):** consuming more means exporting less, so the cost is the lost export revenue: **effective price = effective export price**. This also applies when running on the battery; charging the full import price there would count the same energy twice once the battery is later recharged.
- **Importing:** part of the load comes from the grid and part from solar/battery, so the price is a blend:

  ```text
  Import share    = min(1, Grid kW / Load kW)
  Effective price = Import share × Import price + (1 − Import share) × Effective export price
  ```

  For example, with 2 kW of load of which 1 kW comes from the grid, the effective price is exactly halfway between the import price and the effective export price.

The effective price values the whole house (**Total System Cost**) and every tracked device (**device cost = device kW × effective price**). Because every device uses the same price, the device costs plus the untracked cost always add up to the total system cost.

Untracked power is the load minus the power of all tracked devices that are **not** sub-devices. It is not clamped: when plugs measure slightly more than the main meter it goes negative, so devices plus Untracked always add up exactly to the house total. A device reporting negative power is counted as 0.

### 4.4 Solar-only earnings (the "no battery" simulation)

To separate what the panels earn from what the battery adds, the integration simulates your bill as if the battery didn't exist:

1. **Solar as AC:** `Simulated solar (kW) = max(Solar, 0) × efficiency / 1000`
2. **Grid without battery:** `Simulated grid (kW) = Load (kW) − Simulated solar (kW)`
3. **Simulated bill:** simulated grid × import price when positive (importing), or × effective export price when negative (exporting; a negative cost is revenue).
4. **Solar-only earnings:** `Gross cost rate − Simulated bill`

### 4.5 Battery added value and why it goes negative

```text
Battery added value = System earnings − Solar-only earnings
```

While the battery **charges** from solar, the real system exports less than the no-battery simulation would, so the battery's value is negative: it gives up export revenue now. When it **discharges** later, it avoids buying (often more expensive) grid power, and the value turns positive. Over a day or longer, the cumulative sensor shows whether the battery is paying off: it rises when you store cheap energy and use it at expensive times.

### 4.6 Inverter efficiency and losses

With an inverter AC sensor, efficiency is measured whenever the inverter supplies more than 50 W:

```text
Efficiency = Inverter AC ÷ (max(Solar, 0) + Battery)
```

Readings outside 80–100 % are ignored (they happen during transitions), and the last valid value is kept. That efficiency is used in the solar-only simulation and exposed as the **Inverter Efficiency** sensor. After a restart it starts at 96 % until the next valid reading.

Inverter losses are calculated as:

- With an inverter AC sensor: DC in − AC out while supplying; AC in − DC out while charging from AC.
- Without one: the estimated loss from [4.1](#41-house-load).

The loss is valued at the import price when importing, otherwise at the effective export price. The result feeds **Inverter Losses Cost Cumulative**.

### 4.7 Integration into totals

Cumulative sensors integrate their rate with the left Riemann sum: each time the inputs change (and at least once a minute), the rate that was in effect since the previous calculation is multiplied by the elapsed time and added to the total.

---

## 5. Behaviour and data handling

### 5.1 Database footprint

The integration is built to keep the Home Assistant database small, however often your meters report:

- **Calculating and writing are separate.** The math runs on every input change, so no accuracy is lost, but states are only written on a timer: rate sensors at most every **5 s**, cumulative sensors every **60 s**. A state is only written when its value actually changed. The intervals are `RATE_WRITE_INTERVAL_SECONDS` and `TOTAL_WRITE_INTERVAL_SECONDS` in `const.py`.
- **Period totals aren't recorded.** The `today` / `this_week` / `this_month` / `this_year` attributes are excluded from the recorder, because they can be derived from the cumulative sensors' statistics.
- **Few entities.** Period totals are attributes, not separate daily/weekly/monthly/yearly sensors.
- **Rounding.** Values are kept to 4 decimals and efficiency to 0.1 %, so noise doesn't create new rows.

For example, with 12 tracked devices and an inverter AC sensor the integration creates 43 sensors, each written at most every 5 or 60 seconds, however often the meters report.

### 5.2 Unavailable inputs

- **Core inputs** (grid, prices, solar, battery, inverter AC): while any of them is unavailable or non-numeric, totals **pause** instead of treating the missing value as 0, which would book phantom earnings or costs. Rate sensors show *unavailable*, and the last known value is kept for when the input returns.
- **Tracked devices:** an unavailable device counts as 0 W.
- **At startup** the same rule applies until all core inputs have reported.

### 5.3 Restarts

Cumulative sensors store their full-precision total and the start-of-period baselines in Home Assistant's restore cache (`.storage/core.restore_state`). After a restart they continue exactly where they stopped, including anything integrated after the last state write. A period that rolled over while Home Assistant was down starts from zero.

When no baselines were saved yet (after upgrading from a version that didn't store them), they are derived once from the sensor's long-term statistics, so `today` / `this_week` / `this_month` / `this_year` include everything recorded since the start of each period rather than only what happened since the upgrade.

### 5.4 Renaming, adding and removing devices

- **Renaming** a tracked device changes its display name only. Sensors are identified by the tracked power sensor, so entity IDs and history stay.
- **Adding** a device creates its two cumulative sensors, starting at 0.
- **Removing** a device removes its sensors from the entity registry. Their long-term statistics remain in the database until you delete them under **Developer tools → Statistics**.

---

## 6. Dashboard

The dashboard's text follows each viewer's Home Assistant language: English, or Dutch when the profile language is Nederlands. Device names are shown as configured.

The integration ships a Lovelace **dashboard strategy**: a dashboard generated automatically from your configuration, with nothing to maintain by hand.

### 6.1 Requirements

Install these cards through **HACS → Frontend**:

| Card | Used for |
|---|---|
| `apexcharts-card` | All history charts |
| `power-flow-card-plus` | The animated power flow on the Power tab |

The dashboard's own script registers itself as a dashboard resource (for dashboards in storage mode, the default). If your resources are managed in YAML, add `/solar_battery_financials/strategy.js` as a `module` resource yourself.

### 6.2 Power tab

- **Power flow** of grid, solar, battery (with state of charge and temperature when matching sensors are found) and the tracked devices.
- **Summary tiles:**
  - Today's earnings: Total, Solar, Battery. Tapping one opens its earnings history; the back arrow returns to Power (these are copies of the Financials earnings pages under `power-…` paths, since a page can only have one back target).
  - Price, Inverter efficiency (when available) and Battery temperature. Tapping one opens its history page (1 / 3 / 7 / 14 days) with the current value, and average, min and max over the span. Sensors without long-term statistics are plotted from their recorded history, averaged per 5 minutes or hour, and have no summary.
- **Devices and Sub-devices:** live power per device, sorted by usage. Icons are coloured green (< 50 W), orange (< 1 kW) or red. Devices drawing under 1 W fold into a "+N idle" line; tap it to show them. Tapping a device opens its power history, with 1 / 3 / 7 / 14-day spans, a y-axis from 0 and a summary such as "Avg 231 W · peak 364 W · 5.5 kWh in the last 24 hours" (the peak is the highest recorded reading, so it can exceed the averaged line). The current reading ("248 W now") is shown next to the title. Charts use 5-minute averages (1–3 days) or hourly averages (7–14 days) so they load fast; the **Detailed** pill (1 and 3 days) switches to raw readings, reduced to the highest reading per 1 or 3 minutes so the chart stays quick to draw and spikes stay visible. Longer spans have no detailed view. The choice resets to normal when you leave the page. Times follow the time format in your Home Assistant profile; when that is set to follow the language, the home's country decides too (English in the Netherlands shows 24-hour times, in the US am/pm).

### 6.3 Financials tab

A single card with a **period picker**:

- **Day / Week / Month / Year:** the current period by default. Step back and forward with **‹ ›**, jump to any date with the **calendar button**, and return with **Now**.
- **All:** all-time totals.
- **Custom:** any date range. Both dates are included; a reversed range is swapped automatically.
- **Swipe** right on a phone for the previous period, left for the next one.
- Periods before the first day with data show "No data before …", and **‹** stops at the first period with data.
- **€ / kWh / €/kWh** (the switch between the waterfall and the diagram below it): what that diagram and the device list show. The waterfall always stays in money, and the choice is remembered per browser.
  - Next to it, a **flow diagram | bars** toggle (not in the €/kWh view) picks how the € and kWh breakdowns are drawn: the Sankey, or one bar per device on a shared scale, split into coloured segments for its sub-devices (and "Other"), with the device's share of the total ("€28.10 · 25%"). Bars are easier to compare; the Sankey shows the flow. On phones each bar sits under its name at full width. The choice is remembered per browser.
  - **€** (default): the Effective cost Sankey (or bars); devices by cost, with kWh and average price underneath.
  - **kWh:** a Sankey starting from **Consumption** (with its cost and average price); devices by energy, with cost and average price underneath.
  - **€/kWh:** each device's average price as a bar in the device's colour, laid out like the € and kWh bars, with a dashed line at the house average (named in the header line). A bar's thickness is the device's kWh, so its area is its cost: thick and long means a big user at a bad price. Devices are sorted by average price; the price text turns green more than 15% below the house average and red more than 15% above (prices spread less than amounts, hence tighter bands than elsewhere). Devices under 0.2 kWh in the period get no price and fold into the idle line. Prices don't add up, so there is no Sankey in this view.

Past periods are loaded from long-term statistics. While one loads, the previous values stay on screen and a thin bar under the controls shows progress (only if it takes longer than a moment); the numbers and diagrams then update in place. The period before the one shown is fetched in the background, so stepping back with **‹** is usually instant.

For the chosen period it shows:

- **Gross cost to net bill:** a waterfall at the top, written out as a sum: **Gross cost − Solar earned − Battery earned = Net bill**, with the operators between the bars. Gross cost (what the house would cost without solar and battery) and Net bill are solid bars; the earned amounts are light outlined boxes stepping down from Gross. If solar or the battery cost money in that period, its step turns into "+ … cost" (in red). A bracket over the two earned steps shows their combined result ("Total earned", or "Total cost" in red). A net bill below zero (you earned money) is shown in green.
- **Effective cost breakdown:** a Sankey diagram under the waterfall, starting from **Effective cost** (the house's consumption at the effective price, with its kWh and average price per kWh) and splitting it over the **devices** and **Untracked**. Devices with sub-devices get a middle column, from which their sub-devices and the parent's remainder ("Other": measured by the parent, but not by any of its sub-devices) fan out; other devices go straight to the last column. The style follows Home Assistant's energy Sankey: thin coloured bars, heights proportional to money, bands fading from one colour to the next, labels with the amount in grey. Hovering shows exact values, and tapping a device opens its history. On narrow screens (phones) the diagram runs top to bottom, with labels under the bars; very small items are drawn without a label.
- **Devices and Sub-devices:** folded behind "Show device details (N devices, M sub-devices)" by default, since the diagram already names every device; the choice is remembered per browser. The lists add kWh and average price per device, sorted by the selected unit. Each icon has the device's own colour, the same as in the Sankey, so a device looks the same everywhere. Devices with no cost and no usage fold into a "+N idle" line.

Current periods come from the cumulative sensors' live attributes. Past and custom periods are fetched from long-term statistics in one batch, using calendar periods in Home Assistant's time zone. Past values reflect the prices and settings in effect at the time; changing, say, the feed-in penalty does not recalculate history. History starts when the cumulative sensors were created.

**Navigation:** tap Gross cost, Solar earned, Battery earned, the Total earned bracket, Net bill, the Effective cost node or any device to open its **history page**. They highlight on hover and can be reached with the keyboard.

### 6.4 History pages

Gross cost, Solar earned, Battery earned, Total earned, Net bill, Effective cost and each device have a history page:

- **Header:** the name (tap it to open the entity's details) and a summary for the selected span, e.g. "€12.87 · 70.9 kWh · avg €0.18/kWh in the last 14 days" (earnings pages: "€x earned in …"), kept on one line. The period tabs sit to the right of the title (below it on phones).
- **Period tabs** (**Daily / Weekly / Monthly / Yearly / All-Time**); Daily, Weekly and Monthly also have span chips (e.g. 7 / 14 / 30 / 60 / 90 days). Only the selected tab's charts are loaded.
- **All-Time** shows your whole history as lines with one point per day, with pills **7-day avg / 30-day avg** (default) **/ 90-day avg / Total**. With a window, each day's point covers the window up to that day: cost and energy as the average per day (titles then read "€/day", "kWh/day"), the average price as the window's cost divided by its kWh (so days with little use can't distort it). Early days with less history than the window average over what is available. **Total** is the running total (and running average price) since the start. Pages with two series (Total earnings, Gross cost) show two lines instead of a stack.
- **Device pages** show three titled charts: Cost (€), Energy (kWh) and Average price (€/kWh).
- **Earnings pages** show Solar and Battery stacked for Total; the Gross cost page shows Net bill and Earned stacked (together they make up the gross cost).
- **Colours** on cost, energy and price bars compare the bars shown with each other: green below 0.8× their average, orange up to 1.5×, red above; zero bars are grey and unlabelled. The current, still running day/week/month/year is left out of that average and drawn pale with a normal outline, as "in progress" (otherwise it would nearly always look cheap). Earnings charts use fixed solar/battery colours.
- **Tap a bar** to open the Financials tab on that bar's day, week, month or year.
- **Links between a device's pages:** a device's cost history has a **Power →** link to its power page, and its power page a **Cost history →** link back. The back arrow still returns to each page's own tab.
- While a chart page loads, a thin bar under the header shows progress (only when loading takes longer than a moment).
- **Axes** carry no units or trailing zeros ("20", "2.5") so more labels fit on a phone; the chart titles name what is shown.
- The back arrow returns to the tab you came from.
### 6.5 Per-viewer settings

Period, span and "show idle" choices are stored in each browser (`localStorage`), so a phone and a wall tablet each keep their own view. A chosen period carries across all history pages, and it is linked to the Financials period picker: Day / Week / Month / Year / All on Financials opens the history pages on Daily / Weekly / Monthly / Yearly / All-Time, and picking a tab on a history page sets Financials to the matching period (its current one) when you go back. Custom leaves the history pages as they are.

### 6.6 Taking control

In a storage-mode dashboard, **⋮ → Edit dashboard → Take control** converts the generated dashboard into regular editable cards. The bundled cards keep working as long as the integration is installed, but the dashboard no longer updates itself when you add devices or when the integration is updated.

### 6.7 Bundled cards for your own dashboards

The strategy's script defines three cards you can also use in any dashboard:

**`custom:sbf-financials-card`**: the Financials tab.

```yaml
type: custom:sbf-financials-card
prefix: sensor.sbf_            # your entity prefix, including "sensor."
dash_url: /my-dashboard        # base path for chart/device links (optional)
main_devices:                  # optional
  - label: Kitchen
    target: dev_kitchen        # the part between prefix and "_cost_rate_cumulative"
    icon: mdi:countertop
    nav: /my-dashboard/financials-kitchen
sub_devices: []                # same format
```

**`custom:sbf-power-card`**: the Power tab's summary or device list.

```yaml
type: custom:sbf-power-card
show: summary                  # "summary" or "devices"
prefix: sensor.sbf_            # summary: source of the earnings tiles
dash_url: /my-dashboard        # summary: tiles link to history pages under <dash_url>
price_sensor: sensor.my_price  # summary, optional
efficiency_sensor: sensor.sbf_inverter_efficiency   # summary, optional
temp_sensor: sensor.battery_temperature             # summary, optional
main_devices:                  # devices
  - entity: sensor.kitchen_power
    label: Kitchen
    icon: mdi:countertop
    nav: /my-dashboard/power-kitchen
sub_devices: []
```

**`custom:sbf-tabs-card`**: tabs with span chips around another card. Only the selected tab's card is built. The card config may contain `__NAME__` placeholders, filled from the selected span's `vars`; an array value means `[phone, desktop]`.

```yaml
type: custom:sbf-tabs-card
pref_key: my-tabs              # choices are remembered per browser under this key
title: Charger                 # optional header; tap opens the entity's details
entity: sensor.sbf_dev_charger_cost_rate_cumulative
summary:                       # optional summary line for the selected span
  kind: cost                   # or "earned"
  cost: [sensor.sbf_dev_charger_cost_rate_cumulative]   # summed
  energy: sensor.sbf_dev_charger_energy_rate_cumulative
tabs:
  - label: Daily
    period: d                    # d | w | month | y | all (for the summary)
    default_span: "7"
    spans:
      - { value: "7", label: 7 Days, vars: { SPAN: 7 } }
      - { value: "30", label: 30 Days, vars: { SPAN: 30 } }
    card:
      type: custom:apexcharts-card
      graph_span: __SPAN__d
      series: [...]
```

---

## 7. Upgrading and version history

Migrations run automatically the first time a new version starts, including when upgrading from 1.2.x. Sensors that are no longer provided are removed from the entity registry; their long-term statistics are kept. Device sensors keep their entity IDs and history, but customisations made to them in the entity registry (a changed entity ID, name or icon) are not carried over from versions before 1.4.0.

### 2.2.1: upgrade fixes

- Period totals (`today`, `this_week`, `this_month`, `this_year`) are derived from long-term statistics when no saved baselines exist, instead of starting from zero at the moment of the upgrade.
- All sensors that are no longer provided are removed from the entity registry, including the per-period sensors of versions before 1.3.0.
- History pages wait until custom cards such as `apexcharts-card` are loaded before creating their charts, instead of showing a configuration error.
- The date picker on the Financials tab opens on iOS.


### 2.2.0: money overview

- History pages: header with a summary for the selected span, titled charts, relative bar colours, compact axes, no labels on zero bars. `mushroom` and `card-mod` are no longer needed.
- Gross cost to net bill waterfall and effective cost breakdown (Sankey diagram) on the Financials tab. The Sankey shows the house's effective cost split over devices and sub-devices, in the style of Home Assistant's energy Sankey (vertical on phones).
- Untracked is no longer clamped at zero, so devices plus Untracked always add up to the house total.

### 2.1.0: friendlier setup

- Setup form in sections, with help text for every field and number inputs with units.
- Power sensors in kW are supported.
- Checks on submit for unsupported units and a wrong inverter sign.
- Device hierarchy: sub-devices can name the device they are part of. Existing sub-devices show as "part of another device (not specified)" until you choose.
- Options open as a menu (Sensors / Export price adjustments / Devices), and cleared fields are now really cleared.
- Dutch translation.

### 2.0.0: clean-up release

- Removed the five `select.sbf_*` dashboard helper entities; the dashboard hasn't used them since 1.5. They and their "Solar & Battery Financials Dashboard" device are deleted automatically.
- The inverter sign is now always stored in the configuration. Existing entries without the option get **Invert Inverter AC Sensor** switched on, which is how they already behaved, so nothing changes for you.
- Removed the upgrade code for versions before 1.4.0 (see the note above).
- The dashboard is registered only under the strategy name Home Assistant looks up (`ll-strategy-dashboard-solar-battery-financials`); the old aliases are gone. `strategy: {type: custom:solar-battery-financials}` keeps working.

### 1.5.x: dashboard redesign

- New Financials tab with the period picker and past/custom periods; new Power tab cards in the same style.
- Period and span choices are per browser; history pages build only the selected tab; back arrows return to the right tab.
- The dashboard script is served at an address containing a fingerprint of its contents (`strategy.js?v=<hash>`), updated automatically at startup. Browsers therefore always load the current version after an update or a reload of the integration.
- No longer required: `config-template-card`, `stack-in-card`, `mushroom`, `card-mod`.

### 1.4.0: robustness and rename-safe devices

- Totals pause while a core input is unavailable (previously counted as 0).
- Units follow Home Assistant's currency setting.
- New option **Invert Inverter AC Sensor**.
- New sensor **Inverter Efficiency**.
- Device sensors are now identified by the tracked power sensor instead of the friendly name. Existing sensors are re-keyed automatically and keep their entity IDs and history.
- Only one instance of the integration allowed.
- Options flow updated to Home Assistant's current API.

### 1.3.0: smaller database

- Removed all `*_daily`, `*_weekly`, `*_monthly` and `*_yearly` sensors. Their current values were carried into the new `today` / `this_week` / `this_month` / `this_year` attributes, so nothing reset mid-period, and the old entities were removed from the registry.
- Their old long-term statistics remain until you delete them under **Developer tools → Statistics** (shown as "no longer provided"); the same history is available through the cumulative sensors.
- **Inverter Losses Cost Cumulative** replaced **Inverter Losses Cost Daily**.
- Batched state writes and unrecorded period attributes (see [5.1](#51-database-footprint)).

---

## 8. Troubleshooting

**The dashboard still shows an old version.** Reload the integration (**Settings → Devices & services → Solar & Battery Financials → ⋮ → Reload**) or restart Home Assistant, then refresh the page. Under **Settings → Dashboards → ⋮ → Resources** there should be exactly one `/solar_battery_financials/strategy.js?v=…` entry; delete any duplicates.

**Red "custom element doesn't exist" errors.** A required card from [6.1](#61-requirements) is missing or not loaded; install it via HACS and refresh.

**Values stay at 0 or rate sensors are unavailable.** A core input is unavailable (see [5.2](#52-unavailable-inputs)). Check the grid, price, solar, battery and inverter sensors under **Developer tools → States**. Also check the sign conventions in [2.1](#21-setup).

**House load or efficiency looks wrong.** Check the battery sign (positive = discharging) and whether your inverter AC sensor is negative while supplying; if so, enable **Invert Inverter AC Sensor**.

**Past periods on the Financials tab show "—".** No statistics exist for that period yet; history starts when the cumulative sensors were created.

---

## 9. Developer reference

### 9.1 Files

| File | Responsibility |
|---|---|
| `__init__.py` | Package entry point; only re-exports the lifecycle functions from `entry.py`. |
| `entry.py` | Config entry setup and unload, reload on option changes, and config entry migration (`async_migrate_entry`, current version 2). |
| `frontend_resource.py` | Serves `frontend/strategy.js` at `/solar_battery_financials/strategy.js` and keeps the Lovelace resource URL at `?v=<content hash>`. Retries once Home Assistant has started if dashboards aren't loaded yet. |
| `const.py` | Configuration keys, defaults, write intervals, period attribute names, and ID helpers (`safe_id`, `device_key`, `default_device_name`). |
| `manager.py` | `FinancialManager`: subscribes to the inputs, parses them (including unavailability), runs the calculations from section 4, and drives the write timers. |
| `sensor.py` | Declares all sensors as data (`RATE_SENSORS`, `CUMULATIVE_SENSORS`, `DEVICE_METRICS`), creates them, and runs the registry migrations and cleanup. |
| `sensor_entities.py` | Entity classes: `RateSensor` (instantaneous values) and `CumulativeSensor` (integral, period attributes, restore data). |
| `config_flow.py` | Setup form with sections, validation (units, inverter sign), device names and hierarchy, and the options menu. |
| `frontend/strategy.js` | The dashboard strategy and the bundled cards (see [9.4](#94-dashboard-script-structure)). |
| `strings.json`, `translations/` | UI texts in English and Dutch. |

### 9.2 Data flow

```text
input state change ─► FinancialManager._state_changed
                        ├─ _update_value      (parse; mark core inputs unavailable)
                        └─ recalculate        (section 4; skipped integration while paused)
                             └─ listeners     (CumulativeSensor._integrate: add rate × Δt, roll periods)

every 5 s  ─► rate writers   (RateSensor: write if value/availability changed)
every 60 s ─► recalculate, then total writers (CumulativeSensor: write if total/periods changed)
```

Timers and the state subscription are cancelled when the entry unloads (`FinancialManager.async_stop`).

### 9.3 IDs and migrations

- **Rate sensors:** unique ID `<prefix><key>`, entity ID `sensor.<prefix><key>`.
- **System cumulative sensors:** unique ID and entity ID `<prefix><rate key>_cumulative`.
- **Device cumulative sensors:** unique ID `<prefix>dev_<source entity without "sensor.">_<cost|energy>_rate_cumulative` (stable across renames). Entity ID suggested from the friendly name at creation: `sensor.<prefix>dev_<name slug>_<cost|energy>_rate_cumulative`.
- **Device registry identifiers:** `<prefix>system_financials`, `<prefix>house_untracked`, `<prefix>dev_financials_<source entity>`.
- **Registry cleanup (every setup):** sensors of devices that are no longer tracked are removed.
- **Config entry migration:** version 1 → 2 stores `invert_inverter_ac` explicitly and removes the retired helper selects and their device (`entry.async_migrate_entry`).
- **Restore data** per cumulative sensor: `{"total": float, "baselines": {period: float}, "period_keys": {period: str}, "seeded": bool}`. `seeded` records that the baselines were checked against long-term statistics.

### 9.4 Dashboard script structure

`frontend/strategy.js` is one ES module, organised in numbered sections:

1. **Span options.** Chart span chips for daily/weekly/monthly and power charts.
2. **Subview helpers.**
3. **Colours.** `PALETTE`, the one colour table for the whole dashboard (solar, battery, grid and home follow Home Assistant's energy dashboard), and `GOOD`/`WARN`/`BAD`, the status colours wrapped in the theme's variables.
4. **ApexCharts builders.** `baseApexConfig` (settings every history chart shares), `relativeBarsApex` (bars coloured against each other, via `relativeColorFn`), `areaApex`, zero-hiding label formatters, the data generators (sharing `JS_DEVICE_IDS` and `JS_YEAR_TOTALS`), `makeSeries` (one period tab's series of a total), `periodChart` (a chart card spanning a period tab) and `deviceRateChart` (a device's average price for any tab).
5. **History subviews.** `PERIOD_TABS` drives both device pages (`createDeviceSubviewTab`) and system pages (`SYSTEM_SUBVIEW_CONFIGS`: Total, Solar-only and Battery earnings, Effective cost, Net bill and Gross cost).
6. **Top-level views.** Power (power flow + `sbf-power-card`) and Financials (`sbf-financials-card`).
7. **Utilities and the strategy class.** Prefix detection (falls back to `sensor.sbf_`), icons, `deviceLabel` (a device's name, or the same default the integration uses), `getDevInfo` (sensor key via `source_entity_id`), the sensor pages (`lineChartTab`, `sensorSubview`), and `generateDashboard()`. That function builds all views, sets `back_path` on subviews, and resolves placeholders (`applyPlaceholders`).
8. **Bundled cards.**
   - Shared helpers: `formatMoney`, `formatKwh`, `formatPower`, `tileHtml`, `rowsHtml`, `renderInto` with `morphNodes`, `bindCardActions`, and the diagrams `sankeySvg`, `waterfallSvg`, `segmentBarsSvg` and `priceBarsSvg`. The two bar diagrams share `barLayout`, `barRowSvg` and `fitText`.
   - The cards: `SbfTabsCard` (tabs, spans, header and summary), `SbfFinancialsCard`, `SbfPowerCard`.
   - `SbfFinancialsCard` separates numbers from drawing: `_figures` (the period's totals), `_measure` (one device), `_breakdown` (devices split into sub-devices and "Other", shared by the Sankey and the bars), then `_waterfallHtml`, `_overviewHtml` and `_rowsHtml` draw them. `_deviceColor` gives each device one colour everywhere.

Conventions:

- **Placeholders.** Builders write the entity prefix as `sensor.__prefix__` and currency as `€`/`EUR`. `applyPlaceholders` replaces both in one pass with your prefix and Home Assistant's currency (symbol via `Intl`).
- **In-place updates.** Cards render HTML strings. After the first render, `renderInto` patches the existing DOM in place rather than replacing it; full re-renders make phones jump the scroll position. Clicks use one delegated listener per card, so patched elements keep working.
- **Per-viewer state.** Stored in `localStorage` under `sbf:*` keys: `sbf:fin`, `sbf:fin:idle`, `sbf:fin:unit`, `sbf:fin:chart`, `sbf:fin:details`, `sbf:power:idle`, `sbf:history:tab` and `sbf:history:span:<tab>`, `sbf:power:tab` and `sbf:power:span:<tab>`.
- **Past-period data.** `recorder/statistic_during_period` with `types: ["change"]`, and either `calendar: {period, offset}` or `fixed_period: {start_time, end_time}`, one call per statistic, cached per period.
