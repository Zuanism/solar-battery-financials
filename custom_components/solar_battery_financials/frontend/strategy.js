/**
 * Lovelace dashboard strategy and bundled cards for Solar & Battery Financials.
 * Structure and conventions: README section 9.4.
 */
console.info("⚡ SBF Strategy JS loaded (Modular v6.0)");

// ============================================================================
// 0. LANGUAGE
// ============================================================================
/**
 * Dashboard text follows the viewer's Home Assistant language (English, or Dutch for "nl").
 * Text is written in English and passed through tr() where it is displayed; `{name}`
 * placeholders are filled from `params`. Anything without a translation stays English.
 */
let UI_LANG = "en";
const setUiLang = (hass) => {
  UI_LANG = hass?.locale?.language || hass?.language || UI_LANG;
};

const NL = {
  // Views, pages and links
  "Power": "Vermogen", "Financials": "Financiën", "Cost history": "Kostenhistorie", "History": "Historie",
  "{label} History": "{label} – historie", "{label} Power ({unit})": "{label} – vermogen ({unit})",
  "Electricity Price (€/kWh)": "Stroomprijs (€/kWh)", "Inverter Efficiency (%)": "Omvormerrendement (%)",
  "Battery Temperature ({unit})": "Batterijtemperatuur ({unit})",
  "Total System Earnings": "Totale opbrengst", "Solar-Only Earnings": "Opbrengst zon", "Battery Added Value": "Meerwaarde batterij",
  "Effective Cost": "Effectieve kosten", "Net Bill": "Netto rekening", "Gross Cost": "Brutokosten",
  // Period tabs and controls
  "Daily": "Dagen", "Weekly": "Weken", "Monthly": "Maanden", "Yearly": "Jaren", "All-Time": "Alles",
  "Day": "Dag", "Week": "Week", "Month": "Maand", "Year": "Jaar", "All": "Alles", "Custom": "Aangepast", "Now": "Nu",
  "Today": "Vandaag", "Yesterday": "Gisteren", "This week": "Deze week", "All time": "Alle tijd",
  "Total": "Totaal", "Detailed": "Gedetailleerd", "Flow diagram": "Stroomdiagram", "Bars": "Balken",
  "Previous period": "Vorige periode", "Next period": "Volgende periode", "Pick a date": "Kies een datum", "From": "Van", "To": "Tot",
  // Chart titles and series
  "Cost": "Kosten", "Energy": "Energie", "Average price": "Gemiddelde prijs", "/day": "/dag",
  "Solar": "Zon", "Battery": "Batterij", "Net bill": "Netto rekening", "Earned": "Verdiend",
  "Price": "Prijs", "Efficiency": "Rendement", "Temperature": "Temperatuur",
  // Summary lines
  "{amount} earned": "{amount} verdiend", "avg {price}/kWh": "gem. {price}/kWh", "Avg {value}": "Gem. {value}",
  "peak {value}": "piek {value}", "min {value}": "min {value}", "max {value}": "max {value}", "{value} now": "{value} nu",
  "in the last {span}": "in de afgelopen {span}", "in the last 24 hours": "in de afgelopen 24 uur",
  "in the last 10 years": "in de afgelopen 10 jaar", "all time": "sinds het begin",
  // Financials card
  "Gross cost": "Brutokosten", "Solar earned": "Zon verdiend", "Battery earned": "Batterij verdiend",
  "Solar cost": "Kosten zon", "Battery cost": "Kosten batterij", "Total earned": "Totaal verdiend", "Total cost": "Totale kosten",
  "Effective cost": "Effectieve kosten", "Consumption": "Verbruik", "Other": "Overig", "Untracked": "Niet gemeten",
  "House average {price}": "Huisgemiddelde {price}", "Thicker bar = more kWh": "Dikkere balk = meer kWh",
  "Devices": "Apparaten", "Sub-devices": "Sub-apparaten",
  "Show device details ({counts})": "Apparaatdetails tonen ({counts})", "Hide device details": "Apparaatdetails verbergen",
  "{n} devices": "{n} apparaten", "{n} device": "{n} apparaat", "{n} sub-devices": "{n} sub-apparaten", "{n} sub-device": "{n} sub-apparaat",
  "Hide idle": "Inactieve verbergen", "+{n} idle: {names}": "+{n} inactief: {names}", "No data before {date}": "Geen gegevens vóór {date}",
  // Power card tiles
  "Inverter": "Omvormer", "Battery temp": "Batterijtemp.",
};

/** Span labels such as "14 Days", "8 Weeks", "30-day avg". */
const NL_PATTERNS = [
  [/^(\d+) Days?$/, (n) => `${n} ${n === "1" ? "dag" : "dagen"}`],
  [/^(\d+) Weeks?$/, (n) => `${n} ${n === "1" ? "week" : "weken"}`],
  [/^(\d+) Months?$/, (n) => `${n} ${n === "1" ? "maand" : "maanden"}`],
  [/^(\d+)-day avg$/, (n) => `${n}-daags gem.`],
];

const tr = (text, params = {}) => {
  let out = text;
  if (String(UI_LANG).toLowerCase().startsWith("nl")) {
    if (NL[text]) out = NL[text];
    else {
      const match = NL_PATTERNS.map(([re, f]) => [re.exec(text), f]).find(([m]) => m);
      if (match) out = match[1](match[0][1]);
    }
  }
  return out.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m));
};


/** Entity ID of the cumulative sensor for a metric base, e.g. "sensor.__prefix__system_earnings_rate". */
const totalEntity = (base) => `${base}_cumulative`;

// ============================================================================
// 1. PERIOD SPAN OPTIONS
// ============================================================================
const CHART_PERIOD_CHIPS = {
  daily: [["7", "7 Days"], ["14", "14 Days"], ["30", "30 Days"], ["60", "60 Days"], ["90", "90 Days"]],
  weekly: [["4", "4 Weeks"], ["8", "8 Weeks"], ["12", "12 Weeks"], ["26", "26 Weeks"], ["52", "52 Weeks"]],
  monthly: [["6", "6 Months"], ["12", "12 Months"], ["24", "24 Months"], ["36", "36 Months"]],
};

const ROLLING_CHIPS = [["7", "7-day avg"], ["30", "30-day avg"], ["90", "90-day avg"], ["0", "Total"]];

const POWER_CHIPS = [["1", "1 Day"], ["3", "3 Days"], ["7", "7 Days"], ["14", "14 Days"]];

// ============================================================================
// 2. SUBVIEW HELPERS
// ============================================================================
const makePanelSubview = (title, path, cards) => ({
  title,
  path,
  subview: true,
  type: "panel",
  cards: [{ type: "vertical-stack", cards }],
});

// ============================================================================
// 3. COLOURS
// ============================================================================
/**
 * One colour table for the whole dashboard, so a concept looks the same everywhere.
 * Solar, battery, grid and home follow Home Assistant's energy dashboard. Charts get the
 * hex values; cards wrap the status colours in the theme's variables (GOOD/WARN/BAD).
 */
const PALETTE = {
  good: "#43a047", warn: "#ffa000", bad: "#db4437", neutral: "#9ca3af",
  solar: "#ff9800", battery: "#4db6ac", grid: "#488fc2", home: "#0098d1", earned: "#43a047",
  cost: "#0288d1", energy: "#10b981", price: "#ffa000", power: "#008FFB", other: "#bdbdbd",
  untracked: "#9e9e9e", inverter: "#039be5", temperature: "#ef6c00",
};
const GOOD = `var(--success-color, ${PALETTE.good})`;
const WARN = `var(--warning-color, ${PALETTE.warn})`;
const BAD = `var(--error-color, ${PALETTE.bad})`;

// ============================================================================
// 4. APEXCHARTS BUILDERS & HELPERS
// ============================================================================
const MS_PER_DAY = 86400000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const MS_PER_MONTH = 30 * MS_PER_DAY;

// Axis labels without units or trailing zeros ("20", "2.5", "0.15"), to fit narrow screens.
const EVAL_AXIS_FORMATTER = "EVAL:function(val) {\n  const v = parseFloat(val);\n  return isNaN(v) ? '' : String(parseFloat(v.toFixed(2)));\n}\n";

// Data-label formatters leave zero values unlabelled, so empty days don't add noise.
const EVAL_NUMERIC_FORMATTER =
  "EVAL:function(val) {\n  const v = parseFloat(val);\n  return isNaN(v) || Math.abs(v) < 0.005 ? '' : v.toFixed(2);\n}\n";

const EVAL_RATE_FORMATTER =
  "EVAL:function(val) {\n  const v = parseFloat(val);\n  return isNaN(v) || Math.abs(v) < 0.0005 ? '' : v.toFixed(3);\n}\n";

const EVAL_RATE_TOOLTIP_FORMATTER =
  "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(3) + ' €/kWh';\n  }\n  return '';\n}\n";

const EVAL_MONEY_FORMATTER =
  "EVAL:function(val) {\n  const v = parseFloat(val);\n  return isNaN(v) || Math.abs(v) < 0.005 ? '' : '€' + v.toFixed(2);\n}\n";

const EVAL_STACKED_EARNINGS_FORMATTER = `EVAL:function(val, opts) {
  let s0 = opts.w.globals.series[0][opts.dataPointIndex];
  let s1 = opts.w.globals.series[1][opts.dataPointIndex];
  let valid0 = s0 !== null && s0 !== undefined;
  let valid1 = s1 !== null && s1 !== undefined;
  let val0 = valid0 ? parseFloat(s0) : 0;
  let val1 = valid1 ? parseFloat(s1) : 0;
  let tot = val0 + val1;
  let targetSeries = (valid1 && val1 >= 0) ? 1 : ((valid1 && val1 < 0) ? 0 : (!valid0 && valid1 ? 1 : 0));
  if (opts.seriesIndex === targetSeries) {
      return '€' + tot.toFixed(2);
  }
  return '';
}
`;

/** JS expression (for EVAL functions): start of the current day/week/month/year, in ms. */
const JS_CURRENT_PERIOD_START = {
  d: "new Date(new Date().setHours(0, 0, 0, 0)).getTime()",
  w: "(() => { const d = new Date(new Date().setHours(0, 0, 0, 0)); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); })()",
  month: "new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()",
  y: "new Date(new Date().getFullYear(), 0, 1).getTime()",
};

/**
 * Bar colour relative to the other bars shown: green below 0.8× their average, red above
 * 1.5×, orange in between (zero bars grey). The current, still running period is left out
 * of the average; its fill is drawn pale (`pale`) with a normal outline, marking it as in
 * progress. apexcharts-card rewrites `colors` on every update with the series colour, so
 * this goes into the fill/stroke colours (both accept functions).
 */
const relativeColorFn = (zeroColor, unit, pale) => `EVAL:function({ value, seriesIndex, dataPointIndex, w }) {
  const s = seriesIndex || 0, ys = w.globals.series[s] || [], xs = w.globals.seriesX[s] || [];
  const current = ${JS_CURRENT_PERIOD_START[unit]};
  const partial = (i) => xs[i] >= current;
  const vals = ys.filter((v, i) => v !== null && Math.abs(v) > 0.0005 && !partial(i));
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  if (value === null || value === undefined || Math.abs(value) <= 0.0005 || avg <= 0) return "${zeroColor}";
  const c = value > avg * 1.5 ? "${PALETTE.bad}" : value < avg * 0.8 ? "${PALETTE.good}" : "${PALETTE.warn}";
  return ${pale ? 'partial(dataPointIndex) ? c + "40" : c' : "c"};
}`;
const relativeColors = (unit) => ({
  fill: { type: "solid", opacity: 0.5, colors: [relativeColorFn(PALETTE.neutral, unit, true)] },
  stroke: { show: true, width: 1.5, colors: [relativeColorFn("transparent", unit, false)] },
});

const CHART_BASE = { height: 280, zoom: { enabled: false }, toolbar: { show: false } };

/** Settings shared by every history chart; `extra` overrides (its yaxis is merged). */
const baseApexConfig = (extra = {}) => ({
  chart: CHART_BASE,
  xaxis: { type: "datetime", tooltip: { enabled: false } },
  tooltip: { enabled: true },
  fill: { type: "solid", opacity: 0.5 },
  stroke: { show: true, width: 1.5 },
  grid: { borderColor: "rgba(128, 128, 128, 0.2)", strokeDashArray: 2 },
  ...extra,
  yaxis: { show: true, labels: { formatter: EVAL_AXIS_FORMATTER }, ...(extra.yaxis || {}) },
});

const makeApexDataLabels = (enabled, formatter) => ({
  enabled,
  offsetY: -15,
  style: { colors: ["var(--secondary-text-color)"], fontWeight: 500 },
  background: { enabled: false },
  formatter,
});

/** Column bars for a period tab, coloured relative to each other, with the tab's data labels. */
const relativeBarsApex = (t, formatter = EVAL_NUMERIC_FORMATTER) => ({
  ...relativeColors(t.unit || "y"),
  plotOptions: { bar: { borderRadius: 4, columnWidth: "60%", dataLabels: { position: "top" } } },
  dataLabels: makeApexDataLabels(tabLabels(t), formatter),
});

/**
 * Line chart settings (All-Time tabs), one colour per series. Line charts draw their stroke
 * through the fill settings, so fill opacity must stay 1.
 */
const lineApex = (colors, extra = {}) => ({
  stroke: { show: true, width: 2, curve: "straight", colors },
  fill: { type: "solid", opacity: 1 },
  dataLabels: { enabled: false },
  ...extra,
});

const isYearlyTab = (t) => t.period === "Yearly";
const isAllTimeTab = (t) => t.period === "All-Time";

/** Data labels per tab: off for All-Time, on for Yearly, per viewer ("__LABELS__") otherwise. */
const tabLabels = (t) => (isAllTimeTab(t) ? false : isYearlyTab(t) ? true : "__LABELS__");

// ---- data_generator scripts (they run inside apexcharts-card, with `hass` in scope) ----

const JS_DEVICE_IDS = (devTarget) =>
  `const costId = "sensor.__prefix__${devTarget}_cost_rate_cumulative", energyId = "sensor.__prefix__${devTarget}_energy_rate_cumulative";`;

/** Monthly changes of the last 12 years, and their totals per calendar year. */
const JS_YEAR_TOTALS = `const monthlyChanges = (ids) => hass.callWS({
    type: 'recorder/statistics_during_period',
    start_time: new Date(new Date().getFullYear() - 11, 0, 1).toISOString(),
    end_time: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(),
    statistic_ids: ids,
    period: 'month',
    types: ['change']
  });
  const yearTotals = (rows) => {
    const out = new Map();
    (rows || []).forEach((r) => {
      if (r.change == null) return;
      const y = new Date(r.start).getFullYear();
      out.set(y, (out.get(y) || 0) + r.change);
    });
    return out;
  };
  const yearStart = (y) => new Date(y, 0, 1).getTime();`;

const yearlySumDataGen = (entity) =>
  `return (async () => {
  ${JS_YEAR_TOTALS}
  const res = await monthlyChanges(['${entity}']);
  return [...yearTotals(res?.['${entity}'])]
    .map(([y, v]) => [yearStart(y), parseFloat(v.toFixed(2))])
    .sort((a, b) => a[0] - b[0]);
})();`;

const deviceYearlyRateDataGen = (devTarget) =>
  `return (async () => {
  ${JS_DEVICE_IDS(devTarget)}
  ${JS_YEAR_TOTALS}
  const res = await monthlyChanges([costId, energyId]);
  const costs = yearTotals(res?.[costId]), kwh = yearTotals(res?.[energyId]);
  return [...costs]
    .filter(([y]) => kwh.get(y) > 0)
    .map(([y, c]) => [yearStart(y), parseFloat((c / kwh.get(y)).toFixed(3))])
    .sort((a, b) => a[0] - b[0]);
})();`;

const deviceRateDataGen = (devTarget, spanUnit, statsPeriod) =>
  `return (async () => {
  ${JS_DEVICE_IDS(devTarget)}
  const units = __SPAN__, end = new Date();
  end.setHours(23, 59, 59, 999);
  const mult = ${spanUnit === "d" ? MS_PER_DAY : spanUnit === "w" ? MS_PER_WEEK : MS_PER_MONTH};
  const res = await hass.callWS({
    type: 'recorder/statistics_during_period',
    start_time: new Date(end.getTime() - (units + 1) * mult).toISOString(),
    end_time: end.toISOString(),
    statistic_ids: [costId, energyId],
    period: '${statsPeriod}'
  });
  const costs = (res[costId] || []).slice(-units), energies = res[energyId] || [], energyMap = new Map();
  energies.forEach(e => energyMap.set(new Date(e.start).getTime(), e.change));
  return costs.map(c => {
    const kwh = energyMap.get(new Date(c.start).getTime());
    const val = (c.change != null && kwh != null && kwh > 0) ? parseFloat((c.change / kwh).toFixed(3)) : null;
    return [new Date(c.start).getTime(), val];
  });
})();`;

/**
 * All-Time tabs: one point per day over the whole history, from daily totals. With a window
 * of N days ("__WINDOW__") each point covers the N days up to and including that day: the
 * average per day, or with `perId` the ratio of both sums (e.g. cost / kWh = average price).
 * Window 0 gives the running total (or the running ratio) since the start.
 */
const rollingDataGen = (valueId, perId = null) =>
  `return (async () => {
  const win = __WINDOW__, ids = ['${valueId}'${perId ? `, '${perId}'` : ""}];
  const start = new Date();
  start.setFullYear(start.getFullYear() - 10);
  const res = await hass.callWS({
    type: 'recorder/statistics_during_period',
    start_time: start.toISOString(),
    end_time: new Date().toISOString(),
    statistic_ids: ids,
    period: 'day',
    types: ['change']
  });
  const daily = (id) => new Map((res?.[id] || []).map((r) => [new Date(r.start).getTime(), r.change ?? 0]));
  const values = daily(ids[0]), per = ids[1] ? daily(ids[1]) : null;
  const out = [], window = [];
  let sum = 0, sumPer = 0;
  [...values.keys()].sort((a, b) => a - b).forEach((day) => {
    const v = values.get(day), p = per ? (per.get(day) ?? 0) : 0;
    window.push([v, p]);
    sum += v;
    sumPer += p;
    if (win > 0 && window.length > win) {
      const [v0, p0] = window.shift();
      sum -= v0;
      sumPer -= p0;
    }
    const y = per ? (sumPer > 0 ? sum / sumPer : null) : win > 0 ? sum / window.length : sum;
    if (y !== null) out.push([day, parseFloat(y.toFixed(per ? 3 : 2))]);
  });
  return out;
})();`;

// ---- series and chart cards ----

/**
 * Series of a cumulative sensor for one period tab: per-period change as columns, yearly
 * totals from the data generator, or (All-Time) a running average / running total line.
 */
const makeSeries = (entityBase, name, color, t, unit = "") => {
  const entity = totalEntity(entityBase);
  return {
    entity,
    name,
    type: isAllTimeTab(t) ? "line" : "column",
    ...(color ? { color } : {}),
    ...(unit ? { unit } : {}),
    show: { datalabels: !isAllTimeTab(t) },
    ...(isYearlyTab(t)
      ? { group_by: { func: "last", duration: "1y" }, data_generator: yearlySumDataGen(entity) }
      : isAllTimeTab(t)
        ? { data_generator: rollingDataGen(entity) }
        : { statistics: { type: "change", period: t.stats, align: "start" } }),
  };
};

/**
 * Tapping a bar opens the Financials tab on that bar's day/week/month/year: the target is
 * handed over in localStorage ("sbf:fin:jump") and picked up by SbfFinancialsCard.
 */
const drillToFinancials = (mode) => `EVAL:function(event, chartContext, opts) {
  const x = opts.w.globals.seriesX[opts.seriesIndex][opts.dataPointIndex];
  if (x == null) return;
  try { localStorage.setItem('sbf:fin:jump', JSON.stringify({ mode: '${mode}', date: x })); } catch (e) {}
  history.pushState(null, '', '__DASHURL__/financials');
  window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
}`;

/** An ApexCharts card spanning a period tab: the selected span, 10 years, or all time. */
const periodChart = (t, { title, apex, series, stacked = false, allTimeSpan = "10y" }) => {
  const mode = Object.keys(FIN_TO_HISTORY).find((m) => FIN_TO_HISTORY[m] === t.period);
  const drill = mode && !isAllTimeTab(t)
    ? {
      chart: { ...(apex.chart || CHART_BASE), events: { dataPointSelection: drillToFinancials(mode) } },
      states: { active: { filter: { type: "none" } } }, // no lingering "selected" look
    }
    : {};
  return {
    type: "custom:apexcharts-card",
    ...(stacked ? { stacked: true } : {}),
    graph_span: isAllTimeTab(t) ? allTimeSpan : isYearlyTab(t) ? "10y" : `__SPAN__${t.unit}`,
    span: { end: isYearlyTab(t) ? "year" : "day" },
    header: { show: false, title },
    apex_config: { ...apex, ...drill },
    series,
  };
};

/** Hides a device chart while its sensor has no value yet. */
const conditionalCumulativeChart = (devTarget, card) => ({
  type: "conditional",
  conditions: [
    { entity: `sensor.__prefix__${devTarget}_cost_rate_cumulative`, state_not: "unavailable" },
    { entity: `sensor.__prefix__${devTarget}_cost_rate_cumulative`, state_not: "unknown" },
  ],
  card,
});

/** A device's average price (€/kWh) per period, computed from its cost and energy totals. */
const deviceRateChart = (t, devTarget, label, allTimeSpan) => {
  const allTime = isAllTimeTab(t);
  const rateAxis = {
    yaxis: { show: true, labels: { formatter: EVAL_AXIS_FORMATTER } },
    tooltip: { enabled: true, y: { formatter: EVAL_RATE_TOOLTIP_FORMATTER } },
  };
  const ids = ["cost", "energy"].map((m) => `sensor.__prefix__${devTarget}_${m}_rate_cumulative`);
  const data_generator = allTime
    ? rollingDataGen(...ids)
    : isYearlyTab(t)
      ? deviceYearlyRateDataGen(devTarget)
      : deviceRateDataGen(devTarget, t.unit, t.stats);
  return conditionalCumulativeChart(devTarget, periodChart(t, {
    title: `${label} (EUR/kWh)`,
    allTimeSpan,
    apex: allTime
      ? baseApexConfig(lineApex([PALETTE.price], rateAxis))
      : { ...baseApexConfig(relativeBarsApex(t, EVAL_RATE_FORMATTER)), ...rateAxis },
    series: [{
      entity: `sensor.__prefix__${devTarget}_cost_rate_cumulative`,
      name: `${label} (EUR/kWh)`,
      color: PALETTE.price,
      type: allTime ? "line" : "column",
      unit: " €/kWh",
      float_precision: 3,
      show: { datalabels: !allTime },
      ...(isYearlyTab(t) ? { group_by: { func: "last", duration: "1y" } } : {}),
      data_generator,
    }],
  }));
};

// ============================================================================
// 5. HISTORY SUBVIEWS (DEVICES AND SYSTEM)
// ============================================================================
// One table drives both device and system subviews.
const PERIOD_TABS = [
  { period: "Daily", suffix: "daily", unit: "d", stats: "day", chips: CHART_PERIOD_CHIPS.daily, defaultSpan: "7", mCut: 7, dCut: 30 },
  { period: "Weekly", suffix: "weekly", unit: "w", stats: "week", chips: CHART_PERIOD_CHIPS.weekly, defaultSpan: "12", mCut: 8, dCut: 26 },
  { period: "Monthly", suffix: "monthly", unit: "month", stats: "month", chips: CHART_PERIOD_CHIPS.monthly, defaultSpan: "12", mCut: 6, dCut: 24 },
  { period: "Yearly", suffix: "yearly", titleSuffix: "Last 10 Years" },
  // All-Time: running averages over the chosen window (or the running total), one point per day.
  { period: "All-Time", suffix: "cumulative", titleSuffix: "All-Time", chips: ROLLING_CHIPS, defaultSpan: "30", spanVars: (n) => ({ WINDOW: n, PERDAY: n ? tr("/day") : "" }) },
];

/** One tab of an sbf-tabs-card: the period's card, its spans and summary period. */
const periodTab = (t, card) => ({
  label: t.period,
  card,
  period: t.unit || (isYearlyTab(t) ? "y" : "all"),
  ...(t.chips
    ? {
      default_span: t.defaultSpan,
      spans: t.chips.map(([value, label]) => ({
        value,
        label,
        vars: t.spanVars
          ? t.spanVars(Number(value))
          : { SPAN: Number(value), LABELS: [Number(value) <= t.mCut, Number(value) <= t.dCut] },
      })),
    }
    : {}),
});

/**
 * Period tabs shared by all history subviews, so a chosen period sticks across them.
 * header: {title, entity (opens its dialog), summary: {cost: [ids], energy?: id, kind: "cost"|"earned"}
 *   or {kind: "power"|"stat", entity} for a sensor page (average, min/peak/max, and energy for power)}
 */
const periodTabsCard = (tabs, header = {}) => ({ type: "custom:sbf-tabs-card", pref_key: "history", tabs, ...header });

/** Adds a small title above an ApexCharts card (or the card inside a conditional). */
const withTitle = (card, title) => {
  const apex = card.type === "conditional" ? card.card : card;
  apex.header = { show: true, title, show_states: false, colorize_states: false };
  return card;
};

/** A device's history tab: its cost, energy and average price for the period. */
const createDeviceSubviewTab = (t, label, devTarget, allTimeSpan = "10y") => {
  const allTime = isAllTimeTab(t);
  const amountChart = (metric, name, color, unit) =>
    periodChart(t, {
      title: name,
      allTimeSpan,
      apex: baseApexConfig(allTime ? lineApex([color]) : relativeBarsApex(t)),
      series: [makeSeries(`sensor.__prefix__${devTarget}_${metric}`, name, allTime ? color : null, t, unit)],
    });
  return periodTab(t, {
    type: "vertical-stack",
    cards: [
      // All-Time averages are per day ("__PERDAY__" is "/day" there, empty for the Total).
      withTitle(amountChart("cost_rate", label, PALETTE.cost, allTime ? " €" : ""), `${tr("Cost")} (€${allTime ? "__PERDAY__" : ""})`),
      withTitle(amountChart("energy_rate", `${label} (Energy)`, PALETTE.energy, " kWh"), `${tr("Energy")} (kWh${allTime ? "__PERDAY__" : ""})`),
      withTitle(deviceRateChart(t, devTarget, label, allTimeSpan), `${tr("Average price")} (€/kWh)`),
    ],
  });
};

const buildDeviceSubview = (label, devTarget, allTimeSpan = "10y") =>
  makePanelSubview(tr("{label} History", { label: tr(label) }), `financials-${slugify(label)}`, [
    periodTabsCard(PERIOD_TABS.map((t) => createDeviceSubviewTab(t, label, devTarget, allTimeSpan)), {
      title: tr(label),
      link: { label: tr("Power"), path: `__DASHURL__/power-${slugify(label)}` }, // its page on the Power side
      entity: totalEntity(`sensor.__prefix__${devTarget}_cost_rate`),
      summary: {
        kind: "cost",
        cost: [totalEntity(`sensor.__prefix__${devTarget}_cost_rate`)],
        energy: totalEntity(`sensor.__prefix__${devTarget}_energy_rate`),
      },
    }),
  ]);

/** Apex settings for a single-series earnings chart. */
const earningsApex = (color) => (t) => ({
  stroke: { show: true, width: 1.5, colors: [color] },
  dataLabels: makeApexDataLabels(tabLabels(t), EVAL_MONEY_FORMATTER),
});

/** Apex settings for two stacked series (Solar + Battery, or Net bill + Earned). */
const stackedApex = (colors) => (t) => ({
  chart: { ...CHART_BASE, stacked: true },
  stroke: { show: true, width: 1.5, colors },
  dataLabels: makeApexDataLabels(tabLabels(t), EVAL_STACKED_EARNINGS_FORMATTER),
});

const moneyBarsApex = (t) => relativeBarsApex(t, EVAL_MONEY_FORMATTER);

const P = "sensor.__prefix__";
const SYSTEM_SUBVIEW_CONFIGS = [
  {
    title: "Total System Earnings",
    path: "financials-total-system-earnings",
    sensorKey: "system_earnings",
    summaryKind: "earned",
    stacked: true,
    getApexConfig: stackedApex([PALETTE.solar, PALETTE.battery]),
    getSeries: (t) => [
      makeSeries(`${P}solar_only_earnings_rate`, tr("Solar"), PALETTE.solar, t),
      makeSeries(`${P}battery_added_value_rate`, tr("Battery"), PALETTE.battery, t),
    ],
  },
  {
    title: "Solar-Only Earnings",
    path: "financials-solar-only-earnings",
    sensorKey: "solar_only_earnings",
    summaryKind: "earned",
    getApexConfig: earningsApex(PALETTE.solar),
    getSeries: (t) => [makeSeries(`${P}solar_only_earnings_rate`, "Solar-Only Earnings", PALETTE.solar, t)],
  },
  {
    title: "Battery Added Value",
    path: "financials-battery-added-value",
    sensorKey: "battery_added_value",
    summaryKind: "earned",
    getApexConfig: earningsApex(PALETTE.battery),
    getSeries: (t) => [makeSeries(`${P}battery_added_value_rate`, "Battery Added Value", PALETTE.battery, t)],
  },
  {
    title: "Effective Cost",
    path: "financials-effective-cost",
    sensorKey: "total_system_cost",
    energyKey: "total_system_energy",
    getApexConfig: moneyBarsApex,
    getSeries: (t) => [makeSeries(`${P}total_system_cost_rate`, "Effective Cost", PALETTE.home, t)],
  },
  {
    title: "Net Bill",
    path: "financials-net-bill",
    sensorKey: "net_grid_cost",
    getApexConfig: moneyBarsApex,
    getSeries: (t) => [makeSeries(`${P}net_grid_cost_rate`, "Net Bill", PALETTE.grid, t)],
  },
  {
    // Gross cost has no total of its own: it is Net bill + Total earned, shown stacked.
    title: "Gross Cost",
    path: "financials-gross-cost",
    sensorKey: "net_grid_cost",
    summaryKeys: ["net_grid_cost", "system_earnings"], // gross = net bill + earned
    stacked: true,
    getApexConfig: stackedApex([PALETTE.grid, PALETTE.earned]),
    getSeries: (t) => [
      makeSeries(`${P}net_grid_cost_rate`, tr("Net bill"), PALETTE.grid, t),
      makeSeries(`${P}system_earnings_rate`, tr("Earned"), PALETTE.earned, t),
    ],
  },
];

/** A system page's tab. All-Time shows plain lines (not stacked), one per series. */
const createSystemSubviewTab = (t, cfg, allTimeSpan = "10y") => {
  const series = cfg.getSeries(t);
  const allTime = isAllTimeTab(t);
  return periodTab(t, periodChart(t, {
    title: cfg.title,
    stacked: cfg.stacked && !allTime,
    allTimeSpan,
    apex: allTime
      ? baseApexConfig(lineApex(series.map((sr) => sr.color)))
      : { ...baseApexConfig(), ...cfg.getApexConfig(t) },
    series,
  }));
};

const buildSystemSubviews = (allTimeSpan = "10y") =>
  SYSTEM_SUBVIEW_CONFIGS.map((cfg) =>
    makePanelSubview(tr("{label} History", { label: tr(cfg.title) }), cfg.path, [
      periodTabsCard(PERIOD_TABS.map((t) => createSystemSubviewTab(t, cfg, allTimeSpan)), {
        title: tr(cfg.title),
        entity: totalEntity(`${P}${cfg.sensorKey}_rate`),
        summary: {
          kind: cfg.summaryKind || "cost",
          cost: (cfg.summaryKeys || [cfg.sensorKey]).map((k) => totalEntity(`${P}${k}_rate`)),
          ...(cfg.energyKey ? { energy: totalEntity(`${P}${cfg.energyKey}_rate`) } : {}),
        },
      }),
    ]));
// ============================================================================
// 6. TOP-LEVEL VIEWS (POWER & FINANCIALS)
// ============================================================================
/**
 * Builds the top-level Power flow view with status cards and individual device breakdowns.
 * @param {Object} opts
 * @param {string} opts.prefix - Entity ID prefix (e.g. "sensor.__prefix__")
 * @param {Object} opts.totPwr - HA state object for total_power_consumption sensor
 * @param {Object} opts.states - Full hass.states dictionary
 * @param {string[]} opts.mainDevs - Filtered main tracked device entity IDs
 * @param {string[]} opts.subDevs - Subset device entity IDs
 * @param {Object} opts.names - Device entity ID → friendly name mapping
 * @param {string} opts.untrackedSensor - Entity ID for untracked power
 * @param {string} opts.dashUrl - Current dashboard base URL
 */
const buildPowerView = ({ prefix, totPwr, states, mainDevs, subDevs, names, untrackedSensor, dashUrl }) => {
  const gridSensor = totPwr?.attributes?.grid_sensor || "sensor.dummy_grid_power";
  const solarSensor = totPwr?.attributes?.solar_sensor || "sensor.dummy_solar_power";
  const batSensor = totPwr?.attributes?.battery_sensor;
  const priceSensor = totPwr?.attributes?.price_sensor;

  let socSensor = null;
  let tempSensor = null;
  if (batSensor) {
    const g1 = batSensor.replace("_power", "");
    const g2 = batSensor + "_soc";
    const g3 = batSensor.replace("_power", "_soc");
    if (states[g1]?.attributes?.unit_of_measurement === "%") socSensor = g1;
    else if (states[g2]) socSensor = g2;
    else if (states[g3]) socSensor = g3;

    tempSensor = findBatteryTemp(batSensor, states);
  }

  const getDevLabel = (dev) => deviceLabel(dev, names);

  const flowIndividuals = [
    ...mainDevs.map((dev) => ({
      entity: dev,
      name: getDevLabel(dev),
      icon: getSmartIcon(getDevLabel(dev), dev, states),
      secondary_info: {},
    })),
    { entity: untrackedSensor, name: "Untracked", icon: "mdi:help-network-outline", secondary_info: {} },
  ];

  // Compact one-line earnings summary; the full breakdown lives on the Financials tab.
  const devItem = (dev, label = getDevLabel(dev)) => ({
    entity: dev,
    label,
    icon: getSmartIcon(label, dev, states),
    nav: `${dashUrl}/power-${slugify(label)}`,
  });

  return {
    type: "sections",
    max_columns: 3,
    title: tr("Power"),
    path: "power",
    sections: [
      {
        type: "grid",
        cards: [
          {
            type: "custom:power-flow-card-plus",
            entities: {
              battery: {
                entity: batSensor || "sensor.dummy_battery_power",
                ...(socSensor ? { state_of_charge: socSensor, show_state_of_charge: true, state_of_charge_unit_white_space: true } : (!batSensor ? { state_of_charge: "sensor.dummy_battery_soc", show_state_of_charge: true, state_of_charge_unit_white_space: true } : {})),
              },
              grid: { entity: gridSensor, secondary_info: {} },
              solar: { display_zero_state: true, secondary_info: {}, entity: solarSensor },
              fossil_fuel_percentage: { secondary_info: {} },
              home: { entity: `${prefix}total_power_consumption`, secondary_info: {} },
              individual: flowIndividuals,
            },
            clickable_entities: true,
            display_zero_lines: { mode: "show", transparency: 50, grey_color: [189, 189, 189] },
            use_new_flow_rate_model: true,
            base_decimals: 0,
            kilo_decimals: 1,
            min_flow_rate: 0.75,
            max_flow_rate: 6,
            max_expected_power: 2000,
            min_expected_power: 0.01,
            kilo_threshold: 1000,
          },
          {
            type: "custom:sbf-power-card",
            show: "summary",
            prefix,
            dash_url: dashUrl,
            price_sensor: priceSensor || null,
            efficiency_sensor: states[`${prefix}inverter_efficiency`] ? `${prefix}inverter_efficiency` : null,
            temp_sensor: tempSensor,
          },
        ],
      },
      {
        type: "grid",
        cards: [
          {
            type: "custom:sbf-power-card",
            show: "devices",
            main_devices: [...mainDevs.map((d) => devItem(d)), { ...devItem(untrackedSensor, "Untracked"), icon: "mdi:help-network-outline" }],
            sub_devices: subDevs.map((d) => devItem(d)),
          },
        ],
      },
    ],
  };
};

/**
 * Builds the Financials view: one sbf-financials-card with its own period picker.
 */
const buildFinancialsView = ({ mainDevs, subDevs, states, names, prefix, untrackedSensor, dashUrl, dataStart = null }) => {
  const toItem = (dev) => {
    const { label, devTarget } = getDevInfo(dev, states, names, prefix, untrackedSensor);
    return {
      label,
      target: devTarget,
      icon: getSmartIcon(label, dev, states),
      nav: `${dashUrl}/financials-${slugify(label)}`,
    };
  };
  const parents = states[`${prefix}total_power_consumption`]?.attributes?.device_parents || {};
  const toSubItem = (dev) => {
    const parent = parents[dev];
    return { ...toItem(dev), ...(parent ? { parent: getDevInfo(parent, states, names, prefix, untrackedSensor).devTarget } : {}) };
  };
  return {
    type: "panel",
    title: tr("Financials"),
    path: "financials",
    cards: [
      {
        type: "custom:sbf-financials-card",
        prefix: "sensor.__prefix__",
        dash_url: dashUrl,
        main_devices: [...mainDevs, untrackedSensor].map(toItem),
        sub_devices: subDevs.map(toSubItem),
        ...(dataStart ? { data_start: dataStart } : {}),
      },
    ],
  };
};

// ============================================================================
// 7. UTILITIES, STRATEGY CLASS & REGISTRATION
// ============================================================================
const DEFAULT_PREFIX = "sensor.sbf_";
const getPrefix = (states) => {
  if (!states) return DEFAULT_PREFIX;
  const marker = "_system_earnings_rate_cumulative";
  const sample = Object.keys(states).find((id) => id.startsWith("sensor.") && id.endsWith(marker));
  return sample ? sample.slice(0, -marker.length) + "_" : DEFAULT_PREFIX;
};

const slugify = (str, separator = "-") =>
  (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`(^\\${separator}+|\\${separator}+$)`, "g"), "");

const ICON_PATTERNS = [
  [["kitchen", "keuken", "dish", "vaat"], "mdi:countertop"],
  [["living", "woon", "couch", "bank"], "mdi:sofa"],
  [["bed", "slaap"], "mdi:bed"],
  [["wash", "was"], "mdi:washing-machine"],
  [["tv", "tele"], "mdi:television"],
  [["charg", "laad", "ev", "myenergi"], "mdi:ev-station"],
  [["airco", "clima", "heat", "warm", "cool"], "mdi:air-conditioner"],
  [["light", "lamp", "licht"], "mdi:lightbulb"],
  [["office", "kantoor", "desk"], "mdi:desk"],
  [["attic", "zolder", "roof"], "mdi:home-roof"],
  [["untracked"], "mdi:help-network-outline"],
];

const getSmartIcon = (name, entityId, states = {}) => {
  if (states[entityId]?.attributes?.icon) return states[entityId].attributes.icon;
  const n = (name || "").toLowerCase();
  const match = ICON_PATTERNS.find(([keys]) => keys.some((k) => n.includes(k)));
  return match ? match[1] : "mdi:power-plug";
};

/**
 * Resolves a device's display label and backend sensor slug target.
 * @param {string} devId - Original entity ID
 * @param {Object} states - Full hass.states dictionary
 * @param {Object} names - Custom name mappings
 * @param {string} prefix - Entity ID prefix
 * @param {string} untrackedSensor - Entity ID for untracked power
 * @returns {{ label: string, devTarget: string }}
 */
/**
 * A tracked device's display name: its configured name, or the same default the integration
 * gives it ("sensor.living_room_lamp_power" → "Living Room Lamp").
 */
const deviceLabel = (dev, names = {}) =>
  names[dev] || dev.replace(/^sensor\./, "").replace(/_power/g, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Label and sensor key ("dev_…") of a tracked device. The key is read from the device's cost
 * sensor (its source_entity_id attribute), falling back to the name the integration suggests.
 */
const getDevInfo = (devId, states, names, prefix, untrackedSensor) => {
  const label = devId === untrackedSensor ? "Untracked" : deviceLabel(devId, names);
  const suffix = "_cost_rate_cumulative";
  const base = prefix.startsWith("sensor.") ? prefix : `sensor.${prefix}`;
  const costEntity = Object.keys(states).find(
    (e) => e.startsWith(base) && e.endsWith(suffix) && states[e]?.attributes?.source_entity_id === devId
  );
  const devTarget = costEntity
    ? costEntity.slice(base.length, -suffix.length)
    : devId === untrackedSensor ? "untracked" : `dev_${slugify(label, "_")}`;
  return { label, devTarget };
};

/** Temperature sensor next to the battery power sensor, found by naming convention. */
const findBatteryTemp = (batSensor, states) => {
  if (!batSensor) return null;
  const candidates = [batSensor.replace("_power", "_temperature"), batSensor.replace("_battery_power", "_battery_temperature")];
  return candidates.find((id) => states[id]) || null;
};

/**
 * Line-chart tab over 1 / 3 / 7 / 14 days for sensor pages (power, price, inverter, temperature).
 * With long-term statistics it plots 5-minute means (up to 3 days) or hourly means; without,
 * the recorded history averaged per 5 minutes or hour (the "raw" statistics period is
 * dropped in SbfTabsCard._mount); hasStats "raw" plots every recorded value (for step-wise
 * sensors such as prices). `detail` adds the "Detailed" pill (power only).
 */
const lineChartTab = ({ entityId, name, unit, color, hasStats, detail = false, curve = "straight", fromZero = false, area = true }) => ({
  label: "History",
  period: "h",
  default_span: "1",
  spans: POWER_CHIPS.map(([value, spanLabel]) => {
    const short = Number(value) <= 3;
    return {
      value,
      label: spanLabel,
      vars: hasStats === "raw"
        ? { SPAN: Number(value), STATPERIOD: "raw", GROUPBY: { func: "raw" } }
        : hasStats
          ? { SPAN: Number(value), STATPERIOD: short ? "5minute" : "hour", GROUPBY: { func: "raw" } }
          : { SPAN: Number(value), STATPERIOD: "raw", GROUPBY: { func: "avg", duration: short ? "5min" : "1h" } },
      // "Detailed" (1 and 3 days): raw readings, reduced to the highest reading per
      // 1 or 3 minutes so the chart stays at ~1,440 points and spikes are never hidden.
      // Longer spans have no detail: the recorder keeps raw data for 10 days only, and
      // more points than this make the chart too slow to draw.
      ...(detail && short
        ? { detail_vars: { STATPERIOD: "raw", GROUPBY: { func: "max", duration: `${value}min` } } }
        : {}),
    };
  }),
  card: {
    type: "custom:apexcharts-card",
    graph_span: "__SPAN__d",
    hours_12: "__HOURS12__",
    header: { show: false },
    apex_config: {
      chart: { height: 360, toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: false } },
      // Line charts draw their stroke through the fill settings, so opacity must stay 1 there.
      fill: { type: "solid", opacity: area ? 0.15 : 1 },
      stroke: { show: true, width: 2, curve },
      grid: { borderColor: "rgba(128, 128, 128, 0.2)", strokeDashArray: 2 },
      tooltip: { enabled: true, x: { format: "dd MMM, HH:mm" } },
      xaxis: { type: "datetime", tooltip: { enabled: false } },
      yaxis: { ...(fromZero ? { min: 0 } : {}), labels: { formatter: EVAL_AXIS_FORMATTER } },
    },
    series: [
      {
        entity: entityId,
        name,
        color,
        type: area ? "area" : "line",
        unit: ` ${unit}`,
        show: { datalabels: false },
        group_by: "__GROUPBY__",
        statistics: { type: "mean", period: "__STATPERIOD__" },
      },
    ],
  },
});

/** A sensor page: header (title, live value, summary over the span) above a line chart. */
const sensorSubview = ({ path, title, entityId, format, tab, link = null }) =>
  makePanelSubview(title, path, [
    {
      type: "custom:sbf-tabs-card",
      pref_key: "power",
      title,
      entity: entityId,
      live: entityId,
      summary: { kind: format.kind === "power" ? "power" : "stat", entity: entityId },
      format,
      ...(link ? { link } : {}),
      tabs: [tab],
    },
  ]);

const buildPowerSubview = (entityId, label, slug, unit = "W") =>
  sensorSubview({
    path: `power-${slug}`,
    title: tr("{label} Power ({unit})", { label: tr(label), unit }),
    entityId,
    format: { kind: "power" },
    tab: lineChartTab({ entityId, name: label, unit: "W", color: PALETTE.power, hasStats: true, detail: true, fromZero: true }),
    link: { label: tr("Cost history"), path: `__DASHURL__/financials-${slug}` }, // its page on the Financials side
  });

const hasStatistics = (states, id) => Boolean(states[id]?.attributes?.state_class);

/** Pages behind the Price / Inverter / Battery temp tiles on the Power view. */
const STATUS_PATHS = { price: "power-price", inverter: "power-inverter", temp: "power-battery-temperature" };

const buildStatusSubviews = ({ priceSensor, efficiencySensor, tempSensor, states }) => {
  const views = [];
  if (priceSensor) {
    views.push(sensorSubview({
      path: STATUS_PATHS.price, title: tr("Electricity Price (€/kWh)"), entityId: priceSensor, format: { kind: "price" },
      // Prices change in steps (every 15 min or hour), so the recorded history is plotted
      // as is: few points, exact steps, and no gap before statistics started.
      tab: lineChartTab({ entityId: priceSensor, name: tr("Price"), unit: "€/kWh", color: PALETTE.price,
        hasStats: "raw", curve: "stepline", area: false }),
    }));
  }
  if (efficiencySensor) {
    views.push(sensorSubview({
      path: STATUS_PATHS.inverter, title: tr("Inverter Efficiency (%)"), entityId: efficiencySensor,
      format: { kind: "number", unit: "%", decimals: 1 },
      tab: lineChartTab({ entityId: efficiencySensor, name: tr("Efficiency"), unit: "%", color: PALETTE.inverter,
        hasStats: hasStatistics(states, efficiencySensor), area: false }),
    }));
  }
  if (tempSensor) {
    const unit = states[tempSensor]?.attributes?.unit_of_measurement || "°C";
    views.push(sensorSubview({
      path: STATUS_PATHS.temp, title: tr("Battery Temperature ({unit})", { unit }), entityId: tempSensor,
      format: { kind: "number", unit: ` ${unit}`, decimals: 1 },
      tab: lineChartTab({ entityId: tempSensor, name: tr("Temperature"), unit, color: PALETTE.temperature,
        hasStats: hasStatistics(states, tempSensor), area: false }),
    }));
  }
  return views;
};

/**
 * Whether times should show am/pm. An explicit 12/24 choice in the user's profile wins;
 * "language" is resolved with the home's country too, so English in e.g. the Netherlands
 * gives 24-hour times while English in the US gives am/pm.
 */
const uses12Hours = (hass) => {
  const { time_format: format, language = "en" } = hass?.locale || {};
  if (format === "12" || format === "24") return format === "12";
  const country = hass?.config?.country;
  const tag = format === "system" ? navigator.language : country ? `${language.split("-")[0]}-${country}` : language;
  try {
    return new Intl.DateTimeFormat(tag, { hour: "numeric" }).resolvedOptions().hour12 === true;
  } catch (e) {
    return false;
  }
};

/**
 * Builders are written with fixed placeholders: the "sensor.__prefix__" entity prefix and
 * "€"/"EUR" for currency. They are resolved here in one pass, which keeps the ~60
 * builder call sites free of prefix/currency plumbing.
 */
const PREFIX_PLACEHOLDER = "sensor.__prefix__";
const applyPlaceholders = (views, prefix, currency = "EUR") => {
  let str = JSON.stringify(views);
  str = str.replaceAll(PREFIX_PLACEHOLDER, prefix);
  if (currency && currency !== "EUR") {
    let symbol = currency;
    try {
      symbol = new Intl.NumberFormat(undefined, { style: "currency", currency })
        .formatToParts(0).find((p) => p.type === "currency")?.value || currency;
    } catch (e) { /* unknown currency code: fall back to the code itself */ }
    str = str.replaceAll("€", JSON.stringify(symbol).slice(1, -1)).replace(/\bEUR\b/g, currency);
  }
  return JSON.parse(str);
};

class SbfDashboardStrategy extends HTMLElement {
  static async generateDashboard(info) {
    setUiLang(info.hass);
    const states = info.hass ? info.hass.states : {};
    const prefix = getPrefix(states);
    const parts = window.location.pathname.split("/");
    const dashUrl = parts.length > 1 && parts[1] !== "" ? "/" + parts[1] : "";

    let dynamicAllTimeSpan = "10y";
    let dataStart = null; // first day with statistics, so Financials can say "No data before …"
    if (info.hass && typeof info.hass.callWS === "function") {
      try {
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        const checkSensors = [
          prefix + "total_system_cost_rate_cumulative",
          prefix + "solar_only_earnings_rate_cumulative",
          prefix + "net_grid_cost_rate_cumulative",
        ];
        const res = await info.hass.callWS({
          type: "recorder/statistics_during_period",
          start_time: tenYearsAgo.toISOString(),
          statistic_ids: checkSensors,
          period: "month",
          types: ["state", "change"],
        });
        let earliestTs = Infinity;
        if (res) {
          for (const sId of checkSensors) {
            const pts = res[sId];
            if (pts && pts.length > 0 && pts[0].start) {
              const ts = new Date(pts[0].start).getTime();
              if (ts < earliestTs) {
                earliestTs = ts;
              }
            }
          }
        }
        if (earliestTs < Infinity) {
          // Monthly rows start on the 1st; daily rows of that month give the actual first day.
          const days = await info.hass.callWS({
            type: "recorder/statistics_during_period",
            start_time: new Date(earliestTs).toISOString(),
            end_time: new Date(earliestTs + 32 * 86400000).toISOString(),
            statistic_ids: checkSensors,
            period: "day",
            types: ["change"],
          });
          const firstDays = checkSensors.map((id) => days?.[id]?.find((r) => r.change)?.start).filter(Boolean);
          dataStart = firstDays.length ? Math.min(...firstDays.map((d) => new Date(d).getTime())) : earliestTs;
          const allTimeDays = Math.ceil((Date.now() - earliestTs) / (1000 * 60 * 60 * 24));
          if (allTimeDays > 0) {
            dynamicAllTimeSpan = `${allTimeDays + 2}d`;
          }
        }
      } catch (err) {
        console.warn("SBF: Failed to query dynamic all-time span, falling back to 10y", err);
      }
    }

    const totPwr = states[prefix + "total_power_consumption"];
    const tracked = totPwr?.attributes?.tracked_devices || [];
    const subDevs = totPwr?.attributes?.sub_devices || [];
    const names = {
      ...(totPwr?.attributes?.device_names || {}),
      ...(info.config?.device_names || {}),
    };
    const untrackedSensor = prefix + "untracked_power";
    const mainDevs = tracked.filter((dev) => !subDevs.includes(dev));
    const allDevs = [...mainDevs, untrackedSensor, ...subDevs];

    const powerView = buildPowerView({ prefix, totPwr, states, mainDevs, subDevs, names, untrackedSensor, dashUrl });
    const finView = buildFinancialsView({ mainDevs, subDevs, states, names, prefix, untrackedSensor, dashUrl, dataStart });

    const powerSubviews = allDevs.map((dev) => {
      const label = dev === untrackedSensor ? "Untracked" : deviceLabel(dev, names);
      return buildPowerSubview(dev, label, slugify(label), states[dev]?.attributes?.unit_of_measurement === "kW" ? "kW" : "W");
    });

    const statusSubviews = buildStatusSubviews({
      priceSensor: totPwr?.attributes?.price_sensor,
      efficiencySensor: states[`${prefix}inverter_efficiency`] ? `${prefix}inverter_efficiency` : null,
      tempSensor: findBatteryTemp(totPwr?.attributes?.battery_sensor, states),
      states,
    });

    const deviceSubviews = allDevs.map((dev) => {
      const { label, devTarget } = getDevInfo(dev, states, names, prefix, untrackedSensor);
      return buildDeviceSubview(label, devTarget, dynamicAllTimeSpan);
    });

    const systemSubviews = buildSystemSubviews(dynamicAllTimeSpan);
    // HA's back arrow only knows one fixed target per page, so the earnings pages opened from
    // the Power tab's tiles are copies under "power-…" that lead back to Power.
    const earningsPaths = EARNINGS.map((e) => e.path);
    const powerEarningsSubviews = systemSubviews
      .filter((v) => earningsPaths.includes(v.path))
      .map((v) => ({ ...v, path: `power-${v.path}` }));

    // Explicit back targets: otherwise HA's back arrow returns to the first tab (Power).
    const withBack = (views, parent) => views.map((v) => ({ ...v, back_path: `${dashUrl}/${parent}` }));
    const allViews = [
      powerView,
      finView,
      ...withBack([...powerSubviews, ...statusSubviews, ...powerEarningsSubviews], "power"),
      ...withBack([...deviceSubviews, ...systemSubviews], "financials"),
    ];
    const views = applyPlaceholders(allViews, prefix, info.hass?.config?.currency);
    return {
      views: JSON.parse(JSON.stringify(views)
        .replaceAll('"__HOURS12__"', String(uses12Hours(info.hass)))
        .replaceAll("__DASHURL__", dashUrl)),
    };
  }
}

// ============================================================================
// 8. BUNDLED CARDS (per-viewer state; no global helper entities)
// ============================================================================
const readPref = (key, fallback) => {
  try {
    const v = window.localStorage.getItem(`sbf:${key}`);
    return v === null ? fallback : JSON.parse(v);
  } catch (e) {
    return fallback;
  }
};

/**
 * The Financials period and the history pages' period tab follow each other, so Month on
 * Financials opens the charts on Monthly and vice versa. Custom has no chart equivalent.
 */
const FIN_TO_HISTORY = { day: "Daily", week: "Weekly", month: "Monthly", year: "Yearly", all: "All-Time" };
const linkPeriodFromFinancials = (mode) => FIN_TO_HISTORY[mode] && writePref("history:tab", FIN_TO_HISTORY[mode]);
const linkPeriodFromHistory = (tab) => {
  const mode = Object.keys(FIN_TO_HISTORY).find((m) => FIN_TO_HISTORY[m] === tab);
  if (mode) writePref("fin", { ...readPref("fin", {}), mode });
};

const writePref = (key, value) => {
  try {
    window.localStorage.setItem(`sbf:${key}`, JSON.stringify(value));
  } catch (e) { /* storage unavailable: the choice just isn't remembered */ }
};

const navigateTo = (path) => {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
};

/** All elements matching `selector` under `root`, looking inside shadow roots too. */
const deepQueryAll = (root, selector, out = []) => {
  if (!root?.querySelectorAll) return out;
  root.querySelectorAll(selector).forEach((el) => out.push(el));
  root.querySelectorAll("*").forEach((el) => el.shadowRoot && deepQueryAll(el.shadowRoot, selector, out));
  return out;
};

const escapeHtml = (str) =>
  String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const SUBTLE_BG = (alpha) => `rgba(var(--rgb-primary-text-color, 0, 0, 0), ${alpha})`;

const SEGMENT_CSS = `
  .controls { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px 0; }
  .seg { display: inline-flex; flex-wrap: wrap; justify-content: center; gap: 2px; padding: 3px;
         border-radius: 999px; background: ${SUBTLE_BG(0.06)}; }
  .seg button { border: 0; background: transparent; color: var(--secondary-text-color); font: inherit;
                font-size: 13px; padding: 6px 12px; border-radius: 999px; cursor: pointer; }
  .seg button[aria-pressed="true"] { background: var(--card-background-color); color: var(--primary-text-color);
                font-weight: 600; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15); }
  /* Loading: a thin moving bar, shown only if loading takes longer than a moment. */
  .progress { height: 2px; margin: 0 4px; overflow: hidden; border-radius: 1px; opacity: 0; transition: opacity 0.2s; }
  .progress.on { opacity: 1; transition-delay: 0.25s; }
  .progress.on::after { content: ""; display: block; width: 30%; height: 100%; background: var(--primary-color);
                        animation: sbf-progress 1s ease-in-out infinite; }
  @keyframes sbf-progress { from { transform: translateX(-100%); } to { transform: translateX(340%); } }
  button:focus-visible, input:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
`;

const segmentHtml = (name, options, active) =>
  `<div class="seg" role="group">${options
    .map(([value, label]) =>
      `<button data-${name}="${escapeHtml(value)}" aria-pressed="${value === active}">${escapeHtml(tr(label))}</button>`)
    .join("")}</div>`;

/**
 * Period tabs + span chips around a single child card (only the selected one is built).
 * The child config may contain "__NAME__" placeholders filled from the selected span's
 * `vars`; an array value means [mobile, desktop]. Choices are stored per viewer under pref_key.
 */
class SbfTabsCard extends HTMLElement {
  setConfig(config) {
    if (!Array.isArray(config?.tabs) || !config.tabs.length) throw new Error("sbf-tabs-card needs tabs");
    this._config = config;
    this._key = config.pref_key || "tabs";
    this._mountId = 0;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    setUiLang(hass);
    if (!this._config) return;
    if (this._child) this._child.hass = hass;
    else if (!this._mounting) this._mount();
    this._loadSummary(); // no-op unless the selection changed since the last load
    this._updateLive();
  }

  /** Current reading of the `live` entity next to the title, e.g. "248 W now". */
  _updateLive() {
    const el = this._config.live && this.shadowRoot.getElementById("now");
    if (!el) return;
    const v = parseFloat(this._hass?.states[this._config.live]?.state);
    const text = Number.isFinite(v) ? tr("{value} now", { value: this._formatValue(v) }) : "";
    if (el.textContent !== text) el.textContent = text;
  }

  /** A reading of the page's sensor, per `format`: power (W/kW), price or a plain number. */
  _formatValue(v) {
    const f = this._config.format || { kind: "power" };
    if (f.kind === "price") return formatMoney(this._hass, v, 3);
    if (f.kind === "number") return `${v.toFixed(f.decimals ?? 1)}${f.unit || ""}`;
    const kw = this._hass?.states[this._config.entity]?.attributes?.unit_of_measurement === "kW";
    return formatPower(kw ? v * 1000 : v);
  }

  getCardSize() {
    return 8;
  }

  // "Detailed" is per visit: leaving the page switches back to the lighter chart.
  disconnectedCallback() {
    if (this._detail) {
      this._detail = false;
      this._resetOnReturn = true;
    }
  }

  connectedCallback() {
    // Back on the page: redraw if the Detailed choice was reset or the period changed elsewhere.
    if (this._resetOnReturn || (this._config && this._tab().label !== this._renderedTab)) {
      this._resetOnReturn = false;
      this._render();
    }
  }

  _tab() {
    const tabs = this._config.tabs;
    const saved = readPref(`${this._key}:tab`, tabs[0].label);
    return tabs.find((t) => t.label === saved) || tabs[0];
  }

  _span(tab) {
    if (!tab.spans) return null;
    const saved = readPref(`${this._key}:span:${tab.label}`, tab.default_span);
    return tab.spans.find((s) => s.value === saved) || tab.spans[0];
  }

  _render() {
    const { tabs, title, entity } = this._config;
    const tab = this._tab();
    const span = this._span(tab);
    this._renderedTab = tab.label;
    const heading = title
      ? `<div class="head">
          <div class="title-row">
            <button class="title" ${entity ? "" : "disabled"}>${escapeHtml(title)}</button>
            ${this._config.live ? '<span id="now" class="now"></span>' : ""}
            ${this._config.link ? `<button class="xlink">${escapeHtml(this._config.link.label)} →</button>` : ""}
          </div>
          <div id="summary" class="summary"></div>
        </div>`
      : "";
    this.shadowRoot.innerHTML = `<style>${SEGMENT_CSS} ${TABS_CSS}</style>
      <div class="top ${title ? "titled" : ""}">
        ${heading}
        <div class="controls">
          ${tabs.length > 1 ? segmentHtml("tab", tabs.map((t) => [t.label, t.label]), tab.label) : ""}
          ${span ? `<div class="span-row">
            ${segmentHtml("span", tab.spans.map((s) => [s.value, s.label]), span.value)}
            ${span.detail_vars ? `<div class="seg" role="group"><button data-detail aria-pressed="${Boolean(this._detail)}">${tr("Detailed")}</button></div>` : ""}
          </div>` : ""}
        </div>
      </div>
      <div id="progress" class="progress"></div>
      <div id="child"></div>`;
    this.shadowRoot.querySelectorAll(".controls button").forEach((btn) =>
      btn.addEventListener("click", () => {
        if (btn.dataset.detail !== undefined) this._detail = !this._detail; // not remembered: resets on leaving
        else if (btn.dataset.tab !== undefined) {
          writePref(`${this._key}:tab`, btn.dataset.tab);
          if (this._key === "history") linkPeriodFromHistory(btn.dataset.tab);
        }
        else writePref(`${this._key}:span:${tab.label}`, btn.dataset.span);
        this._render();
      })
    );
    this.shadowRoot.querySelector(".xlink")?.addEventListener("click", () => navigateTo(this._config.link.path));
    this.shadowRoot.querySelector(".title")?.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entity }, bubbles: true, composed: true })));
    this._child = null;
    this._summaryFor = null;
    if (this._hass) {
      this._mount();
      this._loadSummary();
      this._updateLive();
    }
  }

  /** Start of the selected span (local midnight), or null for all time. */
  _spanStart(tab, span) {
    const n = span ? Number(span.value) : 0;
    const now = new Date();
    if (tab.period === "d") return new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1));
    if (tab.period === "w") {
      const monday = mondayOf(now);
      monday.setDate(monday.getDate() - 7 * (n - 1));
      return monday;
    }
    if (tab.period === "month") return new Date(now.getFullYear(), now.getMonth() - (n - 1), 1);
    if (tab.period === "y") return new Date(now.getFullYear() - 9, 0, 1);
    if (tab.period === "h") return new Date(now.getTime() - n * 86400000); // rolling, like the chart
    return null;
  }

  /** "€12.87 · 70.9 kWh · avg €0.18/kWh in the last 14 days", from long-term statistics. */
  async _loadSummary() {
    const summary = this._config.summary;
    const tab = this._tab();
    if (!summary || !this._hass) return;
    const span = this._span(tab);
    const key = `${tab.label}:${span?.value ?? ""}`;
    if (this._summaryFor === key) return;
    this._summaryFor = key;
    const start = this._spanStart(tab, span);
    if (summary.kind === "power" || summary.kind === "stat") return this._loadSensorSummary(summary, span, start, key);
    const period = { fixed_period: start ? { start_time: `${isoDate(start)}T00:00:00` } : {} };
    const change = (id) => this._hass
      .callWS({ type: "recorder/statistic_during_period", statistic_id: id, types: ["change"], ...period })
      .then((r) => r?.change ?? null, () => null);
    const [costs, kwh] = await Promise.all([
      Promise.all(summary.cost.map(change)),
      summary.energy ? change(summary.energy) : Promise.resolve(null),
    ]);
    if (this._summaryFor !== key) return; // selection changed meanwhile
    const el = this.shadowRoot.getElementById("summary");
    if (!el || costs.some((c) => c === null)) return;
    const money = (v) => formatMoney(this._hass, v);
    const total = costs.reduce((a, b) => a + b, 0);
    const when = tab.period === "all" ? tr("all time")
      : span ? tr("in the last {span}", { span: tr(span.label).toLowerCase() })
        : tab.period === "y" ? tr("in the last 10 years") : tr("all time");
    const parts = summary.kind === "earned" ? [tr("{amount} earned", { amount: money(total) })] : [money(total)];
    if (kwh !== null && summary.kind !== "earned") {
      parts.push(`${kwh.toFixed(1)} kWh`);
      if (Math.abs(kwh) > 0.001) parts.push(tr("avg {price}/kWh", { price: money(total / kwh) }));
    }
    el.textContent = `${parts.join(" · ")} ${when}`;
  }

  /** "Avg 231 W · peak 364 W · 5.5 kWh in the last 24 hours" for a power sensor. */
  async _loadSensorSummary(summary, span, start, key) {
    const power = summary.kind === "power";
    const stats = await this._hass
      .callWS({ type: "recorder/statistic_during_period", statistic_id: summary.entity,
        types: power ? ["mean", "max"] : ["mean", "min", "max"], fixed_period: { start_time: start.toISOString() } })
      .catch(() => null);
    if (this._summaryFor !== key) return;
    const el = this.shadowRoot.getElementById("summary");
    if (!el || stats?.mean == null) return; // e.g. a sensor without long-term statistics
    const fmt = (v) => this._formatValue(v);
    const parts = [tr("Avg {value}", { value: fmt(stats.mean) })];
    if (!power && stats.min != null) parts.push(tr("min {value}", { value: fmt(stats.min) }));
    if (stats.max != null) parts.push(tr(power ? "peak {value}" : "max {value}", { value: fmt(stats.max) }));
    if (power) {
      const toW = this._hass.states[summary.entity]?.attributes?.unit_of_measurement === "kW" ? 1000 : 1;
      const hours = (Date.now() - start.getTime()) / 3600000;
      parts.push(`${((stats.mean * toW * hours) / 1000).toFixed(1)} kWh`);
    }
    const n = Number(span.value);
    const when = n === 1 ? tr("in the last 24 hours") : tr("in the last {span}", { span: tr(`${n} Days`).toLowerCase() });
    el.textContent = `${parts.join(" · ")} ${when}`;
  }

  /**
   * Shows the thin loading bar until every chart on the page has drawn its data (or 15 s
   * passed, e.g. for a period without data). The bar itself only appears after a moment.
   */
  _watchLoading(id) {
    const bar = this.shadowRoot.getElementById("progress");
    if (!bar?.classList) return;
    bar.classList.add("on");
    const started = Date.now();
    const drawn = () => deepQueryAll(this.shadowRoot.getElementById("child"), "apexcharts-card").every((c) =>
      c.shadowRoot?.querySelector("path.apexcharts-bar-area, path.apexcharts-line, path.apexcharts-area"));
    const check = () => {
      if (id !== this._mountId) return; // another tab or span took over
      if (drawn() || Date.now() - started > 15000) bar.classList.remove("on");
      else setTimeout(check, 250);
    };
    setTimeout(check, 250);
  }

  async _mount() {
    const id = ++this._mountId;
    this._mounting = true;
    const tab = this._tab();
    const span = this._span(tab);
    const mobile = window.innerWidth < 600;
    let json = JSON.stringify(tab.card);
    const vars = { ...span?.vars, ...(this._detail && span?.detail_vars) };
    Object.entries(vars).forEach(([name, raw]) => {
      const value = Array.isArray(raw) ? raw[mobile ? 0 : 1] : raw;
      json = json.split(`"__${name}__"`).join(JSON.stringify(value)).split(`__${name}__`).join(String(value));
    });
    const config = JSON.parse(json);
    // Statistics period "raw" means: plot the recorded history instead of statistics.
    (config.series || []).forEach((sr) => sr.statistics?.period === "raw" && delete sr.statistics);
    try {
      const helpers = await window.loadCardHelpers();
      if (id !== this._mountId) return; // a newer selection took over
      const el = helpers.createCardElement(config);
      el.hass = this._hass;
      this.shadowRoot.getElementById("child").replaceChildren(el);
      this._child = el;
      this._watchLoading(id);
    } finally {
      if (id === this._mountId) this._mounting = false;
    }
  }
}

/** Money text with the minus sign before the symbol (−€0.30). */
const formatMoney = (hass, v, maxDigits = 2) => {
  if (v === null || v === undefined) return "—";
  let text;
  try {
    text = new Intl.NumberFormat(hass?.locale?.language, {
      style: "currency", currency: hass?.config?.currency || "EUR",
      minimumFractionDigits: maxDigits, maximumFractionDigits: maxDigits, // "€0.130", not "€0.13", next to "€0.131"
    }).format(Math.abs(v));
  } catch (e) {
    text = Math.abs(v).toFixed(maxDigits);
  }
  return v < 0 && Math.abs(v) >= 0.5 * 10 ** -maxDigits ? `−${text}` : text;
};

/** Shared tile: icon + value, label and optional sub line. `value` is display text. */
const tileHtml = ({ label, icon, color, value, negative = false, sub = "", nav = "", more = "" }) => {
  const action = nav ? `data-nav="${escapeHtml(nav)}"` : more ? `data-more="${escapeHtml(more)}"` : "disabled";
  return `
    <button class="tile" ${action}>
      <ha-icon class="side" icon="${escapeHtml(icon)}" style="color:${color}"></ha-icon>
      <span class="text">
        <span class="value ${negative ? "neg" : ""}"><ha-icon class="inline" icon="${escapeHtml(icon)}" style="color:${color}"></ha-icon>${escapeHtml(value)}</span>
        <span class="label">${escapeHtml(tr(label))}</span>
        ${sub ? `<span class="sub">${sub}</span>` : ""}
      </span>
    </button>`;
};

/**
 * Shared device list. Items: { label, icon, color, amount, detail (HTML), nav, idle }.
 * Idle items fold behind a toggle (unless nothing is active).
 */
const rowsHtml = (items, { section, showIdle }) => {
  const active = items.filter((d) => !d.idle);
  const idle = items.filter((d) => d.idle);
  const expand = showIdle || !active.length;
  const row = (d) => `
    <button class="row" data-nav="${escapeHtml(d.nav)}">
      <ha-icon icon="${escapeHtml(d.icon)}" style="color:${d.color}"></ha-icon>
      <span class="name">${escapeHtml(tr(d.label))}</span>
      <span class="amt">${escapeHtml(d.amount)}${d.detail ? `<small>${d.detail}</small>` : ""}</span>
    </button>`;
  const toggle = idle.length && active.length
    ? `<button class="row idle" data-idle="${section}">${
      expand ? tr("Hide idle") : escapeHtml(tr("+{n} idle: {names}", { n: idle.length, names: idle.map((d) => tr(d.label)).join(", ") }))}</button>`
    : "";
  return active.map(row).join("") + (expand ? idle.map(row).join("") : "") + toggle;
};

/**
 * Patch `from` in place to match `to`, keeping unchanged nodes. Replacing the whole card on
 * every update briefly collapses its height, which makes phones jump the scroll position.
 */
const morphNodes = (from, to) => {
  if (from.nodeType === 1) {
    [...from.attributes].forEach(({ name }) => !to.hasAttribute(name) && from.removeAttribute(name));
    [...to.attributes].forEach(({ name, value }) => from.getAttribute(name) !== value && from.setAttribute(name, value));
  }
  const oldKids = [...from.childNodes];
  const newKids = [...to.childNodes];
  newKids.forEach((next, i) => {
    const prev = oldKids[i];
    if (!prev) from.appendChild(next);
    else if (prev.nodeType !== next.nodeType || prev.nodeName !== next.nodeName) from.replaceChild(next, prev);
    else if (prev.nodeType === 1) morphNodes(prev, next);
    else if (prev.nodeValue !== next.nodeValue) prev.nodeValue = next.nodeValue;
  });
  oldKids.slice(newKids.length).forEach((extra) => from.removeChild(extra));
};

/** Render HTML into a shadow root: full write the first time, in-place patch afterwards. */
const renderInto = (root, html) => {
  if (!root.firstChild) {
    root.innerHTML = html;
    return;
  }
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  morphNodes(root, tpl.content);
};

/**
 * One delegated click listener per card (so patched/added elements keep working):
 * data-nav navigates, data-more opens the entity dialog, data-idle calls onIdleToggle,
 * anything else with an id is passed to onClick(id, element).
 */
const bindCardActions = (root, host, { onIdleToggle, onClick } = {}) => {
  root.addEventListener("click", (e) => {
    const el = e.target.closest?.("button");
    if (!el || el.disabled) return;
    if (el.dataset.nav) navigateTo(el.dataset.nav);
    else if (el.dataset.more) {
      host.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: el.dataset.more }, bubbles: true, composed: true }));
    } else if (el.dataset.idle) onIdleToggle?.();
    else onClick?.(el);
  });
};

/**
 * Money Sankey as inline SVG, styled after Home Assistant's energy Sankey: thin coloured
 * bars, heights strictly proportional, bands fading from source to target colour.
 * Horizontal (labels right of the bars) on wide cards; vertical (top to bottom, labels
 * under the bars) on narrow ones, as HA does on phones.
 * columns: node lists in display order; node = {id, label, value, color, nav?, children?}.
 *   A node with `children` (ids in the next column) is centred on them.
 * links: {from, to, value}. Values ≤ 0 are left out.
 */
const sankeySvg = (columns, links, { width, format, vertical = false }) => {
  const cols = columns.map((c) => c.filter((n) => n.value > 0.004)).filter((c) => c.length);
  if (cols.length < 2) return "";
  const ids = new Set(cols.flat().map((n) => n.id));
  const bands = links.filter((l) => l.value > 0.004 && ids.has(l.from) && ids.has(l.to));
  const BAR = 14;
  const GAP = vertical ? 4 : 6;
  const flow = (id, dir) => bands.filter((l) => l[dir] === id).reduce((sum, l) => sum + l.value, 0);
  const size = (n) => Math.max(n.value, flow(n.id, "from"), flow(n.id, "to"));
  const maxNodes = Math.max(...cols.map((c) => c.length));
  const maxTotal = Math.max(...cols.map((c) => c.reduce((sum, n) => sum + size(n), 0)));
  // "a" runs along the flow (x when horizontal, y when vertical); "b" across it.
  const k = vertical ? (width - GAP * (maxNodes - 1)) / maxTotal : 230 / maxTotal;
  const labelSpace = Math.min(170, width * 0.28);
  const step = vertical ? 100 : (width - BAR - labelSpace) / (cols.length - 1);
  const pos = {};
  // Lay out from the last column backwards, so parents can be centred on their children.
  for (let i = cols.length - 1; i >= 0; i -= 1) {
    let cursor = 0;
    cols[i].forEach((n) => {
      const len = Math.max(1, size(n) * k);
      let b = cursor;
      const kids = (n.children || []).map((id) => pos[id]).filter(Boolean);
      if (kids.length) {
        const first = Math.min(...kids.map((p) => p.b));
        const last = Math.max(...kids.map((p) => p.b + p.len));
        b = Math.max(cursor, (first + last - len) / 2);
      }
      pos[n.id] = { a: i * step, b, len, n };
      cursor = b + len + GAP;
    });
  }
  const crossExtent = Math.max(...Object.values(pos).map((p) => p.b + p.len));
  const svgW = vertical ? width : width;
  const svgH = Math.ceil(vertical ? (cols.length - 1) * step + BAR + 34 : crossExtent + 4);
  const P = (a, b) => (vertical ? `${b},${a}` : `${a},${b}`);

  // Stack bands on each node in the order of the node at the other end (fewer crossings).
  const outB = {};
  const inB = {};
  Object.values(pos).forEach((p) => {
    outB[p.n.id] = p.b + (p.len - flow(p.n.id, "from") * k) / 2;
    inB[p.n.id] = p.b + (p.len - flow(p.n.id, "to") * k) / 2;
  });
  const ordered = [...bands].sort((x, y) => pos[x.from].b - pos[y.from].b || pos[x.to].b - pos[y.to].b);
  const defs = [];
  const paths = ordered.map((l, i) => {
    const s0 = pos[l.from];
    const t0 = pos[l.to];
    const t = Math.max(0.8, l.value * k);
    const a1 = s0.a + BAR;
    const a2 = t0.a;
    const am = (a1 + a2) / 2;
    const b1 = outB[l.from];
    const b2 = inB[l.to];
    outB[l.from] += t;
    inB[l.to] += t;
    const [gx1, gy1, gx2, gy2] = vertical ? [0, a1, 0, a2] : [a1, 0, a2, 0];
    defs.push(`<linearGradient id="skg${i}" gradientUnits="userSpaceOnUse" x1="${gx1}" y1="${gy1}" x2="${gx2}" y2="${gy2}">
      <stop offset="0" style="stop-color:${s0.n.color}"></stop><stop offset="1" style="stop-color:${t0.n.color}"></stop></linearGradient>`);
    return `<path d="M${P(a1, b1)} C${P(am, b1)} ${P(am, b2)} ${P(a2, b2)} L${P(a2, b2 + t)} C${P(am, b2 + t)} ${P(am, b1 + t)} ${P(a1, b1 + t)} Z"
      fill="url(#skg${i})" fill-opacity="0.4"><title>${escapeHtml(`${s0.n.label} → ${t0.n.label}: ${format(l.value)}`)}</title></path>`;
  });

  const nodes = Object.values(pos).map(({ a, b, len, n }) => {
    const tip = `<title>${escapeHtml(`${n.label}: ${format(n.value)}`)}</title>`;
    let rect;
    let text = "";
    if (vertical) {
      rect = `<rect x="${b}" y="${a}" width="${len}" height="${BAR}" style="fill:${n.color}"></rect>`;
      if (len >= 22) {
        const fs = Math.max(9, Math.min(13, 8 + len / 14));
        const chars = Math.max(3, Math.floor(len / (fs * 0.56)));
        const clip = (s) => (s.length > chars ? `${s.slice(0, chars - 1)}…` : s);
        const cx = b + len / 2;
        text = `<text x="${cx}" y="${a + BAR + fs + 2}" text-anchor="middle" style="font-size:${fs.toFixed(1)}px">${escapeHtml(clip(n.label))}</text>
          <text x="${cx}" y="${a + BAR + fs * 2 + 4}" text-anchor="middle" class="sk-v" style="font-size:${(fs * 0.9).toFixed(1)}px">${escapeHtml(format(n.value))}</text>`
          + (n.detail ? `<text x="${cx}" y="${a + BAR + fs * 3 + 5}" text-anchor="middle" class="sk-v" style="font-size:${(fs * 0.8).toFixed(1)}px">${escapeHtml(n.detail)}</text>` : "");
      }
    } else {
      rect = `<rect x="${a}" y="${b}" width="${BAR}" height="${len}" style="fill:${n.color}"></rect>`;
      const fs = Math.max(10, Math.min(15, 10 + len / 12)); // bigger nodes, bigger labels (as in HA)
      const shift = n.detail ? fs * 0.6 : 0; // make room for the detail line below
      text = `<text x="${a + BAR + 5}" y="${b + len / 2 + fs * 0.35 - shift}" style="font-size:${fs.toFixed(1)}px">${escapeHtml(n.label)}<tspan class="sk-v" dx="5">${escapeHtml(format(n.value))}</tspan></text>`
        + (n.detail ? `<text x="${a + BAR + 5}" y="${b + len / 2 + fs * 0.35 + fs * 0.75}" class="sk-v" style="font-size:${(fs * 0.8).toFixed(1)}px">${escapeHtml(n.detail)}</text>` : "");
    }
    return `<g ${n.nav ? `class="sk-nav" data-nav-svg="${escapeHtml(n.nav)}" tabindex="0" role="link"` : ""}>${rect}${text}${tip}</g>`;
  });
  return `<svg class="sankey" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}"
    role="img" aria-label="Where the house cost went"><defs>${defs.join("")}</defs>${paths.join("")}${nodes.join("")}</svg>`;
};

const SANKEY_CSS = `
  .sankey { display: block; margin: 16px 0 0; overflow: visible; }
  .sankey text { fill: var(--primary-text-color); font-family: inherit; }
  .sankey .sk-v { fill: var(--secondary-text-color); font-size: 0.85em; font-variant-numeric: tabular-nums; }
  .sankey .sk-nav { cursor: pointer; }
  .sankey .sk-nav:hover rect { filter: brightness(1.1); }
`;

// Colours in the style of Home Assistant's energy dashboard.
const SANKEY_COLORS = { home: PALETTE.home };
const SANKEY_PALETTE = ["#a260f0", "#8d6e63", "#90b4f5", "#63c6a0", "#d49b00", "#e57373", "#5c6bc0", "#f06292", "#26a69a", "#ffb74d"];

/**
 * Earnings waterfall as inline SVG, written out as a sum: Gross − Solar earned − Battery earned
 * = Net bill. Operators sit between the bars; the earned steps are light outlined boxes (money
 * taken off the bill), while Gross and Net bill are solid. A step that cost money (e.g. a
 * battery with negative value) turns into "+ … cost".
 */
const waterfallSvg = ({ gross, solar, battery, net }, { width, format, nav = {} }) => {
  if ([gross, solar, battery, net].some((x) => x === null)) return "";
  const step = (name, amount) => (amount >= 0
    ? { label: tr(`${name} earned`), op: "−", amount }
    : { label: tr(`${name} cost`), op: "+", amount: -amount });
  const s1 = step("Solar", solar);
  const s2 = step("Battery", battery);
  const bars = [
    { label: tr("Gross cost"), from: 0, to: gross, color: PALETTE.home, solid: true, text: format(gross), nav: nav.gross },
    { ...s1, from: gross, to: gross - solar, color: PALETTE.solar, text: format(s1.amount), nav: nav.solar },
    { ...s2, from: gross - solar, to: gross - solar - battery, color: PALETTE.battery, text: format(s2.amount), nav: nav.battery },
    { label: tr("Net bill"), from: 0, to: net, color: PALETTE.grid, solid: true, text: format(net), op: "=", nav: nav.net },
  ];
  const H = 104;
  const TOP = 48; // room for the "Total earned" bracket and the amounts above the bars
  const values = bars.flatMap((b) => [b.from, b.to]);
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const scale = max - min > 0 ? H / (max - min) : 0;
  const y = (v) => TOP + (max - v) * scale;
  const slot = width / bars.length;
  const barW = Math.min(120, slot * 0.58);
  const defs = [];
  const parts = bars.map((b, i) => {
    const x = i * slot + (slot - barW) / 2;
    const top = y(Math.max(b.from, b.to));
    const h = Math.max(3, Math.abs(b.to - b.from) * scale);
    let body;
    if (b.solid) {
      body = `<rect x="${x}" y="${top}" width="${barW}" height="${h}" style="fill:${b.color};fill-opacity:0.45"></rect>
        <rect x="${x}" y="${top}" width="${barW}" height="3" style="fill:${b.color}"></rect>`;
    } else {
      // Earned steps: light fill with an outline, so they read as taken off rather than added.
      body = `<rect x="${x + 0.75}" y="${top + 0.75}" width="${barW - 1.5}" height="${Math.max(1.5, h - 1.5)}" rx="2"
        style="fill:${b.color};fill-opacity:0.15;stroke:${b.color};stroke-width:1.5"></rect>`;
    }
    const op = b.op && i > 0
      ? `<text x="${i * slot}" y="${TOP + H / 2 + 7}" text-anchor="middle" class="wf-op">${b.op}</text>`
      : "";
    // Red = costs you money, green = a net bill below zero (you earned money).
    const tone = i === 3 ? (net < -0.004 ? " good" : "") : (b.op === "+" ? " neg" : "");
    const cx = x + barW / 2;
    const link = b.nav ? ` class="sk-nav" data-nav-svg="${escapeHtml(b.nav)}" tabindex="0" role="link"` : "";
    return `${op}<g${link}>${body}
      <text x="${cx}" y="${top - 6}" text-anchor="middle" class="wf-v${tone}">${escapeHtml(b.text)}</text>
      <text x="${cx}" y="${TOP + H + 17}" text-anchor="middle" class="wf-l">${escapeHtml(b.label)}</text>
      <title>${escapeHtml(`${b.label}: ${b.text}`)}</title></g>`;
  });
  // Bracket over the two earned steps with their combined result.
  const bx1 = slot + (slot - barW) / 2;
  const bx2 = 2 * slot + (slot + barW) / 2;
  const by = 20;
  const total = solar + battery;
  const bracketLink = nav.total ? ` class="sk-nav" data-nav-svg="${escapeHtml(nav.total)}" tabindex="0" role="link"` : "";
  const bracket = `<g${bracketLink}><path d="M${bx1},${by + 6} V${by} H${bx2} V${by + 6}" class="wf-bracket"></path>
    <rect x="${bx1}" y="${by - 20}" width="${bx2 - bx1}" height="28" style="fill:transparent"></rect>
    <text x="${(bx1 + bx2) / 2}" y="${by - 6}" text-anchor="middle" class="wf-total${total < -0.004 ? " neg" : ""}">${
      escapeHtml(`${tr(total >= 0 ? "Total earned" : "Total cost")} ${format(Math.abs(total))}`)}</text></g>`;
  const zero = `<line x1="0" x2="${width}" y1="${y(0)}" y2="${y(0)}" class="wf-zero"></line>`;
  return `<svg class="waterfall" width="${width}" height="${TOP + H + 24}" viewBox="0 0 ${width} ${TOP + H + 24}"
    role="img" aria-label="Gross minus solar earned minus battery earned equals net bill"><defs>${defs.join("")}</defs>${zero}${bracket}${parts.join("")}</svg>`;
};

const WATERFALL_CSS = `
  .waterfall { display: block; margin: 10px 0 6px; overflow: visible; }
  .waterfall text { font-family: inherit; }
  .waterfall .wf-v { fill: var(--primary-text-color); font-size: 13px; font-variant-numeric: tabular-nums; }
  .waterfall .wf-v.neg { fill: var(--error-color, #db4437); }
  .waterfall .wf-v.good { fill: var(--success-color, #43a047); }
  .waterfall .wf-l { fill: var(--secondary-text-color); font-size: 12px; }
  .waterfall .wf-bracket { fill: none; stroke: var(--secondary-text-color); stroke-width: 1; opacity: 0.6; }
  .waterfall .wf-total { fill: var(--primary-text-color); font-size: 12px; font-weight: 500; }
  .waterfall .wf-total.neg { fill: var(--error-color, #db4437); }
  .waterfall .sk-nav { cursor: pointer; }
  .waterfall .sk-nav:hover rect, .waterfall .sk-nav:focus-visible rect { filter: brightness(1.08); }
  .waterfall .sk-nav:hover text, .sankey .sk-nav:hover text { text-decoration: underline; }
  .waterfall .sk-nav:focus-visible, .sankey .sk-nav:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .waterfall .wf-op { fill: var(--secondary-text-color); font-size: 22px; font-weight: 300; }
  .waterfall .wf-zero { stroke: var(--divider-color); stroke-width: 1; }
`;

const TABS_CSS = `
  :host { display: block; }
  .top { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px 16px;
         padding: 12px 16px 0; }
  .top.titled { justify-content: space-between; }
  .top.titled .controls { align-items: flex-end; }
  .head { min-width: 0; }
  .span-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
  .top.titled .span-row { justify-content: flex-end; }
  .title-row { display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 12px; }
  .xlink { border: 0; background: none; font: inherit; font-size: 13px; color: var(--primary-color); cursor: pointer;
           padding: 2px 8px; border-radius: 999px; }
  .xlink:hover { background: ${SUBTLE_BG(0.05)}; }
  .now { font-size: 16px; font-weight: 500; color: var(--primary-color); font-variant-numeric: tabular-nums; }
  @media (max-width: 600px) {
    .top { padding: 10px 12px 0; }
    .top.titled .controls { width: 100%; align-items: center; }
    .top.titled .span-row { justify-content: center; }
    .summary { font-size: 12px; }
  }
  .title { border: 0; background: none; padding: 0; font: inherit; font-size: 22px; font-weight: 500;
           color: var(--primary-text-color); cursor: pointer; text-align: left; }
  .title[disabled] { cursor: default; }
  .title:hover:not([disabled]) { text-decoration: underline; }
  .summary { font-size: 13px; color: var(--secondary-text-color); min-height: 18px; margin-top: 2px;
             font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

const FIN_MODES = [["day", "Day"], ["week", "Week"], ["month", "Month"], ["year", "Year"], ["all", "All"], ["custom", "Custom"]];
const LIVE_ATTR = { day: "today", week: "this_week", month: "this_month", year: "this_year" };
const EARNINGS = [
  { base: "system_earnings_rate", label: "Total", icon: "mdi:finance", color: GOOD, path: "financials-total-system-earnings" },
  { base: "solar_only_earnings_rate", label: "Solar only", icon: "mdi:solar-power", color: PALETTE.solar, path: "financials-solar-only-earnings" },
  { base: "battery_added_value_rate", label: "Battery value", icon: "mdi:battery-arrow-up", color: PALETTE.battery, path: "financials-battery-added-value" },
];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const mondayOf = (d) => {
  const s = startOfDay(d);
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
  return s;
};
/** Devices below this many kWh in a period get no average price (too little to mean anything). */
const PRICE_MIN_KWH = 0.2;

/**
 * Text colour for a device's average price against the house average: green more than 15%
 * below, red more than 15% above (prices spread far less than amounts), otherwise none.
 */
const priceToneOf = (p, avg) => {
  if (p === null || avg === null || !(avg > 0)) return null;
  return p > avg * 1.15 ? BAD : p < avg * 0.85 ? GOOD : null;
};

/**
 * Layout shared by the bar diagrams: name | bar | value on one line, or on phones the name
 * and value on one line above a full-width bar. The first row starts below a header line.
 */
const barLayout = (width) => {
  const narrow = width < 440;
  const labelW = narrow ? width - 120 : Math.min(150, Math.round(width * 0.3));
  const barX = narrow ? 0 : labelW + 8;
  return {
    narrow, width, labelW, barX,
    barW: narrow ? width : Math.max(40, width - barX - 124 - 8),
    line: narrow ? 20 : 26, // height of the name line
    bar: 14, // bar thickness (the maximum, for the price bars)
    top: 24, // first row, below the header
  };
};

/** Shortens text to roughly `px` wide (SVG text doesn't ellipsize by itself). */
const fitText = (text, px, char = 6.6) =>
  text.length * char > px ? `${text.slice(0, Math.max(1, Math.floor(px / char) - 1))}…` : text;

/** Y of a row's bar: centred on the name line, or below it on phones. */
const barY = (L, top, thickness = L.bar) => (L.narrow ? top + L.line + (L.bar - thickness) / 2 : top + (L.line - thickness) / 2);

/** A clickable row: hit area, name on the left, value on the right, tooltip. */
const barRowSvg = (L, { top, height, label, value, nav, title, valueStyle = "" }) =>
  `<g class="sk-nav sb-row" data-nav-svg="${escapeHtml(nav)}" tabindex="0" role="link">
      <rect x="0" y="${top}" width="${L.width}" height="${height}" style="fill:transparent"></rect>
      <text class="sb-l" x="0" y="${top + L.line / 2}" dominant-baseline="central">${escapeHtml(fitText(label, L.labelW))}</text>
      <text class="sb-v" x="${L.width}" y="${top + L.line / 2}" dominant-baseline="central" text-anchor="end"${valueStyle}>${escapeHtml(value)}</text>
      <title>${escapeHtml(title)}</title>
    </g>`;

const barsSvgFrame = (width, height, content) =>
  `<svg class="sbars" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${content}</svg>`;

/**
 * Average price per device as bars (same layout and colours as segmentBarsSvg). Bar length
 * is the price and thickness the device's kWh (so its area is its cost); a dashed line marks
 * the house average. The price text is green or red when clearly below or above it.
 * Items: { label, price, kwh, color, nav }. Negative prices draw no bar but keep their label.
 */
const priceBarsSvg = (items, { width, average, tone, format, nav }) => {
  if (!items.length) return "";
  const L = barLayout(width);
  const ROW = L.narrow ? L.line + L.bar + 10 : L.line;
  const maxKwh = Math.max(...items.map((d) => d.kwh || 0)) || 1;
  const thickness = (d) => Math.max(3, (L.bar * Math.max(0, d.kwh || 0)) / maxKwh);
  const max = Math.max(...items.map((d) => d.price), average ?? 0) * 1.05 || 1;
  const x = (v) => L.barX + Math.max(0, Math.min(1, v / max)) * L.barW;
  const rows = items.map((d, i) => {
    const top = L.top + i * ROW;
    const t = thickness(d);
    const color = tone(d);
    return barRowSvg(L, {
      top, height: ROW, label: d.label, value: format(d.price), nav: d.nav,
      title: `${d.label}: ${format(d.price)} · ${formatKwh(d.kwh)}`,
      valueStyle: color ? ` style="fill:${color}"` : "",
    }) + `<rect x="${L.barX}" y="${barY(L, top, t).toFixed(1)}" width="${Math.max(0, x(d.price) - L.barX).toFixed(1)}" height="${t.toFixed(1)}" rx="2" style="fill:${d.color};fill-opacity:0.8"></rect>`;
  }).join("");
  const bottom = L.top + items.length * ROW;
  let line = "";
  let head = "";
  if (average !== null && average > 0) {
    const ax = x(average).toFixed(1);
    const seg = (y1, y2) => `<line class="pb-avg" x1="${ax}" x2="${ax}" y1="${y1}" y2="${y2}"></line>`;
    // Phones: only through the bars, so it doesn't cross the name and price lines.
    line = L.narrow
      ? items.map((d, i) => seg(L.top + i * ROW + L.line - 3, L.top + i * ROW + L.line + L.bar + 3)).join("")
      : seg(L.top - 2, bottom);
    head = `<g class="sk-nav" data-nav-svg="${escapeHtml(nav)}" tabindex="0" role="link">
      <line class="pb-avg" x1="0" x2="14" y1="8" y2="8"></line>
      <text class="sb-h" x="20" y="12">${escapeHtml(tr("House average {price}", { price: format(average) }))}</text>
      ${L.narrow ? "" : `<text class="sb-leg" x="${width}" y="12" text-anchor="end">${escapeHtml(tr("Thicker bar = more kWh"))}</text>`}
    </g>`;
  }
  return barsSvgFrame(width, bottom + 4, head + rows + line);
};

/**
 * One bar per device on a shared scale, split into coloured segments (sub-devices and
 * "Other"), with "value · share%" on the right. Devices with sub-devices get a small
 * legend line naming the segments. Items: { label, value, nav, parent, segments: [{ label, value, color, nav }] }.
 */
const segmentBarsSvg = (items, { width, total, format, header, nav }) => {
  if (!items.length) return "";
  const L = barLayout(width);
  const LEGEND = 16;
  const max = Math.max(...items.map((d) => d.value)) || 1;
  const pct = (x) => `${Math.round((x / total) * 100)}%`;
  let y = L.top;
  const rows = items.map((d) => {
    const top = y;
    const by = barY(L, top);
    let x = L.barX;
    const segs = d.segments.map((s) => {
      const w = (s.value / max) * L.barW;
      const rect = `<g class="sk-nav" data-nav-svg="${escapeHtml(s.nav)}"><rect x="${x.toFixed(1)}" y="${by}" width="${Math.max(0.5, w - 1).toFixed(1)}" height="${L.bar}" rx="2" style="fill:${s.color};fill-opacity:0.8"></rect><title>${escapeHtml(`${s.label}: ${format(s.value)} (${pct(s.value)})`)}</title></g>`;
      x += w;
      return rect;
    }).join("");
    let bottom = L.narrow ? by + L.bar + 10 : top + L.line;
    let legend = "";
    if (d.parent) {
      // Segment names under the bar, wrapped onto more lines if needed.
      let lx = L.barX;
      let ly = (L.narrow ? by + L.bar : top + L.line) + 12;
      legend = d.segments.map((s) => {
        const text = fitText(s.label, width - L.barX - 14, 6);
        const w = 14 + text.length * 6 + 10;
        if (lx + w > width && lx > L.barX) {
          lx = L.barX;
          ly += LEGEND;
        }
        const item = `<circle cx="${lx + 4}" cy="${ly - 4}" r="4" style="fill:${s.color}"></circle><text class="sb-leg" x="${lx + 12}" y="${ly}">${escapeHtml(text)}</text>`;
        lx += w;
        return item;
      }).join("");
      bottom = ly + 10;
    }
    y = bottom;
    return barRowSvg(L, {
      top, height: bottom - top, label: d.label, value: `${format(d.value)} · ${pct(d.value)}`, nav: d.nav,
      title: `${d.label}: ${format(d.value)} (${pct(d.value)})`,
    }) + segs + legend;
  }).join("");
  const head = `<g class="sk-nav" data-nav-svg="${escapeHtml(nav)}" tabindex="0" role="link"><text class="sb-h" x="0" y="12">${escapeHtml(fitText(header, width, 6.8))}</text></g>`;
  return barsSvgFrame(width, y + 4, head + rows);
};

const SEGMENT_BARS_CSS = `
  .sbars { display: block; margin: 8px auto 4px; overflow: visible; }
  .sbars text { font-family: inherit; font-size: 13px; fill: var(--primary-text-color, #212121); }
  .sbars .sb-h { font-weight: 500; }
  .sbars .sb-v { fill: var(--secondary-text-color, #727272); font-size: 12px; font-variant-numeric: tabular-nums; }
  .sbars .sb-leg { fill: var(--secondary-text-color, #727272); font-size: 11px; }
  .sbars .pb-avg { stroke: var(--secondary-text-color, #727272); stroke-width: 1.5; stroke-dasharray: 4 3; }
  .sbars .sk-nav { cursor: pointer; }
  .sbars .sb-row:hover > rect:first-child { fill: ${SUBTLE_BG(0.05)} !important; }
`;

const formatKwh = (kwh) => (kwh === null ? "—" : `${kwh.toFixed(Math.abs(kwh) >= 100 ? 0 : 1)} kWh`);

const formatPower = (w) =>
  w === null ? "—" : Math.abs(w) >= 1000 ? `${(w / 1000).toFixed(1)} kW` : `${Math.round(w)} W`;

const isoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** First day of the calendar period `offset` periods from now (0 = current). */
const periodStart = (mode, offset) => {
  const now = new Date();
  if (mode === "day") return new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  if (mode === "week") {
    const d = mondayOf(now);
    d.setDate(d.getDate() + 7 * offset);
    return d;
  }
  if (mode === "month") return new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return new Date(now.getFullYear() + offset, 0, 1);
};

/** Offset (never in the future) of the period that contains `date`. */
const offsetFor = (mode, date) => {
  const now = new Date();
  let offset;
  if (mode === "day") offset = Math.round((startOfDay(date) - startOfDay(now)) / MS_PER_DAY);
  else if (mode === "week") offset = Math.round((mondayOf(date) - mondayOf(now)) / MS_PER_WEEK);
  else if (mode === "month") offset = (date.getFullYear() - now.getFullYear()) * 12 + date.getMonth() - now.getMonth();
  else offset = date.getFullYear() - now.getFullYear();
  return Math.min(0, offset);
};

const CARD_CSS = `
  :host { display: block; max-width: 960px; margin: 0 auto; }
  ha-card { padding: 4px 12px 12px; }
  .controls { flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 4px 16px; padding: 8px 0 4px; }
  .nav { display: flex; align-items: center; gap: 2px; position: relative; }
  .nav button { border: 0; background: transparent; color: var(--primary-text-color); cursor: pointer;
                width: 32px; height: 32px; border-radius: 50%; font-size: 20px; line-height: 1;
                display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 18px; }
  .nav button:hover:not([disabled]) { background: ${SUBTLE_BG(0.06)}; }
  .nav button[disabled] { opacity: 0.3; cursor: default; }
  .nav button.now { width: auto; padding: 0 10px; border-radius: 999px; font-size: 13px; color: var(--primary-color); }
  .plabel { min-width: 150px; text-align: center; font-weight: 600; font-size: 14px; }
  #jump { position: absolute; opacity: 0; pointer-events: none; width: 1px; height: 1px; right: 0; bottom: 0; }
  #jump.shown { position: static; opacity: 1; pointer-events: auto; width: auto; height: auto; }
  .range { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center; }
  input[type="date"] { font: inherit; font-size: 13px; padding: 4px 6px; border-radius: 8px; border: 1px solid var(--divider-color);
                       background: var(--card-background-color); color: var(--primary-text-color); }
  h3 { margin: 12px 0 6px; font-size: 11px; font-weight: 600; color: var(--secondary-text-color);
       text-transform: uppercase; letter-spacing: 0.06em; }
  .tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
  .tiles + .tiles { margin-top: 6px; }
  .tile { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 64px; box-sizing: border-box; padding: 6px 10px;
          border: 0; border-radius: 10px; background: ${SUBTLE_BG(0.04)}; color: var(--primary-text-color);
          font: inherit; text-align: left; cursor: pointer; --mdc-icon-size: 22px; }
  .tile:hover { background: ${SUBTLE_BG(0.08)}; }
  .tile[disabled] { cursor: default; }
  .tile ha-icon { flex: none; }
  .tile ha-icon.inline { display: none; --mdc-icon-size: 16px; margin-right: 4px; vertical-align: -2px; }
  .tile .text { display: flex; flex-direction: column; min-width: 0; }
  .value { font-size: 16px; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .neg { color: ${BAD}; }
  .sub { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .label { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rows { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0 16px; }
  .row { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 4px 6px; border: 0; border-radius: 8px;
         background: transparent; color: var(--primary-text-color); font: inherit; font-size: 14px; text-align: left;
         cursor: pointer; --mdc-icon-size: 20px; }
  .row:hover { background: ${SUBTLE_BG(0.05)}; }
  .name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .amt { display: flex; flex-direction: column; align-items: flex-end; font-weight: 600; font-variant-numeric: tabular-nums; }
  .amt small { font-weight: 400; font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; }
  .idle { justify-content: center; color: var(--secondary-text-color); font-size: 12px; grid-column: 1 / -1; }
  /* The unit switch sits on a hairline divider: everything below it follows the switch,
     the waterfall above always stays in money. Smaller than the period pills, so the two
     rows of controls don't compete. */
  .details-toggle { display: block; margin: 8px auto 0; border: 0; background: none; font: inherit; font-size: 13px;
                    color: var(--secondary-text-color); padding: 6px 12px; border-radius: 999px; cursor: pointer; }
  .details-toggle:hover { background: ${SUBTLE_BG(0.05)}; color: var(--primary-text-color); }
  .empty { text-align: center; padding: 48px 16px; color: var(--secondary-text-color); font-size: 14px; }
  .unit-switch { display: flex; align-items: center; gap: 10px; margin: 6px 0 2px; }
  .unit-switch::before, .unit-switch::after { content: ""; flex: 1; border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12)); }
  .unit-switch .seg { padding: 2px; }
  .unit-switch .seg button { font-size: 12px; padding: 3px 10px; }
  .unit-switch .chart-seg button { padding: 3px 8px; --mdc-icon-size: 16px; line-height: 0; }
  @media (max-width: 600px) {
    ha-card { padding: 4px 8px 8px; }
    /* Phones: icon moves into the amount line so the text gets the full tile width. */
    .tile { padding: 6px 8px; min-height: 58px; }
    .tile ha-icon.side { display: none; }
    .tile ha-icon.inline { display: inline-block; }
    .value { font-size: 14px; }
    .rows { grid-template-columns: 1fr; }
  }
`;

/**
 * The Financials tab: earnings, house costs and per-device costs for a period the viewer
 * picks (day/week/month/year with back/forward and a date picker, all-time, or a custom
 * range). Current periods read the cumulative sensors' live attributes; past periods are
 * fetched from long-term statistics.
 */
class SbfFinancialsCard extends HTMLElement {
  // Back on the tab: open a period tapped on a chart, or follow a period tab picked there.
  connectedCallback() {
    if (this._config && this._applyJump()) return;
    const saved = readPref("fin", {}).mode;
    if (this._config && saved && saved !== this._mode && FIN_MODES.some(([m]) => m === saved)) {
      this._set({ mode: saved, offset: 0 });
    }
  }

  setConfig(config) {
    this._config = { main_devices: [], sub_devices: [], dash_url: "", ...config };
    const saved = readPref("fin", {});
    this._mode = FIN_MODES.some(([m]) => m === saved.mode) ? saved.mode : "day";
    this._offset = 0; // always open on the current period
    this._custom = saved.custom || { start: isoDate(periodStart("month", 0)), end: isoDate(new Date()) };
    this._cache = new Map();
    this._showIdle = readPref("fin:idle", false);
    this._showDetails = readPref("fin:details", false);
    this._chart = readPref("fin:chart", "sankey") === "bars" ? "bars" : "sankey";
    this._unit = ["money", "energy", "price"].find((u) => u === readPref("fin:unit", "money")) || "money";
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this._bind();
      // The diagram is drawn at the card's real width, so redraw when that changes.
      this._resize = new ResizeObserver(() => {
        const w = Math.round(this.clientWidth);
        if (w && w !== this._width) {
          this._width = w;
          this._render();
        }
      });
      this._resize.observe(this);
    }
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    setUiLang(hass);
    if (!this._config) return;
    if (this._isLive()) {
      const snapshot = this._ids().map((id) => this._liveValue(id)).join("|");
      if (snapshot !== this._snapshot) {
        this._snapshot = snapshot;
        this._render();
      }
    } else if (!this._cache.has(this._cacheKey()) && this._loading !== this._cacheKey()) {
      this._load();
    }
  }

  getCardSize() {
    return 12;
  }

  _devices() {
    return [...this._config.main_devices, ...this._config.sub_devices];
  }

  _ids() {
    const bases = [
      ...EARNINGS.map((e) => e.base),
      "total_system_cost_rate", "total_system_energy_rate", "net_grid_cost_rate", "net_grid_energy_rate",
      ...this._devices().flatMap((d) => [`${d.target}_cost_rate`, `${d.target}_energy_rate`]),
    ];
    return bases.map((b) => `${this._config.prefix}${b}_cumulative`);
  }

  _isLive() {
    return this._mode === "all" || (this._mode !== "custom" && this._offset === 0);
  }

  _cacheKey() {
    return this._mode === "custom" ? `custom:${this._custom.start}:${this._custom.end}` : `${this._mode}:${this._offset}`;
  }

  _liveValue(id) {
    const st = this._hass?.states[id];
    const v = parseFloat(st ? (this._mode === "all" ? st.state : st.attributes[LIVE_ATTR[this._mode]]) : NaN);
    return Number.isFinite(v) ? v : null;
  }

  _value(base) {
    return this._valueOf(`${this._config.prefix}${base}_cumulative`);
  }

  /**
   * While a new period loads, the previous period's values stay on screen (`_stale`) and
   * are patched in place once the new ones arrive, so nothing greys out or jumps.
   */
  _valueOf(id) {
    if (this._isLive()) return this._liveValue(id);
    const data = this._cache.get(this._cacheKey()) || this._stale;
    return data?.[id] ?? null;
  }

  _periodQuery(mode = this._mode, offset = this._offset) {
    if (mode !== "custom") return { calendar: { period: mode, offset } };
    const end = new Date(`${this._custom.end}T00:00:00`);
    end.setDate(end.getDate() + 1); // the end date is inclusive
    return { fixed_period: { start_time: `${this._custom.start}T00:00:00`, end_time: `${isoDate(end)}T00:00:00` } };
  }

  async _fetch(query) {
    const ids = this._ids();
    const results = await Promise.all(
      ids.map((id) =>
        this._hass
          .callWS({ type: "recorder/statistic_during_period", statistic_id: id, types: ["change"], ...query })
          .then((r) => r?.change ?? null, () => null)
      )
    );
    return Object.fromEntries(ids.map((id, i) => [id, results[i]]));
  }

  async _load() {
    const key = this._cacheKey();
    if (!this._hass || this._cache.has(key)) return this._render();
    this._loading = key;
    this._render();
    this._cache.set(key, await this._fetch(this._periodQuery()));
    if (this._loading === key) this._loading = null;
    if (key === this._cacheKey()) {
      this._stale = null;
      this._render();
    }
    this._prefetchPrevious();
  }

  /** Load the period before the one shown in the background, so the "‹" arrow is instant. */
  async _prefetchPrevious() {
    if (!this._hass || this._mode === "custom" || this._mode === "all") return;
    const offset = this._offset - 1;
    const key = `${this._mode}:${offset}`;
    if (this._cache.has(key) || this._prefetching === key) return;
    this._prefetching = key;
    try {
      this._cache.set(key, await this._fetch(this._periodQuery(this._mode, offset)));
    } finally {
      if (this._prefetching === key) this._prefetching = null;
    }
  }

  /** True when the selected period ends before the first day with data. */
  _beforeData() {
    const first = this._config.data_start;
    if (!first || this._mode === "all") return false;
    if (this._mode === "custom") return new Date(`${this._custom.end}T23:59:59`).getTime() < first;
    return periodStart(this._mode, this._offset + 1).getTime() <= first;
  }

  /** True when stepping back would only show periods without data. */
  _atFirstPeriod() {
    const first = this._config.data_start;
    return Boolean(first) && periodStart(this._mode, this._offset).getTime() <= first;
  }

  _noDataText() {
    const date = new Date(this._config.data_start).toLocaleDateString(this._hass?.locale?.language, { day: "numeric", month: "long", year: "numeric" });
    return tr("No data before {date}", { date });
  }

  /** Opens the period of a bar tapped on a history chart (see drillToFinancials), once. */
  _applyJump() {
    const jump = readPref("fin:jump", null);
    if (!jump || !FIN_MODES.some(([m]) => m === jump.mode)) return false;
    writePref("fin:jump", null);
    this._set({ mode: jump.mode, offset: offsetFor(jump.mode, new Date(jump.date)) });
    return true;
  }

  _set({ mode = this._mode, offset = this._offset, custom = this._custom }) {
    this._stale = Object.fromEntries(this._ids().map((id) => [id, this._valueOf(id)]));
    this._mode = mode;
    this._offset = offset;
    this._custom = custom.start > custom.end ? { start: custom.end, end: custom.start } : custom;
    writePref("fin", { mode: this._mode, custom: this._custom });
    linkPeriodFromFinancials(this._mode);
    this._snapshot = null;
    if (this._isLive()) {
      this._render();
      this._prefetchPrevious();
    } else this._load();
  }

  _money(v) {
    return formatMoney(this._hass, v);
  }

  /**
   * A lead value followed by the average price: "15.9 kWh @ €0.22" or "€3.50 @ €0.22". As HTML
   * the price part is a span that CSS hides on narrow screens.
   */
  _withPrice(lead, cost, kwh, html = true) {
    const price = cost !== null && kwh !== null && Math.abs(kwh) > 0.001 ? ` @ ${this._money(cost / kwh)}` : "";
    return html ? `${escapeHtml(lead)}${price ? `<span class="avg">${escapeHtml(price)}</span>` : ""}` : `${lead}${price}`;
  }

  _priceText(p) {
    return p === null ? "—" : `${formatMoney(this._hass, p, 3)}/kWh`;
  }

  _periodLabel() {
    if (this._mode === "all") return tr("All time");
    const lang = this._hass?.locale?.language;
    const start = periodStart(this._mode, this._offset);
    const fmt = (d, o) => d.toLocaleDateString(lang, o);
    if (this._mode === "day") {
      if (this._offset === 0) return tr("Today");
      if (this._offset === -1) return tr("Yesterday");
      return fmt(start, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    }
    if (this._mode === "week") {
      if (this._offset === 0) return tr("This week");
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${fmt(start, { day: "numeric", month: "short" })} – ${fmt(end, { day: "numeric", month: "short", year: "numeric" })}`;
    }
    if (this._mode === "month") return fmt(start, { month: "long", year: "numeric" });
    return String(start.getFullYear());
  }

  _controlsHtml() {
    const today = isoDate(new Date());
    let nav = "";
    if (this._mode === "custom") {
      nav = `<div class="range">
          <input type="date" id="start" aria-label="${tr("From")}" value="${this._custom.start}" max="${today}">
          <span>–</span>
          <input type="date" id="end" aria-label="${tr("To")}" value="${this._custom.end}" max="${today}">
        </div>`;
    } else if (this._mode !== "all") {
      nav = `<div class="nav">
          <button id="prev" aria-label="${tr("Previous period")}" ${this._atFirstPeriod() ? "disabled" : ""}>‹</button>
          <span class="plabel">${escapeHtml(this._periodLabel())}</span>
          <button id="next" aria-label="${tr("Next period")}" ${this._offset >= 0 ? "disabled" : ""}>›</button>
          <button id="pick" aria-label="${tr("Pick a date")}" title="${tr("Pick a date")}"><ha-icon icon="mdi:calendar"></ha-icon></button>
          <input type="date" id="jump" aria-label="Date" max="${today}">
          ${this._offset < 0 ? `<button id="now" class="now">${tr("Now")}</button>` : ""}
        </div>`;
    }
    return `<div class="controls">${segmentHtml("mode", FIN_MODES, this._mode)}${nav}</div>`;
  }

  /** The €, kWh, €/kWh switch, placed between the waterfall and what it changes. */
  _unitHtml() {
    const symbol = formatMoney(this._hass, 0).replace(/[\d.,\s\u00a0-]/g, "") || "€";
    const chartBtn = (value, icon, label) =>
      `<button data-chart="${value}" aria-pressed="${this._chart === value}" aria-label="${tr(label)}" title="${tr(label)}"><ha-icon icon="${icon}"></ha-icon></button>`;
    // Prices don't add up, so the €/kWh view only has bars and no chart toggle.
    const chart = this._unit === "price" ? ""
      : `<div class="seg chart-seg" role="group">${chartBtn("sankey", "mdi:chart-sankey", "Flow diagram")}${chartBtn("bars", "mdi:align-horizontal-left", "Bars")}</div>`;
    return `<div class="unit-switch">${segmentHtml("unit", [["money", symbol], ["energy", "kWh"], ["price", `${symbol}/kWh`]], this._unit)}${chart}</div>`;
  }

  /** Width available to the diagrams. */
  _diagramWidth(min = 280) {
    return Math.max(min, (this._width || this.clientWidth || 600) - 24);
  }

  _url(path) {
    return `${this._config.dash_url}/${path}`;
  }

  /** The period's house totals. */
  _figures() {
    const v = (base) => this._value(base);
    const cost = v("total_system_cost_rate");
    const kwh = v("total_system_energy_rate");
    const net = v("net_grid_cost_rate");
    const earned = v("system_earnings_rate");
    return {
      cost, kwh, net,
      gross: net !== null && earned !== null ? net + earned : null,
      solar: v("solar_only_earnings_rate"),
      battery: v("battery_added_value_rate"),
      avgPrice: cost !== null && kwh !== null && Math.abs(kwh) > 0.001 ? cost / kwh : null,
    };
  }

  /** A device's cost, kWh and average price in the period, plus `main`: the selected unit's value. */
  _measure(d) {
    const cost = this._value(`${d.target}_cost_rate`);
    const kwh = this._value(`${d.target}_energy_rate`);
    // A price over a few watt-hours means nothing, so small users get none (and count as idle).
    const price = cost !== null && kwh !== null && kwh >= PRICE_MIN_KWH ? cost / kwh : null;
    return { ...d, label: tr(d.label), cost, kwh, price, main: this._unit === "energy" ? kwh : this._unit === "price" ? price : cost };
  }

  /**
   * Main devices with their value for `metric` ("cost_rate"/"energy_rate"), largest first, each
   * split into its sub-devices and "Other" (measured by the parent, not by its sub-devices).
   * Values under `min` are left out. Feeds both the Sankey and the bars.
   */
  _breakdown(metric, min) {
    const pos = (x) => (x === null ? 0 : Math.max(0, x));
    const value = (d) => pos(this._value(`${d.target}_${metric}`));
    return this._config.main_devices
      .map((d) => ({ d, value: value(d) }))
      .filter((m) => m.value > min)
      .sort((a, b) => b.value - a.value)
      .map(({ d, value: total }) => {
        const kids = this._config.sub_devices
          .filter((s) => s.parent === d.target)
          .map((s) => ({ key: `sub:${s.target}`, label: tr(s.label), value: value(s), nav: s.nav, color: this._deviceColor(s.target) }))
          .filter((c) => c.value > min)
          .sort((a, b) => b.value - a.value);
        const rest = pos(total - kids.reduce((sum, c) => sum + c.value, 0));
        const parts = kids.length && rest > min
          ? [...kids, { key: `rest:${d.target}`, label: tr("Other"), value: rest, nav: d.nav, color: PALETTE.other }]
          : kids;
        return { key: `dev:${d.target}`, label: tr(d.label), value: total, nav: d.nav, color: this._deviceColor(d.target), parts };
      });
  }

  _render() {
    if (!this._config) return;
    const loading = !this._isLive() && !this._cache.has(this._cacheKey());
    const f = this._figures();
    renderInto(this.shadowRoot, `<style>${SEGMENT_CSS}${CARD_CSS}${SANKEY_CSS}${WATERFALL_CSS}${SEGMENT_BARS_CSS}</style>
      <ha-card>
        ${this._controlsHtml()}
        <div class="progress ${loading ? "on" : ""}"></div>
        <div class="body" aria-busy="${loading}">
          ${this._beforeData()
            ? `<div class="empty">${escapeHtml(this._noDataText())}</div>`
            : `${this._waterfallHtml(f)}
          ${this._unitHtml()}
          ${this._overviewHtml(f)}
          ${this._detailsHtml(this._rowsHtml(this._config.main_devices, "main"), this._rowsHtml(this._config.sub_devices, "sub"))}`}
        </div>
      </ha-card>`);
  }

  _waterfallHtml(f) {
    return waterfallSvg(
      { gross: f.gross, solar: f.solar, battery: f.battery, net: f.net },
      {
        width: this._diagramWidth(260),
        format: (x) => this._money(x),
        nav: {
          solar: this._url("financials-solar-only-earnings"),
          battery: this._url("financials-battery-added-value"),
          total: this._url("financials-total-system-earnings"),
          net: this._url("financials-net-bill"),
          gross: this._url("financials-gross-cost"),
        },
      }
    );
  }

  /** The diagram below the unit switch: price bars, or the € / kWh breakdown as Sankey or bars. */
  _overviewHtml(f) {
    const nav = this._url("financials-effective-cost");
    if (this._unit === "price") {
      const items = [...this._config.main_devices, ...this._config.sub_devices]
        .map((d) => ({ ...this._measure(d), color: this._deviceColor(d.target) }))
        .filter((d) => d.price !== null)
        .sort((a, b) => b.price - a.price);
      return priceBarsSvg(items, {
        width: this._diagramWidth(), average: f.avgPrice, nav,
        tone: (d) => priceToneOf(d.price, f.avgPrice), format: (x) => this._priceText(x),
      });
    }
    const root = this._unit === "energy"
      ? { label: tr("Consumption"), total: f.kwh, metric: "energy_rate", min: 0.04, format: formatKwh,
        detail: f.cost !== null ? this._withPrice(this._money(f.cost), f.cost, f.kwh, false) : "" }
      : { label: tr("Effective cost"), total: f.cost, metric: "cost_rate", min: 0.004, format: (x) => this._money(x),
        detail: f.kwh !== null ? this._withPrice(`${f.kwh.toFixed(1)} kWh`, f.cost, f.kwh, false) : "" };
    if (root.total === null || root.total <= 0) return "";
    const devices = this._breakdown(root.metric, root.min);
    return this._chart === "bars" ? this._barsHtml(devices, { ...root, nav }) : this._sankeyHtml(devices, { ...root, nav });
  }

  /** Device rows for one section, in the selected unit, sorted by it. */
  _rowsHtml(devices, section) {
    if (!devices.length) return "";
    const unit = this._unit;
    const isIdle = (d) => unit === "price"
      ? d.price === null
      : (d.cost === null || Math.abs(d.cost) < 0.005) && (d.kwh === null || Math.abs(d.kwh) < 0.05);
    const text = (d) => {
      if (unit === "energy") return [formatKwh(d.kwh), d.cost === null ? "" : this._withPrice(this._money(d.cost), d.cost, d.kwh)];
      if (unit === "price") return [this._priceText(d.price), d.kwh === null ? "" : `${formatKwh(d.kwh)} · ${escapeHtml(this._money(d.cost))}`];
      return [this._money(d.cost), d.kwh === null ? "" : this._withPrice(`${d.kwh.toFixed(1)} kWh`, d.cost, d.kwh)];
    };
    return rowsHtml(
      devices
        .map((d) => this._measure(d))
        .sort((a, b) => (b.main ?? -Infinity) - (a.main ?? -Infinity))
        .map((d) => {
          const [amount, detail] = text(d);
          return { ...d, amount, detail, color: this._deviceColor(d.target), idle: isIdle(d) };
        }),
      { section, showIdle: this._showIdle }
    );
  }

  /**
   * A device's colour follows its place in the configuration, not its rank, so it keeps the
   * same colour in every view and period. Untracked is always grey.
   */
  _deviceColor(target) {
    if (target === "untracked") return PALETTE.untracked;
    const order = [...this._config.main_devices, ...this._config.sub_devices]
      .filter((d) => d.target !== "untracked")
      .map((d) => d.target);
    const i = order.indexOf(target);
    return SANKEY_PALETTE[(i < 0 ? 0 : i) % SANKEY_PALETTE.length];
  }

  /**
   * The device lists repeat what the diagram shows (adding kWh and price per device), so
   * they are folded behind one line by default; the choice is remembered per browser.
   */
  _detailsHtml(mainRows, subRows) {
    const nMain = this._config.main_devices.length;
    const nSub = this._config.sub_devices.length;
    if (!this._showDetails) {
      const counts = [
        tr(nMain === 1 ? "{n} device" : "{n} devices", { n: nMain }),
        ...(nSub ? [tr(nSub === 1 ? "{n} sub-device" : "{n} sub-devices", { n: nSub })] : []),
      ].join(", ");
      return `<button class="details-toggle" data-details>${escapeHtml(tr("Show device details ({counts})", { counts }))}</button>`;
    }
    return `<h3>${tr("Devices")}</h3><div class="rows">${mainRows}</div>
      ${subRows ? `<h3>${tr("Sub-devices")}</h3><div class="rows">${subRows}</div>` : ""}
      <button class="details-toggle" data-details>${tr("Hide device details")}</button>`;
  }

  /** Bars alternative to the Sankey: one bar per device, its parts as coloured segments. */
  _barsHtml(devices, root) {
    const items = devices.map((d) => ({
      label: d.label, value: d.value, nav: d.nav, parent: d.parts.length > 0,
      segments: d.parts.length ? d.parts : [{ label: d.label, value: d.value, color: d.color, nav: d.nav }],
    }));
    return segmentBarsSvg(items, {
      width: this._diagramWidth(), total: root.total, format: root.format, nav: root.nav,
      header: `${root.label} ${root.format(root.total)}${root.detail ? ` · ${root.detail}` : ""}`,
    });
  }

  /** Sankey: house total → devices (→ their sub-devices and "Other"). */
  _sankeyHtml(devices, root) {
    const width = this._diagramWidth();
    const node = (d) => ({ id: d.key, label: d.label, value: d.value, nav: d.nav, color: d.color });
    const cols = [[{ id: "house", label: root.label, value: root.total, color: SANKEY_COLORS.home, detail: root.detail, nav: root.nav }]];
    const links = [];
    const parents = [];
    const leaves = [];
    devices.forEach((d) => {
      links.push({ from: "house", to: d.key, value: d.value });
      if (!d.parts.length) {
        leaves.push(node(d)); // no sub-devices: straight to the last column, as in HA
        return;
      }
      d.parts.forEach((part) => {
        leaves.push(node(part));
        links.push({ from: d.key, to: part.key, value: part.value });
      });
      parents.push({ ...node(d), children: d.parts.map((part) => part.key) });
    });
    if (parents.length) cols.push(parents);
    cols.push(leaves);
    return sankeySvg(cols, links, { width, vertical: width < 560, format: root.format }); // phones: top to bottom, as in HA
  }

  _bind() {
    const root = this.shadowRoot;
    root.addEventListener("click", (e) => {
      const node = e.target.closest?.("[data-nav-svg]");
      if (node) navigateTo(node.getAttribute("data-nav-svg"));
    });
    root.addEventListener("keydown", (e) => {
      const node = e.key === "Enter" || e.key === " " ? e.target.closest?.("[data-nav-svg]") : null;
      if (node) {
        e.preventDefault();
        navigateTo(node.getAttribute("data-nav-svg"));
      }
    });
    // Phones: swipe right for the previous period, left for the next one.
    let touch = null;
    root.addEventListener("touchstart", (e) => {
      touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    }, { passive: true });
    root.addEventListener("touchend", (e) => {
      if (!touch || this._mode === "all" || this._mode === "custom") return;
      const dx = e.changedTouches[0].clientX - touch.x;
      const dy = e.changedTouches[0].clientY - touch.y;
      touch = null;
      if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) / 2) return; // mostly horizontal only
      if (dx > 0 && !this._atFirstPeriod()) this._set({ offset: this._offset - 1 });
      else if (dx < 0 && this._offset < 0) this._set({ offset: this._offset + 1 });
    }, { passive: true });
    bindCardActions(root, this, {
      onIdleToggle: () => {
        this._showIdle = !this._showIdle;
        writePref("fin:idle", this._showIdle);
        this._render();
      },
      onClick: (el) => {
        if (el.dataset.mode) this._set({ mode: el.dataset.mode, offset: 0 });
        else if (el.dataset.details !== undefined) {
          this._showDetails = !this._showDetails;
          writePref("fin:details", this._showDetails);
          this._render();
        } else if (el.dataset.chart) {
          this._chart = el.dataset.chart;
          writePref("fin:chart", this._chart);
          this._render();
        } else if (el.dataset.unit) {
          this._unit = el.dataset.unit;
          writePref("fin:unit", this._unit);
          this._render();
        }
        else if (el.id === "prev") this._set({ offset: this._offset - 1 });
        else if (el.id === "next") this._set({ offset: Math.min(0, this._offset + 1) });
        else if (el.id === "now") this._set({ offset: 0 });
        else if (el.id === "pick") {
          const input = root.getElementById("jump");
          try {
            input.showPicker();
          } catch (e) {
            input.classList.add("shown");
            input.focus();
          }
        }
      },
    });
    root.addEventListener("change", (e) => {
      const { id, value } = e.target;
      if (!value) return;
      if (id === "jump") this._set({ offset: offsetFor(this._mode, new Date(`${value}T00:00:00`)) });
      else if (id === "start" || id === "end") this._set({ custom: { ...this._custom, [id]: value } });
    });
  }
}

/**
 * Power tab companion to the Financials card, in the same visual style.
 * show: "summary" → today's earnings + price / inverter efficiency / battery temperature tiles;
 * show: "devices" → live power per device, sorted, idle devices folded.
 */
class SbfPowerCard extends HTMLElement {
  setConfig(config) {
    this._config = { show: "summary", main_devices: [], sub_devices: [], dash_url: "", ...config };
    this._showIdle = readPref("power:idle", false);
    this._html = null;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      bindCardActions(this.shadowRoot, this, {
        onIdleToggle: () => {
          this._showIdle = !this._showIdle;
          writePref("power:idle", this._showIdle);
          this._render();
        },
      });
    }
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    setUiLang(hass);
    if (this._config) this._render();
  }

  getCardSize() {
    return this._config?.show === "devices" ? 6 : 2;
  }

  _num(id) {
    const v = parseFloat(id ? this._hass?.states[id]?.state : NaN);
    return Number.isFinite(v) ? v : null;
  }

  _summaryHtml() {
    const c = this._config;
    const today = (base) => {
      const v = parseFloat(this._hass?.states[`${c.prefix}${base}_cumulative`]?.attributes?.today);
      return Number.isFinite(v) ? v : null;
    };
    const earnTiles = EARNINGS.map((e, i) => {
      const v = today(e.base);
      return tileHtml({
        label: ["Today", "Solar", "Battery"][i], icon: e.icon, color: e.color,
        value: formatMoney(this._hass, v), negative: v !== null && v <= -0.005, nav: `${c.dash_url}/power-${e.path}`,
      });
    }).join("");
    const status = [];
    const price = this._num(c.price_sensor);
    if (c.price_sensor) status.push(tileHtml({ label: "Price", icon: "mdi:cash", color: PALETTE.price, value: price === null ? "—" : `${formatMoney(this._hass, price, 3)}/kWh`, nav: `${c.dash_url}/${STATUS_PATHS.price}` }));
    const eff = this._num(c.efficiency_sensor);
    if (c.efficiency_sensor) status.push(tileHtml({ label: "Inverter", icon: "mdi:sine-wave", color: `var(--info-color, ${PALETTE.inverter})`, value: eff === null ? "—" : `${eff.toFixed(1)}%`, nav: `${c.dash_url}/${STATUS_PATHS.inverter}` }));
    const temp = this._num(c.temp_sensor);
    if (c.temp_sensor) {
      const unit = this._hass?.states[c.temp_sensor]?.attributes?.unit_of_measurement || "°C";
      status.push(tileHtml({ label: "Battery temp", icon: "mdi:thermometer", color: PALETTE.temperature, value: temp === null ? "—" : `${temp.toFixed(1)} ${unit}`, nav: `${c.dash_url}/${STATUS_PATHS.temp}` }));
    }
    return `<div class="tiles">${earnTiles}</div>${status.length ? `<div class="tiles">${status.join("")}</div>` : ""}`;
  }

  _devicesHtml() {
    const rows = (devices, section) =>
      rowsHtml(
        devices
          .map((d) => {
            const w = this._num(d.entity);
            const kw = this._hass?.states[d.entity]?.attributes?.unit_of_measurement === "kW";
            return { ...d, w: w !== null && kw ? w * 1000 : w };
          })
          .sort((a, b) => (b.w ?? -Infinity) - (a.w ?? -Infinity))
          .map((d) => ({
            ...d,
            amount: formatPower(d.w),
            color: d.w === null ? "var(--disabled-text-color)" : d.w < 50 ? GOOD : d.w < 1000 ? WARN : BAD,
            idle: d.w === null || d.w < 1,
          })),
        { section, showIdle: this._showIdle }
      );
    const sub = this._config.sub_devices.length ? rows(this._config.sub_devices, "sub") : "";
    return `<h3>${tr("Devices")}</h3><div class="rows">${rows(this._config.main_devices, "main")}</div>
      ${sub ? `<h3>${tr("Sub-devices")}</h3><div class="rows">${sub}</div>` : ""}`;
  }

  _render() {
    const body = this._config.show === "devices" ? this._devicesHtml() : this._summaryHtml();
    const html = `<style>${SEGMENT_CSS}${CARD_CSS} :host { max-width: none; } ha-card { padding: 12px; }</style><ha-card>${body}</ha-card>`;
    if (html === this._html) return; // nothing visible changed
    this._html = html;
    renderInto(this.shadowRoot, html);
  }
}

const safeDefine = (tag, baseClass) => {
  if (typeof customElements !== "undefined" && !customElements.get(tag)) {
    customElements.define(tag, class extends baseClass { });
  }
};

// Used as `strategy: {type: custom:solar-battery-financials}`.
safeDefine("ll-strategy-dashboard-solar-battery-financials", SbfDashboardStrategy);

safeDefine("sbf-tabs-card", SbfTabsCard);
safeDefine("sbf-financials-card", SbfFinancialsCard);
safeDefine("sbf-power-card", SbfPowerCard);
