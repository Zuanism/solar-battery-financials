/**
 * Lovelace Dashboard Strategy for Solar & Battery Financials
 * Modular Procedural Strategy (Pure Object Composition)
 */
console.info("⚡ SBF Strategy JS loaded (Modular v5.44)");

// ============================================================================
// 1. REUSABLE CSS STYLES
// ============================================================================
const STYLES = {
  noShadow:
    ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
  stackGrid:
    ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
  transparentCard:
    "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
  subviewHeader:
    "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n",
  subviewHeaderPointer:
    "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n  cursor: pointer !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n",
  pillContainer:
    "ha-card {\n  background: rgba(var(--rgb-primary-text-color), 0.05);\n  border-radius: 24px;\n  padding: 4px;\n  margin: 0 auto;\n  width: fit-content;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n",
  pillContainerSubview:
    "ha-card {\n  background: rgba(var(--rgb-primary-text-color), 0.05);\n  border-radius: 24px;\n  padding: 4px;\n  margin: 0 auto;\n  width: fit-content;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  margin-bottom: 8px !important;\n}\n",
};

// ============================================================================
// 2. PERIOD PILLS & CHIPS BUILDERS
// ============================================================================
const PERIOD_PILLS = [
  { content: "Daily", option: "Daily" },
  { content: "Weekly", option: "Weekly" },
  { content: "Monthly", option: "Monthly" },
  { content: "Yearly", option: "Yearly" },
  { content: "All", option: "All-Time" },
];

const CHART_PERIOD_CHIPS = {
  daily: [["7", "7 Days"], ["14", "14 Days"], ["30", "30 Days"], ["60", "60 Days"], ["90", "90 Days"]],
  weekly: [["4", "4 Weeks"], ["8", "8 Weeks"], ["12", "12 Weeks"], ["26", "26 Weeks"], ["52", "52 Weeks"]],
  monthly: [["6", "6 Months"], ["12", "12 Months"], ["24", "24 Months"], ["36", "36 Months"]],
};

const POWER_CHIPS = [["1", "1 Day"], ["3", "3 Days"], ["7", "7 Days"], ["14", "14 Days"]];

const createPillStyle = (selectEntity, stateValue) =>
  `ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('${selectEntity}', '${stateValue}') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('${selectEntity}', '${stateValue}') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('${selectEntity}', '${stateValue}') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('${selectEntity}', '${stateValue}') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n`;

const makeChip = (selectEntity, val, label) => ({
  type: "template",
  content: label,
  card_mod: { style: createPillStyle(selectEntity, val) },
  tap_action: {
    action: "call-service",
    service: "select.select_option",
    target: { entity_id: selectEntity },
    data: { option: val },
  },
});

const createChipsCard = (chips, style, alignment = "center") => ({
  type: "custom:mushroom-chips-card",
  alignment,
  ...(style ? { card_mod: { style } } : {}),
  chips,
});

const createPeriodPills = (selectEntity = "select.sbf_financial_view_period", isSubview = false) =>
  createChipsCard(
    PERIOD_PILLS.map((p) => makeChip(selectEntity, p.option, p.content)),
    isSubview ? STYLES.pillContainerSubview : STYLES.pillContainer
  );

const createChartChips = (selectEntity, options) =>
  createChipsCard(options.map(([val, label]) => makeChip(selectEntity, val, label)));

// ============================================================================
// 3. MAIN FINANCIALS VIEW BUILDERS
// ============================================================================
const makeMushroomTemplateCard = ({ entity, primary, secondary, icon, icon_color, navPath, multiline = true, layout = "vertical" }) => ({
  type: "custom:mushroom-template-card",
  entity,
  primary,
  secondary,
  icon,
  icon_color,
  layout,
  multiline_secondary: multiline,
  ...(navPath ? { tap_action: { action: "navigate", navigation_path: navPath } } : {}),
});

const subviewHeaderCard = (entity, label, pointer = false) => ({
  type: "custom:mushroom-template-card",
  entity,
  primary: label,
  icon_type: "none",
  tap_action: { action: "more-info", entity },
  card_mod: { style: pointer ? STYLES.subviewHeaderPointer : STYLES.subviewHeader },
});

const conditionalVerticalStack = (period, cards) => ({
  type: "conditional",
  conditions: [{ entity: "select.sbf_financial_view_period", state: period }],
  card: { type: "vertical-stack", cards },
});

const grid3Cols = (cards) => ({
  type: "grid",
  columns: 3,
  square: false,
  card_mod: { style: STYLES.noShadow },
  cards,
});

const stackGridCards = (cards) => ({
  type: "custom:stack-in-card",
  cards: [{ type: "grid", columns: 2, square: false, card_mod: { style: STYLES.stackGrid }, cards }],
});

const makePanelSubview = (title, path, cards) => ({
  title,
  path,
  subview: true,
  type: "panel",
  cards: [{ type: "vertical-stack", cards }],
});

const EARNINGS_CARDS_DEF = [
  { key: "system_earnings", label: "Total", icon: "mdi:finance", color: "green", path: "financials-total-system-earnings" },
  { key: "solar_only_earnings", label: "Solar Only", icon: "mdi:solar-power", color: "amber", path: "financials-solar-only-earnings" },
  { key: "battery_added_value", label: "Battery Val", icon: "mdi:battery-arrow-up", color: "purple", path: "financials-battery-added-value" },
];

const createEarningsRow = (suffix, dashUrl = "") =>
  grid3Cols(
    EARNINGS_CARDS_DEF.map((c) =>
      makeMushroomTemplateCard({
        entity: `sensor.sbf2_${c.key}_rate_${suffix}`,
        primary: `{{ states('sensor.sbf2_${c.key}_rate_${suffix}') | float(0) | round(2) }} €`,
        secondary: c.label,
        icon: c.icon,
        icon_color: c.color,
        navPath: `${dashUrl}/${c.path}`,
      })
    )
  );

const costSecondaryTemplate = (costId, kwhId, label) =>
  `{% set cost = states('${costId}')|float(0) %}\
 {% set kwh = states('${kwhId}')|float(0) %}\
 {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %}\
 ${label}{{\n'\\n'}}{{ kwh | round(1) }} kWh @ €{{ avg }}`;

const createCostsRow = (suffix, dashUrl = "") => {
  const totCost = `sensor.sbf2_total_system_cost_rate_${suffix}`;
  const totKwh = `sensor.sbf2_total_system_energy_rate_${suffix}`;
  const netCost = `sensor.sbf2_net_grid_cost_rate_${suffix}`;
  const netKwh = `sensor.sbf2_net_grid_energy_rate_${suffix}`;
  const sysEarn = `sensor.sbf2_system_earnings_rate_${suffix}`;

  return grid3Cols([
    makeMushroomTemplateCard({
      entity: totCost,
      primary: `{% set cost = states('${totCost}')|float(0) %} {{ cost | round(2) }} €`,
      secondary: costSecondaryTemplate(totCost, totKwh, "Effective"),
      icon: "mdi:currency-eur",
      icon_color: "amber",
      navPath: `${dashUrl}/financials-effective-cost`,
    }),
    makeMushroomTemplateCard({
      entity: totKwh,
      primary: `{% set net = states('${netCost}')|float(0) %}\
 {% set earn = states('${sysEarn}')|float(0) %}\
 {% set cost = (net + earn) %}\
 {{ cost | round(2) }} €`,
      secondary: `{% set net = states('${netCost}')|float(0) %}\
 {% set earn = states('${sysEarn}')|float(0) %}\
 {% set cost = (net + earn) %}\
 {% set kwh = states('${totKwh}')|float(0) %}\
 {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %}\
 Gross{{\n'\\n'}}{{ kwh | round(1) }} kWh @ €{{ avg }}`,
      icon: "mdi:cash-remove",
      icon_color: "red",
    }),
    makeMushroomTemplateCard({
      entity: netCost,
      primary: `{% set cost = states('${netCost}')|float(0) %} {{ cost | round(2) }} €`,
      secondary: costSecondaryTemplate(netCost, netKwh, "Net Bill"),
      icon: "mdi:receipt-text-check",
      icon_color: "green",
      navPath: `${dashUrl}/financials-net-bill`,
    }),
  ]);
};

const createFinancialsConditional = (period, suffix, dashUrl = "") =>
  conditionalVerticalStack(period, [
    { type: "heading", heading: "Earnings", icon: "mdi:piggy-bank" },
    createEarningsRow(suffix, dashUrl),
    { type: "heading", heading: "Total House Costs", icon: "mdi:home-lightning-bolt" },
    createCostsRow(suffix, dashUrl),
  ]);

/**
 * Builds a Mushroom card representing device financial stats (cost, energy, and unit rate).
 * @param {Object} opts
 * @param {string} opts.devName - Display name of the device
 * @param {string} opts.devTarget - Entity slug target (e.g. "dev_kitchen_appliances")
 * @param {string} opts.devId - Original entity ID
 * @param {string} opts.suffix - Period suffix ("daily", "weekly", "monthly", "yearly", "cumulative")
 * @param {number} opts.lowThresh - Low threshold for green color
 * @param {number} opts.highThresh - High threshold for orange color (above is red)
 * @param {string} [opts.dashUrl=""] - Dashboard base URL
 * @param {Object} [opts.states={}] - HA states dictionary for smart icon resolution
 */
const makeDeviceFinCard = ({ devName, devTarget, devId, suffix, lowThresh, highThresh, dashUrl = "", states = {} }) => ({
  type: "custom:mushroom-template-card",
  entity: `sensor.sbf2_${devTarget}_cost_rate_${suffix}`,
  primary: devName,
  secondary: `{% set cost = states('sensor.sbf2_${devTarget}_cost_rate_${suffix}')|float(0) %}\
 {% set kwh = states('sensor.sbf2_${devTarget}_energy_rate_${suffix}')|float(0) %}\
 {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %}\
 €{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})`,
  icon: getSmartIcon(devName, devId, states),
  icon_color: `{% set c = states('sensor.sbf2_${devTarget}_cost_rate_${suffix}') | float(0) %}\
 {% if c < ${lowThresh} %} green {% elif c < ${highThresh} %} orange {% else %} red {% endif %}`,
  layout: "horizontal",
  fill_container: true,
  tap_action: {
    action: "navigate",
    navigation_path: `${dashUrl}/financials-${slugify(devName)}`,
  },
  card_mod: { style: STYLES.transparentCard },
});

const createDeviceSection = (period, suffix, mainCards = [], subsetCards = []) =>
  conditionalVerticalStack(period, [
    { type: "heading", heading: "Main devices", icon: "mdi:domain" },
    stackGridCards(mainCards),
    { type: "heading", heading: "Subset Devices", icon: "mdi:devices" },
    stackGridCards(subsetCards),
  ]);

// ============================================================================
// 4. APEXCHARTS BUILDERS & HELPERS
// ============================================================================
// Time constants (milliseconds)
const MS_PER_DAY = 86400000;
const MS_PER_WEEK = 7 * MS_PER_DAY; // 604800000
const MS_PER_MONTH = 30 * MS_PER_DAY; // 2592000000

const EVAL_NUMERIC_FORMATTER =
  "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n";

const EVAL_RATE_FORMATTER =
  "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(3);\n  }\n  return '';\n}\n";

const EVAL_RATE_TOOLTIP_FORMATTER =
  "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(3) + ' €/kWh';\n  }\n  return '';\n}\n";

const EVAL_MONEY_FORMATTER =
  "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '€' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n";

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

const barColorRanges = (low, high) => [
  { from: -100000, to: low, color: "#10b981" },
  { from: low, to: high, color: "#f59e0b" },
  { from: high, to: 100000, color: "#ef4444" },
];

const baseApexConfig = (yAxisTitle, extra = {}) => ({
  yaxis: {
    show: true,
    title: { text: yAxisTitle },
    decimalsInFloat: 2,
    ...(extra.yaxis || {}),
  },
  chart: { height: 280, zoom: { enabled: false }, toolbar: { show: false } },
  xaxis: { type: "datetime", tooltip: { enabled: false } },
  tooltip: { enabled: true },
  fill: { type: "solid", opacity: 0.5 },
  stroke: { show: true, width: 1.5 },
  grid: { borderColor: "rgba(128, 128, 128, 0.2)", strokeDashArray: 2 },
  ...extra,
  ...(extra.yaxis
    ? {
        yaxis: {
          show: true,
          title: { text: yAxisTitle },
          decimalsInFloat: 2,
          ...extra.yaxis,
        },
      }
    : {}),
});

const makeApexDataLabels = (enabled, formatter) => ({
  enabled,
  offsetY: -15,
  style: { colors: ["var(--primary-text-color)"] },
  background: { enabled: false },
  formatter,
});

const yearlySumDataGen = (entity) =>
  `return (async () => {
  const now = new Date(), currentYear = now.getFullYear();
  const res = await hass.callWS({
    type: 'recorder/statistics_during_period',
    start_time: new Date(currentYear - 11, 0, 1).toISOString(),
    end_time: new Date(currentYear + 1, 0, 1).toISOString(),
    statistic_ids: ['${entity}'],
    period: 'month',
    types: ['change']
  });
  const data = res?.['${entity}'] || [];
  const buckets = [];
  for (let k = 0; k < 12; k++) {
    const y = currentYear - k;
    const bStart = new Date(y, 0, 1).getTime();
    const bEnd = new Date(y + 1, 0, 1).getTime();
    let bSum = 0, hasData = false;
    data.forEach(c => {
      const ts = new Date(c.start).getTime();
      if (ts >= bStart && ts < bEnd) {
        if (c.change != null) { bSum += c.change; hasData = true; }
      }
    });
    if (hasData) buckets.push([bStart, parseFloat(bSum.toFixed(2))]);
  }
  return buckets.sort((a, b) => a[0] - b[0]);
})();`;

const yearlyFinalDataGen = (entity) =>
  `return (async () => {
  const now = new Date(), currentYear = now.getFullYear();
  const res = await hass.callWS({
    type: 'recorder/statistics_during_period',
    start_time: new Date(currentYear - 11, 0, 1).toISOString(),
    end_time: new Date(currentYear + 1, 0, 1).toISOString(),
    statistic_ids: ['${entity}'],
    period: 'month',
    types: ['state']
  });
  const data = res?.['${entity}'] || [];
  const buckets = [];
  for (let k = 0; k < 12; k++) {
    const y = currentYear - k;
    const bStart = new Date(y, 0, 1).getTime();
    const bEnd = new Date(y + 1, 0, 1).getTime();
    let bFinal = null, hasData = false, lastTs = 0;
    data.forEach(c => {
      const ts = new Date(c.start).getTime();
      if (ts >= bStart && ts < bEnd) {
        if (c.state != null && ts >= lastTs) {
          bFinal = c.state;
          lastTs = ts;
          hasData = true;
        }
      }
    });
    if (y === currentYear) {
      const liveState = parseFloat(hass.states['${entity}']?.state);
      if (!isNaN(liveState)) {
        bFinal = liveState;
        hasData = true;
      }
    }
    if (hasData && bFinal !== null) buckets.push([bStart, parseFloat(bFinal.toFixed(2))]);
  }
  return buckets.sort((a, b) => a[0] - b[0]);
})();`;

const makeColSeries = (entity, name, color, statsPeriod, isYearly, unit = "") => ({
  entity,
  name,
  type: "column",
  ...(color ? { color } : {}),
  ...(unit ? { unit } : {}),
  show: { datalabels: true },
  ...(isYearly
    ? {
        group_by: { func: "last", duration: "1y" },
        data_generator: yearlySumDataGen(entity),
      }
    : { statistics: { type: "change", period: statsPeriod, align: "start" } }),
});

const makeSeries = (entityBase, name, color, t, unit = "", allTimePeriod = "month") => {
  const isYearly = t.period === "Yearly";
  const isAllTime = t.period === "All-Time";
  const entity = isYearly ? `${entityBase}_yearly` : `${entityBase}_cumulative`;

  return {
    entity,
    name,
    type: isAllTime ? "area" : "column",
    ...(color ? { color } : {}),
    ...(unit ? { unit } : {}),
    show: { datalabels: !isAllTime },
    ...(isYearly
      ? {
          group_by: { func: "last", duration: "1y" },
          data_generator: yearlyFinalDataGen(entity),
        }
      : isAllTime
      ? {
          statistics: { type: "state", period: allTimePeriod, align: "start" },
        }
      : {
          statistics: { type: "change", period: t.stats, align: "start" },
        }),
  };
};

const staticOrConfigApexConfig = (yAxisTitle, thresholds, dataLabelsEnabled, formatter = EVAL_NUMERIC_FORMATTER) =>
  baseApexConfig(yAxisTitle, {
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
        dataLabels: { position: "top" },
        colors: { ranges: barColorRanges(thresholds[0], thresholds[1]) },
      },
    },
    dataLabels: makeApexDataLabels(dataLabelsEnabled, formatter),
  });

/**
 * Builds a dynamic bar chart wrapped in a config-template-card for reactive span & datalabels.
 * @param {Object} opts
 * @param {string} opts.entity - Statistic entity to query
 * @param {string} opts.name - Chart / series title
 * @param {string} opts.yAxisTitle - Y-axis label
 * @param {string} opts.selectEntity - HA select entity driving the time span
 * @param {string} opts.spanUnit - Duration unit ('d', 'w', 'month')
 * @param {string} opts.statsPeriod - Statistics period ('day', 'week', 'month')
 * @param {number[]} opts.thresholds - [low, high] color thresholds
 * @param {number} opts.mobileCutoff - Max units before disabling datalabels on mobile (<600px)
 * @param {number} opts.desktopCutoff - Max units before disabling datalabels on desktop
 * @param {string} [opts.unit=""] - Optional unit suffix (e.g. " kWh")
 */
const createBarChartCard = ({
  entity, name, yAxisTitle, selectEntity, spanUnit, statsPeriod, thresholds, mobileCutoff, desktopCutoff, unit,
}) => ({
  type: "custom:config-template-card",
  entities: [selectEntity],
  card: {
    type: "custom:apexcharts-card",
    graph_span: `\${states['${selectEntity}'].state + '${spanUnit}'}`,
    span: { end: "day" },
    header: { show: false, title: name },
    apex_config: staticOrConfigApexConfig(
      yAxisTitle,
      thresholds,
      `\${window.innerWidth < 600 ? parseInt(states['${selectEntity}'].state) <= ${mobileCutoff} : parseInt(states['${selectEntity}'].state) <= ${desktopCutoff}}`
    ),
    series: [makeColSeries(entity, name, null, statsPeriod, false, unit)],
  },
});

const createYearlyStaticBarChart = ({ entity, name, yAxisTitle, thresholds, unit }) => ({
  type: "custom:apexcharts-card",
  graph_span: "10y",
  span: { end: "year" },
  header: { show: false, title: name },
  apex_config: staticOrConfigApexConfig(yAxisTitle, thresholds, true),
  series: [makeColSeries(entity, name, null, "month", true, unit)],
});

/**
 * Generates an async JavaScript string executed within custom:apexcharts-card
 * to compute unit rate (€/kWh) buckets directly from recorder statistics.
 */
const deviceRateDataGen = (devTarget, selectEntity, spanUnit, statsPeriod) =>
  `return (async () => {
  const costId = "sensor.sbf2_${devTarget}_cost_rate_cumulative", energyId = "sensor.sbf2_${devTarget}_energy_rate_cumulative";
  const units = parseInt(hass.states['${selectEntity}']?.state || '7') || 7, end = new Date();
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
  const buckets = [];
  costs.forEach(c => {
    const kwh = energyMap.get(new Date(c.start).getTime());
    const val = (c.change != null && kwh != null && kwh > 0) ? parseFloat((c.change / kwh).toFixed(3)) : null;
    buckets.push([new Date(c.start).getTime(), val]);
  });
  return buckets;
})();`;

const deviceYearlyRateDataGen = (devTarget) =>
  `return (async () => {
  const costId = "sensor.sbf2_${devTarget}_cost_rate_cumulative", energyId = "sensor.sbf2_${devTarget}_energy_rate_cumulative";
  const now = new Date(), currentYear = now.getFullYear();
  const res = await hass.callWS({
    type: 'recorder/statistics_during_period',
    start_time: new Date(currentYear - 11, 0, 1).toISOString(),
    end_time: new Date(currentYear + 1, 0, 1).toISOString(),
    statistic_ids: [costId, energyId],
    period: 'month',
    types: ['change']
  });
  const costs = res?.[costId] || [], energies = res?.[energyId] || [], energyMap = new Map();
  energies.forEach(e => energyMap.set(new Date(e.start).getTime(), e.change));
  const buckets = [];
  for (let k = 0; k < 12; k++) {
    const y = currentYear - k;
    const bStart = new Date(y, 0, 1).getTime();
    const bEnd = new Date(y + 1, 0, 1).getTime();
    let bCost = 0, bKwh = 0, hasData = false;
    costs.forEach(c => {
      const ts = new Date(c.start).getTime();
      if (ts >= bStart && ts < bEnd) {
        if (c.change != null) { bCost += c.change; hasData = true; }
        const kwh = energyMap.get(new Date(c.start).getTime());
        if (kwh != null) bKwh += kwh;
      }
    });
    if (hasData && bKwh > 0) buckets.push([bStart, parseFloat((bCost / bKwh).toFixed(3))]);
  }
  return buckets.sort((a, b) => a[0] - b[0]);
})();`;

const conditionalCumulativeChart = (devTarget, card) => ({
  type: "conditional",
  conditions: [
    { entity: `sensor.sbf2_${devTarget}_cost_rate_cumulative`, state_not: "unavailable" },
    { entity: `sensor.sbf2_${devTarget}_cost_rate_cumulative`, state_not: "unknown" },
  ],
  card,
});

const createDeviceRateChart = ({ devTarget, label, selectEntity, spanUnit, statsPeriod, mobileCutoff, desktopCutoff }) =>
  conditionalCumulativeChart(devTarget, {
    type: "custom:config-template-card",
    entities: [selectEntity],
    card: {
      type: "custom:apexcharts-card",
      graph_span: `\${states['${selectEntity}'].state + '${spanUnit}'}`,
      span: { end: "day" },
      header: { show: false, title: `${label} (EUR/kWh)` },
      apex_config: {
        ...staticOrConfigApexConfig(
          "EUR/kWh",
          [0.15, 0.3],
          `\${window.innerWidth < 600 ? parseInt(states['${selectEntity}'].state) <= ${mobileCutoff} : parseInt(states['${selectEntity}'].state) <= ${desktopCutoff}}`,
          EVAL_RATE_FORMATTER
        ),
        yaxis: {
          show: true,
          title: { text: "EUR/kWh" },
          decimalsInFloat: 2,
          labels: { formatter: EVAL_NUMERIC_FORMATTER },
        },
        tooltip: { enabled: true, y: { formatter: EVAL_RATE_TOOLTIP_FORMATTER } },
      },
      series: [
        {
          entity: `sensor.sbf2_${devTarget}_cost_rate_cumulative`,
          name: `${label} (EUR/kWh)`,
          color: "#f97316",
          type: "column",
          unit: " €/kWh",
          float_precision: 3,
          show: { datalabels: true },
          data_generator: deviceRateDataGen(devTarget, selectEntity, spanUnit, statsPeriod),
        },
      ],
    },
  });

const createDeviceYearlyRateChart = (devTarget, label) =>
  conditionalCumulativeChart(devTarget, {
    type: "custom:apexcharts-card",
    graph_span: "10y",
    span: { end: "year" },
    header: { show: false, title: `${label} (EUR/kWh)` },
    apex_config: {
      ...staticOrConfigApexConfig("EUR/kWh", [0.15, 0.3], true, EVAL_RATE_FORMATTER),
      yaxis: {
        show: true,
        title: { text: "EUR/kWh" },
        decimalsInFloat: 2,
        labels: { formatter: EVAL_NUMERIC_FORMATTER },
      },
      tooltip: { enabled: true, y: { formatter: EVAL_RATE_TOOLTIP_FORMATTER } },
    },
    series: [
      {
        entity: `sensor.sbf2_${devTarget}_cost_rate_cumulative`,
        name: `${label} (EUR/kWh)`,
        color: "#f97316",
        type: "column",
        unit: " €/kWh",
        float_precision: 3,
        show: { datalabels: true },
        group_by: { func: "last", duration: "1y" },
        data_generator: deviceYearlyRateDataGen(devTarget),
      },
    ],
  });

const deviceAllTimeRateDataGen = (devTarget, allTimePeriod = "month") =>
  `return (async () => {
  const costId = "sensor.sbf2_${devTarget}_cost_rate_cumulative", energyId = "sensor.sbf2_${devTarget}_energy_rate_cumulative";
  const end = new Date();
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  const res = await hass.callWS({
    type: 'recorder/statistics_during_period',
    start_time: tenYearsAgo.toISOString(),
    end_time: end.toISOString(),
    statistic_ids: [costId, energyId],
    period: '${allTimePeriod}'
  });
  const costs = res?.[costId] || [], energies = res?.[energyId] || [], energyMap = new Map();
  energies.forEach(e => {
    const ts = new Date(e.start).getTime();
    const val = e.state != null ? e.state : e.sum;
    if (val != null) energyMap.set(ts, val);
  });
  const buckets = [];
  costs.forEach(c => {
    const cStart = new Date(c.start).getTime();
    let kwh = energyMap.get(cStart);
    if (kwh == null) {
      let minDiff = 86400000;
      for (const [eStart, eVal] of energyMap.entries()) {
        const diff = Math.abs(cStart - eStart);
        if (diff < minDiff) { minDiff = diff; kwh = eVal; }
      }
    }
    const costVal = c.state != null ? c.state : c.sum;
    const val = (costVal != null && kwh != null && kwh > 0) ? parseFloat((costVal / kwh).toFixed(3)) : null;
    if (val !== null) buckets.push([cStart, val]);
  });
  const liveCost = parseFloat(hass.states[costId]?.state);
  const liveKwh = parseFloat(hass.states[energyId]?.state);
  if (!isNaN(liveCost) && !isNaN(liveKwh) && liveKwh > 0) {
    const liveRate = parseFloat((liveCost / liveKwh).toFixed(3));
    buckets.push([Date.now(), liveRate]);
  }
  return buckets.sort((a, b) => a[0] - b[0]);
})();`;

const createDeviceAllTimeRateChart = (devTarget, label, allTimeSpan = "10y", allTimePeriod = "month") =>
  conditionalCumulativeChart(devTarget, {
    type: "custom:apexcharts-card",
    graph_span: allTimeSpan,
    span: { end: "day" },
    header: { show: false, title: `${label} (EUR/kWh)` },
    apex_config: baseApexConfig("EUR/kWh", {
      stroke: { show: true, width: 1.5, colors: ["#f97316"] },
      dataLabels: { enabled: false },
      yaxis: {
        show: true,
        title: { text: "EUR/kWh" },
        decimalsInFloat: 2,
        labels: { formatter: EVAL_NUMERIC_FORMATTER },
      },
      tooltip: { enabled: true, y: { formatter: EVAL_RATE_TOOLTIP_FORMATTER } },
    }),
    series: [
      {
        entity: `sensor.sbf2_${devTarget}_cost_rate_cumulative`,
        name: `${label} (EUR/kWh)`,
        color: "#f97316",
        type: "area",
        unit: " €/kWh",
        float_precision: 3,
        show: { datalabels: false },
        data_generator: deviceAllTimeRateDataGen(devTarget, allTimePeriod),
      },
    ],
  });

const createDeviceCumulativeAreaChart = ({
  entityBase,
  name,
  yAxisTitle,
  color,
  unit = "",
  allTimeSpan = "10y",
  allTimePeriod = "month",
  t,
}) => ({
  type: "custom:apexcharts-card",
  graph_span: allTimeSpan,
  span: { end: "day" },
  header: { show: false, title: `${name} (${t.titleSuffix})` },
  apex_config: baseApexConfig(yAxisTitle, {
    stroke: { show: true, width: 1.5, colors: [color] },
    dataLabels: { enabled: false },
  }),
  series: [makeSeries(entityBase, name, color, t, unit, allTimePeriod)],
});

// ============================================================================
// 5. DEVICE SUBVIEWS BUILDER
// ============================================================================
const DEVICE_TABS = [
  { period: "Daily", suffix: "daily", sel: "select.sbf_chart_daily_days", unit: "d", stats: "day", chips: CHART_PERIOD_CHIPS.daily, costThresh: [0.5, 1.5], energyThresh: [2.0, 5.0], mCut: 7, dCut: 30 },
  { period: "Weekly", suffix: "weekly", sel: "select.sbf_chart_weekly_weeks", unit: "w", stats: "week", chips: CHART_PERIOD_CHIPS.weekly, costThresh: [3.5, 10.5], energyThresh: [14.0, 35.0], mCut: 8, dCut: 26 },
  { period: "Monthly", suffix: "monthly", sel: "select.sbf_chart_monthly_months", unit: "month", stats: "month", chips: CHART_PERIOD_CHIPS.monthly, costThresh: [15.0, 45.0], energyThresh: [60.0, 150.0], mCut: 6, dCut: 24 },
  { period: "Yearly", suffix: "yearly", titleSuffix: "Last 10 Years", costThresh: [182.5, 547.5], energyThresh: [730.0, 1825.0] },
  { period: "All-Time", suffix: "cumulative", titleSuffix: "All-Time", costThresh: [500.0, 1500.0], energyThresh: [2000.0, 5000.0] },
];

const createDeviceSubviewTab = (t, label, devTarget, allTimeSpan = "10y", allTimePeriod = "month") => {
  const isYearly = t.period === "Yearly";
  const isAllTime = t.period === "All-Time";
  const isStaticSpan = isYearly || isAllTime;
  const headerEntity = `sensor.sbf2_${devTarget}_cost_rate_${t.suffix}`;

  let costChart;
  let energyChart;
  let rateChart;

  if (isAllTime) {
    costChart = createDeviceCumulativeAreaChart({
      entityBase: `sensor.sbf2_${devTarget}_cost_rate`,
      name: label,
      yAxisTitle: "Cost (€)",
      color: "#0288d1",
      unit: " €",
      allTimeSpan,
      allTimePeriod,
      t,
    });
    energyChart = createDeviceCumulativeAreaChart({
      entityBase: `sensor.sbf2_${devTarget}_energy_rate`,
      name: `${label} (Energy)`,
      yAxisTitle: "Energy (kWh)",
      color: "#10b981",
      unit: " kWh",
      allTimeSpan,
      allTimePeriod,
      t,
    });
    rateChart = createDeviceAllTimeRateChart(devTarget, label, allTimeSpan, allTimePeriod);
  } else if (isYearly) {
    costChart = createYearlyStaticBarChart({
      entity: `sensor.sbf2_${devTarget}_cost_rate_cumulative`,
      name: `${label} (${t.titleSuffix})`,
      yAxisTitle: "Cost (€)",
      thresholds: t.costThresh,
    });
    energyChart = createYearlyStaticBarChart({
      entity: `sensor.sbf2_${devTarget}_energy_rate_cumulative`,
      name: `${label} (Energy)`,
      yAxisTitle: "Energy (kWh)",
      thresholds: t.energyThresh,
      unit: " kWh",
    });
    rateChart = createDeviceYearlyRateChart(devTarget, label);
  } else {
    costChart = createBarChartCard({
      entity: `sensor.sbf2_${devTarget}_cost_rate_cumulative`,
      name: label,
      yAxisTitle: "Cost (€)",
      selectEntity: t.sel,
      spanUnit: t.unit,
      statsPeriod: t.stats,
      thresholds: t.costThresh,
      mobileCutoff: t.mCut,
      desktopCutoff: t.dCut,
    });
    energyChart = createBarChartCard({
      entity: `sensor.sbf2_${devTarget}_energy_rate_cumulative`,
      name: `${label} (Energy)`,
      yAxisTitle: "Energy (kWh)",
      selectEntity: t.sel,
      spanUnit: t.unit,
      statsPeriod: t.stats,
      thresholds: t.energyThresh,
      mobileCutoff: t.mCut,
      desktopCutoff: t.dCut,
      unit: " kWh",
    });
    rateChart = createDeviceRateChart({
      devTarget,
      label,
      selectEntity: t.sel,
      spanUnit: t.unit,
      statsPeriod: t.stats,
      mobileCutoff: t.mCut,
      desktopCutoff: t.dCut,
    });
  }

  const cards = [
    subviewHeaderCard(headerEntity, label),
    createPeriodPills("select.sbf_financial_view_period", true),
    ...(isStaticSpan ? [] : [createChartChips(t.sel, t.chips)]),
    costChart,
    energyChart,
    rateChart,
  ];
  return conditionalVerticalStack(t.period, cards);
};

const buildDeviceSubview = (label, devTarget, allTimeSpan = "10y", allTimePeriod = "month") =>
  makePanelSubview(
    `${label} History`,
    `financials-${slugify(label)}`,
    DEVICE_TABS.map((t) => createDeviceSubviewTab(t, label, devTarget, allTimeSpan, allTimePeriod))
  );

// ============================================================================
// 6. SYSTEM SUBVIEWS BUILDER
// ============================================================================
const COST_THRESHOLDS = {
  daily: [0.5, 1.5],
  weekly: [3.5, 10.5],
  monthly: [15.0, 45.0],
  yearly: [182.5, 547.5],
  allTime: [500.0, 1500.0],
};

const SYSTEM_SUBVIEW_CONFIGS = [
  {
    title: "Total System Earnings",
    path: "financials-total-system-earnings",
    sensorKey: "system_earnings",
    stacked: true,
    getApexConfig: (dLabels) => ({
      chart: { stacked: true, height: 280, zoom: { enabled: false }, toolbar: { show: false } },
      stroke: { show: true, width: 1.5, colors: ["#ffc107", "#9c27b0"] },
      dataLabels: makeApexDataLabels(dLabels, EVAL_STACKED_EARNINGS_FORMATTER),
    }),
    getSeries: (t, allTimePeriod) => [
      makeSeries("sensor.sbf2_solar_only_earnings_rate", "Solar", "#ffc107", t, "", allTimePeriod),
      makeSeries("sensor.sbf2_battery_added_value_rate", "Battery", "#9c27b0", t, "", allTimePeriod),
    ],
  },
  {
    title: "Solar-Only Earnings",
    path: "financials-solar-only-earnings",
    sensorKey: "solar_only_earnings",
    getApexConfig: (dLabels) => ({
      stroke: { show: true, width: 1.5, colors: ["#ffc107"] },
      dataLabels: makeApexDataLabels(dLabels, EVAL_MONEY_FORMATTER),
    }),
    getSeries: (t, allTimePeriod) => [
      makeSeries("sensor.sbf2_solar_only_earnings_rate", "Solar-Only Earnings", "#ffc107", t, "", allTimePeriod),
    ],
  },
  {
    title: "Battery Added Value",
    path: "financials-battery-added-value",
    sensorKey: "battery_added_value",
    getApexConfig: (dLabels) => ({
      stroke: { show: true, width: 1.5, colors: ["#9c27b0"] },
      dataLabels: makeApexDataLabels(dLabels, EVAL_MONEY_FORMATTER),
    }),
    getSeries: (t, allTimePeriod) => [
      makeSeries("sensor.sbf2_battery_added_value_rate", "Battery Added Value", "#9c27b0", t, "", allTimePeriod),
    ],
  },
  {
    title: "Effective Cost",
    path: "financials-effective-cost",
    sensorKey: "total_system_cost",
    thresholds: COST_THRESHOLDS,
    getApexConfig: (dLabels, th = []) => ({
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "60%",
          dataLabels: { position: "top" },
          colors: { ranges: barColorRanges(th[0], th[1]) },
        },
      },
      dataLabels: makeApexDataLabels(dLabels, EVAL_MONEY_FORMATTER),
    }),
    getSeries: (t, allTimePeriod) => [
      makeSeries("sensor.sbf2_total_system_cost_rate", "Effective Cost", "#0288d1", t, "", allTimePeriod),
    ],
  },
  {
    title: "Net Bill",
    path: "financials-net-bill",
    sensorKey: "net_grid_cost",
    thresholds: COST_THRESHOLDS,
    getApexConfig: (dLabels, th = []) => ({
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "60%",
          dataLabels: { position: "top" },
          colors: { ranges: barColorRanges(th[0], th[1]) },
        },
      },
      dataLabels: makeApexDataLabels(dLabels, EVAL_MONEY_FORMATTER),
    }),
    getSeries: (t, allTimePeriod) => [
      makeSeries("sensor.sbf2_net_grid_cost_rate", "Net Bill", "#6366f1", t, "", allTimePeriod),
    ],
  },
];

const SYSTEM_TABS = [
  { period: "Daily", suffix: "daily", sel: "select.sbf_chart_daily_days", unit: "d", stats: "day", chips: CHART_PERIOD_CHIPS.daily, mCut: 7, dCut: 30, thKey: "daily" },
  { period: "Weekly", suffix: "weekly", sel: "select.sbf_chart_weekly_weeks", unit: "w", stats: "week", chips: CHART_PERIOD_CHIPS.weekly, mCut: 8, dCut: 26, thKey: "weekly" },
  { period: "Monthly", suffix: "monthly", sel: "select.sbf_chart_monthly_months", unit: "month", stats: "month", chips: CHART_PERIOD_CHIPS.monthly, mCut: 6, dCut: 24, thKey: "monthly" },
  { period: "Yearly", suffix: "yearly", titleSuffix: "Last 10 Years", thKey: "yearly" },
  { period: "All-Time", suffix: "cumulative", titleSuffix: "All-Time", thKey: "allTime" },
];

const createSystemSubviewTab = (t, cfg, th, allTimeSpan = "10y", allTimePeriod = "month") => {
  const isYearly = t.period === "Yearly";
  const isAllTime = t.period === "All-Time";
  const isStaticSpan = isYearly || isAllTime;

  const dLabels = isAllTime
    ? false
    : isYearly
    ? true
    : `\${window.innerWidth < 600 ? parseInt(states['${t.sel}'].state) <= ${t.mCut || 0} : parseInt(states['${t.sel}'].state) <= ${t.dCut || 0}}`;
  const apexExtra = cfg.getApexConfig(dLabels, th[t.thKey]);
  const series = cfg.getSeries(t, allTimePeriod);

  const chartCard = isStaticSpan
    ? {
        type: "custom:apexcharts-card",
        ...(cfg.stacked ? { stacked: true } : {}),
        graph_span: isAllTime ? allTimeSpan : "10y",
        span: { end: isAllTime ? "day" : "year" },
        header: { show: false, title: `${cfg.title} (${t.titleSuffix})` },
        apex_config: { ...baseApexConfig(cfg.title), ...apexExtra },
        series,
      }
    : {
        type: "custom:config-template-card",
        entities: [t.sel],
        card: {
          type: "custom:apexcharts-card",
          ...(cfg.stacked ? { stacked: true } : {}),
          graph_span: `\${states['${t.sel}'].state + '${t.unit}'}`,
          span: { end: "day" },
          header: { show: false, title: cfg.title },
          apex_config: { ...baseApexConfig(cfg.title), ...apexExtra },
          series,
        },
      };

  const cards = [
    subviewHeaderCard(`sensor.sbf2_${cfg.sensorKey}_rate_${t.suffix}`, cfg.title),
    createPeriodPills("select.sbf_financial_view_period", true),
    ...(isStaticSpan ? [] : [createChartChips(t.sel, t.chips)]),
    chartCard,
  ];

  return conditionalVerticalStack(t.period, cards);
};

const buildSystemSubviews = (allTimeSpan = "10y", allTimePeriod = "month") =>
  SYSTEM_SUBVIEW_CONFIGS.map((cfg) => {
    const th = cfg.thresholds || {};
    return makePanelSubview(
      `${cfg.title} History`,
      cfg.path,
      SYSTEM_TABS.map((t) => createSystemSubviewTab(t, cfg, th, allTimeSpan, allTimePeriod))
    );
  });

// ============================================================================
// 7. TOP-LEVEL VIEWS (POWER & FINANCIALS)
// ============================================================================
/**
 * Builds the top-level Power flow view with status cards and individual device breakdowns.
 * @param {Object} opts
 * @param {string} opts.prefix - Entity ID prefix (e.g. "sensor.sbf2_")
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

    const t1 = batSensor.replace("_power", "_temperature");
    const t2 = batSensor.replace("_battery_power", "_battery_temperature");
    if (states[t1]) tempSensor = t1;
    else if (states[t2]) tempSensor = t2;
  }

  const makeBreakdownCard = (entityId, label, slug) => ({
    type: "custom:mushroom-template-card",
    entity: entityId,
    primary: label,
    secondary: `{{ states('${entityId}') | float(0) | round(0) }} W`,
    icon: getSmartIcon(label, entityId, states),
    icon_color: `{% set p = states('${entityId}') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}`,
    layout: "horizontal",
    fill_container: true,
    tap_action: { action: "navigate", navigation_path: `${dashUrl}/power-${slug}` },
    card_mod: { style: STYLES.transparentCard },
  });

  const getDevLabel = (dev) => names[dev] || dev.replace("sensor.", "").replace("_power", "").replace("_", " ");

  const trackedCards = [
    ...mainDevs.map((dev) => makeBreakdownCard(dev, getDevLabel(dev), slugify(getDevLabel(dev)))),
    makeBreakdownCard(untrackedSensor, "Untracked", "untracked"),
  ];

  const subsetCards = subDevs.map((dev) => makeBreakdownCard(dev, getDevLabel(dev), slugify(getDevLabel(dev))));

  const flowIndividuals = [
    ...mainDevs.map((dev) => ({
      entity: dev,
      name: getDevLabel(dev),
      icon: getSmartIcon(getDevLabel(dev), dev, states),
      secondary_info: {},
    })),
    { entity: untrackedSensor, name: "Untracked", icon: "mdi:help-network-outline", secondary_info: {} },
  ];

  const statusCards = [
    makeMushroomTemplateCard({
      entity: `${prefix}system_earnings_rate_daily`,
      primary:
        `{% set sol = states('${prefix}solar_only_earnings_rate_daily') | float(0) | round(2) %} {% set bat = states('${prefix}battery_added_value_rate_daily') | float(0) | round(2) %} {% set tot = states('${prefix}system_earnings_rate_daily') | float(0) | round(2) %} {{ tot }} / {{ sol }} / {{ bat }}`,
      secondary: "Daily Earnings",
      icon: "mdi:finance",
      icon_color: "green",
      multiline: false,
    }),
    ...(priceSensor ? [{ type: "custom:mushroom-entity-card", entity: priceSensor, name: "Price", icon: "mdi:cash", icon_color: "amber", layout: "vertical", primary_info: "state", secondary_info: "name" }] : []),
    ...(tempSensor ? [{ type: "custom:mushroom-entity-card", entity: tempSensor, name: "Battery Temp", icon: "mdi:thermometer", icon_color: "orange", layout: "vertical", primary_info: "state", secondary_info: "name" }] : []),
  ];

  return {
    type: "sections",
    max_columns: 3,
    title: "Power",
    path: "power",
    sections: [
      {
        type: "grid",
        cards: [
          { type: "heading", heading: "Power flow", heading_style: "title" },
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
          grid3Cols(statusCards),
        ],
      },
      {
        type: "grid",
        cards: [
          { type: "heading", heading: "Main devices", icon: "mdi:domain" },
          stackGridCards(trackedCards),
          { type: "heading", heading: "Subset Devices", icon: "mdi:devices" },
          stackGridCards(subsetCards),
        ],
      },
    ],
  };
};

const FIN_PERIODS = [
  { state: "Daily", suffix: "daily", mult: 1 },
  { state: "Weekly", suffix: "weekly", mult: 7 },
  { state: "Monthly", suffix: "monthly", mult: 30 },
  { state: "Yearly", suffix: "yearly", mult: 365 },
  { state: "All-Time", suffix: "cumulative", mult: 365 },
];

/**
 * Builds the top-level Financials view across periods (Daily/Weekly/Monthly/Yearly/All-Time).
 * @param {Object} opts
 * @param {string[]} opts.mainDevs - Filtered main tracked device entity IDs
 * @param {string[]} opts.subDevs - Subset device entity IDs
 * @param {string[]} opts.tracked - All tracked device entity IDs
 * @param {Object} opts.states - Full hass.states dictionary
 * @param {Object} opts.names - Device entity ID → friendly name mapping
 * @param {string} opts.prefix - Entity ID prefix (e.g. "sensor.sbf2_")
 * @param {string} opts.untrackedSensor - Entity ID for untracked power
 * @param {string} opts.dashUrl - Current dashboard base URL
 */
const buildFinancialsView = ({ mainDevs, subDevs, tracked, states, names, prefix, untrackedSensor, dashUrl }) => {
  const mainCardsByPeriod = {};
  const subsetCardsByPeriod = {};

  FIN_PERIODS.forEach((p) => {
    const low = 0.5 * p.mult;
    const high = 1.5 * p.mult;
    const makeFinCard = (dev) => {
      const meta = getDevInfo(dev, tracked, states, names, prefix, untrackedSensor);
      return makeDeviceFinCard({
        devName: meta.label,
        devTarget: meta.devTarget,
        devId: dev,
        suffix: p.suffix,
        lowThresh: low,
        highThresh: high,
        dashUrl,
        states,
      });
    };

    mainCardsByPeriod[p.state] = [
      ...mainDevs.map(makeFinCard),
      makeDeviceFinCard({
        devName: "Untracked",
        devTarget: "untracked",
        devId: untrackedSensor,
        suffix: p.suffix,
        lowThresh: low,
        highThresh: high,
        dashUrl,
        states,
      }),
    ];
    subsetCardsByPeriod[p.state] = subDevs.map(makeFinCard);
  });

  return {
    type: "sections",
    max_columns: 2,
    title: "Financials",
    path: "financials",
    sections: [
      {
        type: "grid",
        cards: [
          createPeriodPills("select.sbf_financial_view_period"),
          ...FIN_PERIODS.map((p) => createFinancialsConditional(p.state, p.suffix, dashUrl)),
        ],
      },
      {
        type: "grid",
        cards: FIN_PERIODS.map((p) =>
          createDeviceSection(p.state, p.suffix, mainCardsByPeriod[p.state], subsetCardsByPeriod[p.state])
        ),
      },
    ],
  };
};

// ============================================================================
// 8. UTILITIES, STRATEGY CLASS & REGISTRATION
// ============================================================================
const getPrefix = (states) => {
  if (!states) return "sensor.sbf2_";
  const sample = Object.keys(states).find((id) => id.endsWith("_system_earnings_rate_daily"));
  return sample ? sample.split("_system_earnings_rate_daily")[0] + "_" : "sensor.sbf2_";
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
 * @param {string[]} tracked - Tracked devices list from total_power_consumption
 * @param {Object} states - Full hass.states dictionary
 * @param {Object} names - Custom name mappings
 * @param {string} prefix - Entity ID prefix
 * @param {string} untrackedSensor - Entity ID for untracked power
 * @returns {{ label: string, devTarget: string }}
 */
const getDevInfo = (devId, tracked, states, names, prefix, untrackedSensor) => {
  let label = names[devId] || states[devId]?.attributes?.friendly_name;
  let devTarget = null;

  const costEntity = tracked.find((e) => states[e]?.attributes?.source_entity_id === devId);
  if (costEntity) {
    const prefixFull = prefix.startsWith("sensor.") ? prefix : "sensor." + prefix;
    if (costEntity.startsWith(prefixFull) && costEntity.endsWith("_cost_rate_daily")) {
      devTarget = costEntity.substring(prefixFull.length, costEntity.length - 16);
    }
    if (!label && states[costEntity]?.attributes?.friendly_name) {
      let fn = states[costEntity].attributes.friendly_name;
      [" Cost Rate", " Cost Cumulative", " Cost Daily"].forEach((s) => {
        if (fn.endsWith(s)) fn = fn.substring(0, fn.length - s.length);
      });
      label = fn;
    }
  }

  label = label || devId.replace("sensor.", "").replace(/_power/g, "").replace(/_/g, " ");
  devTarget = devTarget || (devId === untrackedSensor ? "untracked" : "dev_" + slugify(label, "_"));
  return { label, devTarget };
};

const buildPowerSubview = (entityId, label, slug) =>
  makePanelSubview(`${label} Power`, `power-${slug}`, [
    subviewHeaderCard(entityId, `${label} Power`, true),
    createChartChips("select.sbf_power_chart_days", POWER_CHIPS),
    {
      type: "custom:config-template-card",
      entities: ["select.sbf_power_chart_days"],
      card: {
        type: "custom:apexcharts-card",
        graph_span: `\${(states['select.sbf_power_chart_days'] && states['select.sbf_power_chart_days'].state && !isNaN(parseInt(states['select.sbf_power_chart_days'].state)) ? states['select.sbf_power_chart_days'].state : '7') + 'd'}`,
        header: { show: false },
        apex_config: {
          chart: { height: 360, toolbar: { show: false }, zoom: { enabled: false } },
          fill: { type: "solid", opacity: 0.15 },
          stroke: { show: true, width: 2, curve: "straight" },
          grid: { borderColor: "rgba(128, 128, 128, 0.2)", strokeDashArray: 2 },
          tooltip: { enabled: true, x: { format: "dd MMM, HH:mm" } },
          xaxis: { type: "datetime", tooltip: { enabled: false } },
        },
        series: [
          {
            entity: entityId,
            name: label,
            color: "#008FFB",
            type: "area",
            unit: "W",
            show: { datalabels: false },
            statistics: {
              type: "mean",
              period:
                "${(() => { let d = (states['select.sbf_power_chart_days'] && !isNaN(parseInt(states['select.sbf_power_chart_days'].state)) ? parseInt(states['select.sbf_power_chart_days'].state) : 7); return d <= 3 ? '5minute' : 'hour'; })()}",
            },
          },
        ],
      },
    },
  ]);

class SbfDashboardStrategy extends HTMLElement {
  static async generateDashboard(info) {
    const states = info.hass ? info.hass.states : {};
    const prefix = getPrefix(states);
    const parts = window.location.pathname.split("/");
    const dashUrl = parts.length > 1 && parts[1] !== "" ? "/" + parts[1] : "";

    let dynamicAllTimeSpan = "10y";
    let dynamicAllTimePeriod = "month";
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
          const allTimeDays = Math.ceil((Date.now() - earliestTs) / (1000 * 60 * 60 * 24));
          if (allTimeDays > 0) {
            dynamicAllTimeSpan = `${allTimeDays + 2}d`;
            dynamicAllTimePeriod = allTimeDays <= 365 ? "day" : "month";
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
    const finView = buildFinancialsView({ mainDevs, subDevs, tracked, states, names, prefix, untrackedSensor, dashUrl });

    const powerSubviews = allDevs.map((dev) => {
      const label = dev === untrackedSensor ? "Untracked" : names[dev] || dev.replace("sensor.", "").replace("_power", "").replace("_", " ");
      return buildPowerSubview(dev, label, slugify(label));
    });

    const deviceSubviews = allDevs.map((dev) => {
      const meta = getDevInfo(dev, tracked, states, names, prefix, untrackedSensor);
      const label = dev === untrackedSensor ? "Untracked" : meta.label;
      const devTarget = dev === untrackedSensor ? "untracked" : meta.devTarget;
      return buildDeviceSubview(label, devTarget, dynamicAllTimeSpan, dynamicAllTimePeriod);
    });

    const systemSubviews = buildSystemSubviews(dynamicAllTimeSpan, dynamicAllTimePeriod);

    let allViews = [powerView, finView, ...powerSubviews, ...deviceSubviews, ...systemSubviews];

    if (prefix !== "sensor.sbf2_") {
      let str = JSON.stringify(allViews);
      str = str.replaceAll("sensor.sbf2_", prefix);
      allViews = JSON.parse(str);
    }

    return { views: allViews };
  }
}

const safeDefine = (tag, baseClass) => {
  if (typeof customElements !== "undefined" && !customElements.get(tag)) {
    customElements.define(tag, class extends baseClass { });
  }
};

[
  "ll-strategy-solar-battery-financials",
  "ll-strategy-sbf",
  "ll-strategy-dashboard-solar-battery-financials",
  "ll-strategy-view-solar-battery-financials",
  "ll-strategy-dashboard-custom-solar-battery-financials",
  "ll-strategy-view-custom-solar-battery-financials",
].forEach((tag) => safeDefine(tag, SbfDashboardStrategy));
