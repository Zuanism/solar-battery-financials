/**
 * Lovelace Dashboard Strategy for Solar & Battery Financials
 * EXACT 1:1 Golden Reference Clone (Generated from dashboard_view.yaml)
 */
console.info("⚡ SBF Strategy JS loaded (v5.8 Period Fix)");
const GOLDEN_VIEWS = [
  {
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
                entity: "sensor.deye_inverter_battery_power",
                state_of_charge: "sensor.deye_inverter_battery",
                show_state_of_charge: true,
                state_of_charge_unit_white_space: true,
              },
              grid: {
                entity: "sensor.p1_meter_3c39e72e7916_active_power",
                secondary_info: {},
              },
              solar: {
                display_zero_state: true,
                secondary_info: {},
                entity: "sensor.pv_power",
              },
              fossil_fuel_percentage: { secondary_info: {} },
              home: {
                entity: "sensor.sbf2_total_power_consumption",
                secondary_info: {},
              },
              individual: [
                {
                  entity: "sensor.flow_charger_power",
                  name: "Charger",
                  icon: "mdi:ev-station",
                  secondary_info: {},
                },
                {
                  entity: "sensor.flow_untracked_power",
                  name: "Untracked",
                  icon: "mdi:help-network-outline",
                  secondary_info: {},
                },
                {
                  entity: "sensor.flow_liv_bedrooms_power",
                  name: "Liv/bedrooms",
                  secondary_info: {},
                },
                {
                  entity: "sensor.flow_washing_machine_power",
                  name: "Washing machine",
                  secondary_info: {},
                },
                {
                  entity: "sensor.flow_dishwasher_power",
                  name: "Dishwasher",
                  secondary_info: {},
                },
                {
                  entity: "sensor.flow_attic_tv_power",
                  name: "Attic+TV",
                  secondary_info: {},
                },
                {
                  entity: "sensor.flow_kitchen_power",
                  name: "Template Device",
                  secondary_info: {},
                },
              ],
            },
            clickable_entities: true,
            display_zero_lines: {
              mode: "show",
              transparency: 50,
              grey_color: [189, 189, 189],
            },
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
            type: "grid",
            columns: 3,
            square: false,
            card_mod: {
              style:
                ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
            },
            cards: [
              {
                type: "custom:mushroom-template-card",
                entity: "sensor.sbf2_system_earnings_rate_daily",
                primary:
                  "{% set sol = states('sensor.sbf2_solar_only_earnings_rate_daily') | float(0) | round(2) %} {% set bat = states('sensor.sbf2_battery_added_value_rate_daily') | float(0) | round(2) %} {% set tot = states('sensor.sbf2_system_earnings_rate_daily') | float(0) | round(2) %} {{ tot }} / {{ sol }} / {{ bat }}",
                secondary: "Daily Earnings",
                icon: "mdi:finance",
                icon_color: "green",
                layout: "vertical",
                multiline_secondary: false,
              },
              {
                type: "custom:mushroom-entity-card",
                entity: "sensor.my_price_sensor",
                name: "Price",
                icon: "mdi:cash",
                icon_color: "amber",
                layout: "vertical",
                primary_info: "state",
                secondary_info: "name",
              },
              {
                type: "custom:mushroom-entity-card",
                entity: "sensor.deye_inverter_battery_temperature",
                name: "Battery Temp",
                icon: "mdi:thermometer",
                icon_color: "orange",
                layout: "vertical",
                primary_info: "state",
                secondary_info: "name",
              },
            ],
          },
        ],
      },
      {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Electricity Groups",
            icon: "mdi:domain",
          },
          {
            type: "custom:stack-in-card",
            cards: [
              {
                type: "grid",
                columns: 2,
                square: false,
                card_mod: {
                  style:
                    ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                },
                cards: [
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.shelly_grote_slaapkamers_woonkamer_power",
                    primary: "Living & bedrooms",
                    secondary:
                      "{{ states('sensor.shelly_grote_slaapkamers_woonkamer_power') | float(0) | round(0) }} W",
                    icon: "mdi:sofa",
                    icon_color:
                      "{% set p = states('sensor.shelly_grote_slaapkamers_woonkamer_power') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.shelly_keuken_power",
                    primary: "Template Device",
                    secondary:
                      "{{ states('sensor.shelly_keuken_power') | float(0) | round(0) }} W",
                    icon: "mdi:countertop",
                    icon_color:
                      "{% set p = states('sensor.shelly_keuken_power') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.shelly_vaatwasser_power",
                    primary: "Dishwasher",
                    secondary:
                      "{{ states('sensor.shelly_vaatwasser_power') | float(0) | round(0) }} W",
                    icon: "mdi:dishwasher",
                    icon_color:
                      "{% set p = states('sensor.shelly_vaatwasser_power') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.shelly_wasmachine_power",
                    primary: "Washing machine",
                    secondary:
                      "{{ states('sensor.shelly_wasmachine_power') | float(0) | round(0) }} W",
                    icon: "mdi:washing-machine",
                    icon_color:
                      "{% set p = states('sensor.shelly_wasmachine_power') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.shelly_zolder_en_kleine_slaapkamer_power",
                    primary: "Attic & TV",
                    secondary:
                      "{{ states('sensor.shelly_zolder_en_kleine_slaapkamer_power') | float(0) | round(0) }} W",
                    icon: "mdi:home-roof",
                    icon_color:
                      "{% set p = states('sensor.shelly_zolder_en_kleine_slaapkamer_power') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.myenergi_charger_power_charging",
                    primary: "Charger",
                    secondary:
                      "{{ states('sensor.myenergi_charger_power_charging') | float(0) | round(0) }} W",
                    icon: "mdi:ev-station",
                    icon_color:
                      "{% set p = states('sensor.myenergi_charger_power_charging') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.sbf2_untracked_power",
                    primary: "Untracked",
                    secondary:
                      "{{ states('sensor.sbf2_untracked_power') | float(0) | round(0) }} W",
                    icon: "mdi:help-network-outline",
                    icon_color:
                      "{% set p = states('sensor.sbf2_untracked_power') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                ],
              },
            ],
          },
          { type: "heading", heading: "Subset Devices", icon: "mdi:devices" },
          {
            type: "custom:stack-in-card",
            cards: [
              {
                type: "grid",
                columns: 2,
                square: false,
                card_mod: {
                  style:
                    ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                },
                cards: [
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.shelly_attic_switch_0_power",
                    primary: "Attic",
                    secondary:
                      "{{ states('sensor.shelly_attic_switch_0_power') | float(0) | round(0) }} W",
                    icon: "mdi:home-roof",
                    icon_color:
                      "{% set p = states('sensor.shelly_attic_switch_0_power') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.airco_power_average",
                    primary: "Airco",
                    secondary:
                      "{{ states('sensor.airco_power_average') | float(0) | round(0) }} W",
                    icon: "mdi:air-conditioner",
                    icon_color:
                      "{% set p = states('sensor.airco_power_average') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.all_lights_power",
                    primary: "All Lights",
                    secondary:
                      "{{ states('sensor.all_lights_power') | float(0) | round(0) }} W",
                    icon: "mdi:lightbulb-group",
                    icon_color:
                      "{% set p = states('sensor.all_lights_power') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.shelly_couch_switch_0_power",
                    primary: "Floor heating",
                    secondary:
                      "{{ states('sensor.shelly_couch_switch_0_power') | float(0) | round(0) }} W",
                    icon: "mdi:heating-coil",
                    icon_color:
                      "{% set p = states('sensor.shelly_couch_switch_0_power') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.shelly_office_switch_0_power",
                    primary: "Office",
                    secondary:
                      "{{ states('sensor.shelly_office_switch_0_power') | float(0) | round(0) }} W",
                    icon: "mdi:desk",
                    icon_color:
                      "{% set p = states('sensor.shelly_office_switch_0_power') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                  {
                    type: "custom:mushroom-template-card",
                    entity: "sensor.shelly_tv_switch_0_power",
                    primary: "TV",
                    secondary:
                      "{{ states('sensor.shelly_tv_switch_0_power') | float(0) | round(0) }} W",
                    icon: "mdi:television",
                    icon_color:
                      "{% set p = states('sensor.shelly_tv_switch_0_power') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}",
                    layout: "horizontal",
                    fill_container: true,
                    card_mod: {
                      style:
                        "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "sections",
    max_columns: 2,
    title: "Financials",
    path: "financials",
    sections: [
      {
        type: "grid",
        cards: [
          {
            type: "custom:mushroom-chips-card",
            alignment: "center",
            card_mod: {
              style:
                "ha-card {\n  background: rgba(var(--rgb-primary-text-color), 0.05);\n  border-radius: 24px;\n  padding: 4px;\n  margin: 0 auto;\n  width: fit-content;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n",
            },
            chips: [
              {
                type: "template",
                content: "Daily",
                card_mod: {
                  style:
                    "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.financial_view_period', 'Daily') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.financial_view_period', 'Daily') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.financial_view_period', 'Daily') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.financial_view_period', 'Daily') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                },
                tap_action: {
                  action: "call-service",
                  service: "input_select.select_option",
                  target: { entity_id: "input_select.financial_view_period" },
                  data: { option: "Daily" },
                },
              },
              {
                type: "template",
                content: "Weekly",
                card_mod: {
                  style:
                    "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.financial_view_period', 'Weekly') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.financial_view_period', 'Weekly') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.financial_view_period', 'Weekly') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.financial_view_period', 'Weekly') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                },
                tap_action: {
                  action: "call-service",
                  service: "input_select.select_option",
                  target: { entity_id: "input_select.financial_view_period" },
                  data: { option: "Weekly" },
                },
              },
              {
                type: "template",
                content: "Monthly",
                card_mod: {
                  style:
                    "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.financial_view_period', 'Monthly') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.financial_view_period', 'Monthly') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.financial_view_period', 'Monthly') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.financial_view_period', 'Monthly') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                },
                tap_action: {
                  action: "call-service",
                  service: "input_select.select_option",
                  target: { entity_id: "input_select.financial_view_period" },
                  data: { option: "Monthly" },
                },
              },
              {
                type: "template",
                content: "Yearly",
                card_mod: {
                  style:
                    "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.financial_view_period', 'Yearly') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.financial_view_period', 'Yearly') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.financial_view_period', 'Yearly') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.financial_view_period', 'Yearly') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                },
                tap_action: {
                  action: "call-service",
                  service: "input_select.select_option",
                  target: { entity_id: "input_select.financial_view_period" },
                  data: { option: "Yearly" },
                },
              },
              {
                type: "template",
                content: "All",
                card_mod: {
                  style:
                    "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.financial_view_period', 'All-Time') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.financial_view_period', 'All-Time') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.financial_view_period', 'All-Time') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.financial_view_period', 'All-Time') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                },
                tap_action: {
                  action: "call-service",
                  service: "input_select.select_option",
                  target: { entity_id: "input_select.financial_view_period" },
                  data: { option: "All-Time" },
                },
              },
            ],
          },
          {
            type: "conditional",
            conditions: [
              { entity: "input_select.financial_view_period", state: "Daily" },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "heading",
                  heading: "Earnings",
                  icon: "mdi:piggy-bank",
                },
                {
                  type: "grid",
                  columns: 3,
                  square: false,
                  card_mod: {
                    style:
                      ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
                  },
                  cards: [
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_system_earnings_rate_daily",
                      primary:
                        "{{ states('sensor.sbf2_system_earnings_rate_daily') | float(0) | round(2) }} \u20ac",
                      secondary: "Total",
                      icon: "mdi:finance",
                      icon_color: "green",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-total-system-earnings",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_solar_only_earnings_rate_daily",
                      primary:
                        "{{ states('sensor.sbf2_solar_only_earnings_rate_daily') | float(0) | round(2) }} \u20ac",
                      secondary: "Solar Only",
                      icon: "mdi:solar-power",
                      icon_color: "amber",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-solar-only-earnings",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_battery_added_value_rate_daily",
                      primary:
                        "{{ states('sensor.sbf2_battery_added_value_rate_daily') | float(0) | round(2) }} \u20ac",
                      secondary: "Battery Val",
                      icon: "mdi:battery-arrow-up",
                      icon_color: "purple",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-battery-added-value",
                      },
                    },
                  ],
                },
                {
                  type: "heading",
                  heading: "Total House Costs",
                  icon: "mdi:home-lightning-bolt",
                },
                {
                  type: "grid",
                  columns: 3,
                  square: false,
                  card_mod: {
                    style:
                      ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
                  },
                  cards: [
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_total_system_cost_rate_daily",
                      primary:
                        "{% set cost = states('sensor.sbf2_total_system_cost_rate_daily')|float(0) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set cost = states('sensor.sbf2_total_system_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_total_system_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Effective{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:currency-eur",
                      icon_color: "amber",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-effective-cost",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_total_system_energy_rate_daily",
                      primary:
                        "{% set net = states('sensor.sbf2_net_grid_cost_rate_daily')|float(0) %} {% set earn = states('sensor.sbf2_system_earnings_rate_daily')|float(0) %} {% set cost = (net + earn) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set net = states('sensor.sbf2_net_grid_cost_rate_daily')|float(0) %} {% set earn = states('sensor.sbf2_system_earnings_rate_daily')|float(0) %} {% set cost = (net + earn) %} {% set kwh = states('sensor.sbf2_total_system_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Gross{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:cash-remove",
                      icon_color: "red",
                      layout: "vertical",
                      multiline_secondary: true,
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_net_grid_cost_rate_daily",
                      primary:
                        "{% set cost = states('sensor.sbf2_net_grid_cost_rate_daily')|float(0) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set cost = states('sensor.sbf2_net_grid_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_net_grid_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Net Bill{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:receipt-text-check",
                      icon_color: "green",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-net-bill",
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            type: "conditional",
            conditions: [
              { entity: "input_select.financial_view_period", state: "Weekly" },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "heading",
                  heading: "Earnings",
                  icon: "mdi:piggy-bank",
                },
                {
                  type: "grid",
                  columns: 3,
                  square: false,
                  card_mod: {
                    style:
                      ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
                  },
                  cards: [
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_system_earnings_rate_weekly",
                      primary:
                        "{{ states('sensor.sbf2_system_earnings_rate_weekly') | float(0) | round(2) }} \u20ac",
                      secondary: "Total",
                      icon: "mdi:finance",
                      icon_color: "green",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-total-system-earnings",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_solar_only_earnings_rate_weekly",
                      primary:
                        "{{ states('sensor.sbf2_solar_only_earnings_rate_weekly') | float(0) | round(2) }} \u20ac",
                      secondary: "Solar Only",
                      icon: "mdi:solar-power",
                      icon_color: "amber",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-solar-only-earnings",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_battery_added_value_rate_weekly",
                      primary:
                        "{{ states('sensor.sbf2_battery_added_value_rate_weekly') | float(0) | round(2) }} \u20ac",
                      secondary: "Battery Val",
                      icon: "mdi:battery-arrow-up",
                      icon_color: "purple",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-battery-added-value",
                      },
                    },
                  ],
                },
                {
                  type: "heading",
                  heading: "Total House Costs",
                  icon: "mdi:home-lightning-bolt",
                },
                {
                  type: "grid",
                  columns: 3,
                  square: false,
                  card_mod: {
                    style:
                      ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
                  },
                  cards: [
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_total_system_cost_rate_weekly",
                      primary:
                        "{% set cost = states('sensor.sbf2_total_system_cost_rate_weekly')|float(0) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set cost = states('sensor.sbf2_total_system_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_total_system_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Effective{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:currency-eur",
                      icon_color: "amber",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-effective-cost",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_total_system_energy_rate_weekly",
                      primary:
                        "{% set net = states('sensor.sbf2_net_grid_cost_rate_weekly')|float(0) %} {% set earn = states('sensor.sbf2_system_earnings_rate_weekly')|float(0) %} {% set cost = (net + earn) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set net = states('sensor.sbf2_net_grid_cost_rate_weekly')|float(0) %} {% set earn = states('sensor.sbf2_system_earnings_rate_weekly')|float(0) %} {% set cost = (net + earn) %} {% set kwh = states('sensor.sbf2_total_system_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Gross{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:cash-remove",
                      icon_color: "red",
                      layout: "vertical",
                      multiline_secondary: true,
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_net_grid_cost_rate_weekly",
                      primary:
                        "{% set cost = states('sensor.sbf2_net_grid_cost_rate_weekly')|float(0) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set cost = states('sensor.sbf2_net_grid_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_net_grid_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Net Bill{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:receipt-text-check",
                      icon_color: "green",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-net-bill",
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            type: "conditional",
            conditions: [
              {
                entity: "input_select.financial_view_period",
                state: "Monthly",
              },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "heading",
                  heading: "Earnings",
                  icon: "mdi:piggy-bank",
                },
                {
                  type: "grid",
                  columns: 3,
                  square: false,
                  card_mod: {
                    style:
                      ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
                  },
                  cards: [
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_system_earnings_rate_monthly",
                      primary:
                        "{{ states('sensor.sbf2_system_earnings_rate_monthly') | float(0) | round(2) }} \u20ac",
                      secondary: "Total",
                      icon: "mdi:finance",
                      icon_color: "green",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-total-system-earnings",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_solar_only_earnings_rate_monthly",
                      primary:
                        "{{ states('sensor.sbf2_solar_only_earnings_rate_monthly') | float(0) | round(2) }} \u20ac",
                      secondary: "Solar Only",
                      icon: "mdi:solar-power",
                      icon_color: "amber",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-solar-only-earnings",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_battery_added_value_rate_monthly",
                      primary:
                        "{{ states('sensor.sbf2_battery_added_value_rate_monthly') | float(0) | round(2) }} \u20ac",
                      secondary: "Battery Val",
                      icon: "mdi:battery-arrow-up",
                      icon_color: "purple",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-battery-added-value",
                      },
                    },
                  ],
                },
                {
                  type: "heading",
                  heading: "Total House Costs",
                  icon: "mdi:home-lightning-bolt",
                },
                {
                  type: "grid",
                  columns: 3,
                  square: false,
                  card_mod: {
                    style:
                      ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
                  },
                  cards: [
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_total_system_cost_rate_monthly",
                      primary:
                        "{% set cost = states('sensor.sbf2_total_system_cost_rate_monthly')|float(0) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set cost = states('sensor.sbf2_total_system_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_total_system_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Effective{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:currency-eur",
                      icon_color: "amber",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-effective-cost",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_total_system_energy_rate_monthly",
                      primary:
                        "{% set net = states('sensor.sbf2_net_grid_cost_rate_monthly')|float(0) %} {% set earn = states('sensor.sbf2_system_earnings_rate_monthly')|float(0) %} {% set cost = (net + earn) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set net = states('sensor.sbf2_net_grid_cost_rate_monthly')|float(0) %} {% set earn = states('sensor.sbf2_system_earnings_rate_monthly')|float(0) %} {% set cost = (net + earn) %} {% set kwh = states('sensor.sbf2_total_system_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Gross{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:cash-remove",
                      icon_color: "red",
                      layout: "vertical",
                      multiline_secondary: true,
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_net_grid_cost_rate_monthly",
                      primary:
                        "{% set cost = states('sensor.sbf2_net_grid_cost_rate_monthly')|float(0) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set cost = states('sensor.sbf2_net_grid_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_net_grid_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Net Bill{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:receipt-text-check",
                      icon_color: "green",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-net-bill",
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            type: "conditional",
            conditions: [
              { entity: "input_select.financial_view_period", state: "Yearly" },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "heading",
                  heading: "Earnings",
                  icon: "mdi:piggy-bank",
                },
                {
                  type: "grid",
                  columns: 3,
                  square: false,
                  card_mod: {
                    style:
                      ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
                  },
                  cards: [
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_system_earnings_rate_yearly",
                      primary:
                        "{{ states('sensor.sbf2_system_earnings_rate_yearly') | float(0) | round(2) }} \u20ac",
                      secondary: "Total",
                      icon: "mdi:finance",
                      icon_color: "green",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-total-system-earnings",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_solar_only_earnings_rate_yearly",
                      primary:
                        "{{ states('sensor.sbf2_solar_only_earnings_rate_yearly') | float(0) | round(2) }} \u20ac",
                      secondary: "Solar Only",
                      icon: "mdi:solar-power",
                      icon_color: "amber",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-solar-only-earnings",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_battery_added_value_rate_yearly",
                      primary:
                        "{{ states('sensor.sbf2_battery_added_value_rate_yearly') | float(0) | round(2) }} \u20ac",
                      secondary: "Battery Val",
                      icon: "mdi:battery-arrow-up",
                      icon_color: "purple",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-battery-added-value",
                      },
                    },
                  ],
                },
                {
                  type: "heading",
                  heading: "Total House Costs",
                  icon: "mdi:home-lightning-bolt",
                },
                {
                  type: "grid",
                  columns: 3,
                  square: false,
                  card_mod: {
                    style:
                      ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
                  },
                  cards: [
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_total_system_cost_rate_yearly",
                      primary:
                        "{% set cost = states('sensor.sbf2_total_system_cost_rate_yearly')|float(0) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set cost = states('sensor.sbf2_total_system_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_total_system_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Effective{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:currency-eur",
                      icon_color: "amber",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-effective-cost",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_total_system_energy_rate_yearly",
                      primary:
                        "{% set net = states('sensor.sbf2_net_grid_cost_rate_yearly')|float(0) %} {% set earn = states('sensor.sbf2_system_earnings_rate_yearly')|float(0) %} {% set cost = (net + earn) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set net = states('sensor.sbf2_net_grid_cost_rate_yearly')|float(0) %} {% set earn = states('sensor.sbf2_system_earnings_rate_yearly')|float(0) %} {% set cost = (net + earn) %} {% set kwh = states('sensor.sbf2_total_system_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Gross{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:cash-remove",
                      icon_color: "red",
                      layout: "vertical",
                      multiline_secondary: true,
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_net_grid_cost_rate_yearly",
                      primary:
                        "{% set cost = states('sensor.sbf2_net_grid_cost_rate_yearly')|float(0) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set cost = states('sensor.sbf2_net_grid_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_net_grid_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Net Bill{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:receipt-text-check",
                      icon_color: "green",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-net-bill",
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            type: "conditional",
            conditions: [
              {
                entity: "input_select.financial_view_period",
                state: "All-Time",
              },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "heading",
                  heading: "Earnings",
                  icon: "mdi:piggy-bank",
                },
                {
                  type: "grid",
                  columns: 3,
                  square: false,
                  card_mod: {
                    style:
                      ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
                  },
                  cards: [
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_system_earnings_rate_cumulative",
                      primary:
                        "{{ states('sensor.sbf2_system_earnings_rate_cumulative') | float(0) | round(2) }} \u20ac",
                      secondary: "Total",
                      icon: "mdi:finance",
                      icon_color: "green",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-total-system-earnings",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_solar_only_earnings_rate_cumulative",
                      primary:
                        "{{ states('sensor.sbf2_solar_only_earnings_rate_cumulative') | float(0) | round(2) }} \u20ac",
                      secondary: "Solar Only",
                      icon: "mdi:solar-power",
                      icon_color: "amber",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-solar-only-earnings",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_battery_added_value_rate_cumulative",
                      primary:
                        "{{ states('sensor.sbf2_battery_added_value_rate_cumulative') | float(0) | round(2) }} \u20ac",
                      secondary: "Battery Val",
                      icon: "mdi:battery-arrow-up",
                      icon_color: "purple",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-battery-added-value",
                      },
                    },
                  ],
                },
                {
                  type: "heading",
                  heading: "Total House Costs",
                  icon: "mdi:home-lightning-bolt",
                },
                {
                  type: "grid",
                  columns: 3,
                  square: false,
                  card_mod: {
                    style:
                      ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  border: none !important;\n  margin: 0px !important;\n}\n",
                  },
                  cards: [
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_total_system_cost_rate_cumulative",
                      primary:
                        "{% set cost = states('sensor.sbf2_total_system_cost_rate_cumulative')|float(0) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set cost = states('sensor.sbf2_total_system_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_total_system_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Effective{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:currency-eur",
                      icon_color: "amber",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-effective-cost",
                      },
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_total_system_energy_rate_cumulative",
                      primary:
                        "{% set net = states('sensor.sbf2_net_grid_cost_rate_cumulative')|float(0) %} {% set earn = states('sensor.sbf2_system_earnings_rate_cumulative')|float(0) %} {% set cost = (net + earn) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set net = states('sensor.sbf2_net_grid_cost_rate_cumulative')|float(0) %} {% set earn = states('sensor.sbf2_system_earnings_rate_cumulative')|float(0) %} {% set cost = (net + earn) %} {% set kwh = states('sensor.sbf2_total_system_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Gross{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:cash-remove",
                      icon_color: "red",
                      layout: "vertical",
                      multiline_secondary: true,
                    },
                    {
                      type: "custom:mushroom-template-card",
                      entity: "sensor.sbf2_net_grid_cost_rate_cumulative",
                      primary:
                        "{% set cost = states('sensor.sbf2_net_grid_cost_rate_cumulative')|float(0) %} {{ cost | round(2) }} \u20ac",
                      secondary:
                        "{% set cost = states('sensor.sbf2_net_grid_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_net_grid_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(2) if kwh != 0 else 0 %} Net Bill{{ '\\n' }}{{ kwh | round(1) }} kWh @ \u20ac{{ avg }}",
                      icon: "mdi:receipt-text-check",
                      icon_color: "green",
                      layout: "vertical",
                      multiline_secondary: true,
                      tap_action: {
                        action: "navigate",
                        navigation_path:
                          "/lovelace-battery/financials-net-bill",
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        type: "grid",
        cards: [
          {
            type: "conditional",
            conditions: [
              { entity: "input_select.financial_view_period", state: "Daily" },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "heading",
                  heading: "Electricity Groups",
                  icon: "mdi:domain",
                },
                {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "grid",
                      columns: 2,
                      square: false,
                      card_mod: {
                        style:
                          ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                      },
                      cards: [
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_living_and_bedrooms_cost_rate_daily",
                          primary: "Living & bedrooms",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_living_and_bedrooms_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_living_and_bedrooms_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:sofa",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_living_and_bedrooms_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-living-bedrooms",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_template_device_cost_rate_daily",
                          primary: "Template Device",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_template_device_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_template_device_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:countertop",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_template_device_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-template_device",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_dishwasher_cost_rate_daily",
                          primary: "Dishwasher",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_dishwasher_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_dishwasher_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:dishwasher",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_dishwasher_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-dishwasher",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_washing_machine_cost_rate_daily",
                          primary: "Washing machine",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_washing_machine_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_washing_machine_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:washing-machine",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_washing_machine_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-washing-machine",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_attic_and_tv_cost_rate_daily",
                          primary: "Attic & TV",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_attic_and_tv_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_attic_and_tv_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:home-roof",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_attic_and_tv_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-attic-tv",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_charger_cost_rate_daily",
                          primary: "Charger",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_charger_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_charger_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:ev-station",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_charger_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-charger",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_untracked_cost_rate_daily",
                          primary: "Untracked",
                          secondary:
                            "{% set cost = states('sensor.sbf2_untracked_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_untracked_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:help-network-outline",
                          icon_color:
                            "{% set c = states('sensor.sbf2_untracked_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-untracked",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "heading",
                  heading: "Subset Devices",
                  icon: "mdi:devices",
                },
                {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "grid",
                      columns: 2,
                      square: false,
                      card_mod: {
                        style:
                          ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                      },
                      cards: [
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_attic_cost_rate_daily",
                          primary: "Attic",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_attic_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_attic_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:home-roof",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_attic_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-attic",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_airco_cost_rate_daily",
                          primary: "Airco",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_airco_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_airco_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:air-conditioner",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_airco_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-airco",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_all_lights_cost_rate_daily",
                          primary: "All Lights",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_all_lights_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_all_lights_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:lightbulb-group",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_all_lights_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-all-lights",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_floor_heating_cost_rate_daily",
                          primary: "Floor heating",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_floor_heating_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_floor_heating_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:heating-coil",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_floor_heating_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-floor-heating",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_office_cost_rate_daily",
                          primary: "Office",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_office_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_office_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:desk",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_office_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-office",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_tv_cost_rate_daily",
                          primary: "TV",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_tv_cost_rate_daily')|float(0) %} {% set kwh = states('sensor.sbf2_dev_tv_energy_rate_daily')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:television",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_tv_cost_rate_daily') | float(0) %} {% if c < 0.5 %} green {% elif c < 1.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path: "/lovelace-battery/financials-tv",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
          {
            type: "conditional",
            conditions: [
              { entity: "input_select.financial_view_period", state: "Weekly" },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "heading",
                  heading: "Electricity Groups",
                  icon: "mdi:domain",
                },
                {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "grid",
                      columns: 2,
                      square: false,
                      card_mod: {
                        style:
                          ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                      },
                      cards: [
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_living_and_bedrooms_cost_rate_weekly",
                          primary: "Living & bedrooms",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_living_and_bedrooms_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_living_and_bedrooms_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:sofa",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_living_and_bedrooms_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-living-bedrooms",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_template_device_cost_rate_weekly",
                          primary: "Template Device",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_template_device_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_template_device_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:countertop",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_template_device_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-template_device",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_dishwasher_cost_rate_weekly",
                          primary: "Dishwasher",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_dishwasher_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_dishwasher_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:dishwasher",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_dishwasher_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-dishwasher",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_washing_machine_cost_rate_weekly",
                          primary: "Washing machine",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_washing_machine_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_washing_machine_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:washing-machine",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_washing_machine_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-washing-machine",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_attic_and_tv_cost_rate_weekly",
                          primary: "Attic & TV",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_attic_and_tv_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_attic_and_tv_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:home-roof",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_attic_and_tv_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-attic-tv",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_charger_cost_rate_weekly",
                          primary: "Charger",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_charger_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_charger_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:ev-station",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_charger_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-charger",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_untracked_cost_rate_weekly",
                          primary: "Untracked",
                          secondary:
                            "{% set cost = states('sensor.sbf2_untracked_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_untracked_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:help-network-outline",
                          icon_color:
                            "{% set c = states('sensor.sbf2_untracked_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-untracked",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "heading",
                  heading: "Subset Devices",
                  icon: "mdi:devices",
                },
                {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "grid",
                      columns: 2,
                      square: false,
                      card_mod: {
                        style:
                          ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                      },
                      cards: [
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_attic_cost_rate_weekly",
                          primary: "Attic",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_attic_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_attic_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:home-roof",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_attic_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-attic",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_airco_cost_rate_weekly",
                          primary: "Airco",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_airco_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_airco_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:air-conditioner",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_airco_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-airco",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_all_lights_cost_rate_weekly",
                          primary: "All Lights",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_all_lights_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_all_lights_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:lightbulb-group",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_all_lights_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-all-lights",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_floor_heating_cost_rate_weekly",
                          primary: "Floor heating",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_floor_heating_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_floor_heating_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:heating-coil",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_floor_heating_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-floor-heating",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_office_cost_rate_weekly",
                          primary: "Office",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_office_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_office_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:desk",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_office_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-office",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_tv_cost_rate_weekly",
                          primary: "TV",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_tv_cost_rate_weekly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_tv_energy_rate_weekly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:television",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_tv_cost_rate_weekly') | float(0) %} {% if c < 3.5 %} green {% elif c < 10.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path: "/lovelace-battery/financials-tv",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
          {
            type: "conditional",
            conditions: [
              {
                entity: "input_select.financial_view_period",
                state: "Monthly",
              },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "heading",
                  heading: "Electricity Groups",
                  icon: "mdi:domain",
                },
                {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "grid",
                      columns: 2,
                      square: false,
                      card_mod: {
                        style:
                          ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                      },
                      cards: [
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_living_and_bedrooms_cost_rate_monthly",
                          primary: "Living & bedrooms",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_living_and_bedrooms_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_living_and_bedrooms_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:sofa",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_living_and_bedrooms_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-living-bedrooms",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_template_device_cost_rate_monthly",
                          primary: "Template Device",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_template_device_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_template_device_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:countertop",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_template_device_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-template_device",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_dishwasher_cost_rate_monthly",
                          primary: "Dishwasher",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_dishwasher_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_dishwasher_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:dishwasher",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_dishwasher_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-dishwasher",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_washing_machine_cost_rate_monthly",
                          primary: "Washing machine",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_washing_machine_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_washing_machine_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:washing-machine",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_washing_machine_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-washing-machine",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_attic_and_tv_cost_rate_monthly",
                          primary: "Attic & TV",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_attic_and_tv_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_attic_and_tv_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:home-roof",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_attic_and_tv_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-attic-tv",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_charger_cost_rate_monthly",
                          primary: "Charger",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_charger_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_charger_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:ev-station",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_charger_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-charger",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_untracked_cost_rate_monthly",
                          primary: "Untracked",
                          secondary:
                            "{% set cost = states('sensor.sbf2_untracked_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_untracked_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:help-network-outline",
                          icon_color:
                            "{% set c = states('sensor.sbf2_untracked_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-untracked",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "heading",
                  heading: "Subset Devices",
                  icon: "mdi:devices",
                },
                {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "grid",
                      columns: 2,
                      square: false,
                      card_mod: {
                        style:
                          ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                      },
                      cards: [
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_attic_cost_rate_monthly",
                          primary: "Attic",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_attic_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_attic_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:home-roof",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_attic_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-attic",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_airco_cost_rate_monthly",
                          primary: "Airco",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_airco_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_airco_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:air-conditioner",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_airco_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-airco",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_all_lights_cost_rate_monthly",
                          primary: "All Lights",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_all_lights_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_all_lights_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:lightbulb-group",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_all_lights_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-all-lights",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_floor_heating_cost_rate_monthly",
                          primary: "Floor heating",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_floor_heating_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_floor_heating_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:heating-coil",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_floor_heating_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-floor-heating",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_office_cost_rate_monthly",
                          primary: "Office",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_office_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_office_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:desk",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_office_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-office",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_tv_cost_rate_monthly",
                          primary: "TV",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_tv_cost_rate_monthly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_tv_energy_rate_monthly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:television",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_tv_cost_rate_monthly') | float(0) %} {% if c < 15.0 %} green {% elif c < 45.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path: "/lovelace-battery/financials-tv",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
          {
            type: "conditional",
            conditions: [
              { entity: "input_select.financial_view_period", state: "Yearly" },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "heading",
                  heading: "Electricity Groups",
                  icon: "mdi:domain",
                },
                {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "grid",
                      columns: 2,
                      square: false,
                      card_mod: {
                        style:
                          ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                      },
                      cards: [
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_living_and_bedrooms_cost_rate_yearly",
                          primary: "Living & bedrooms",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_living_and_bedrooms_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_living_and_bedrooms_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:sofa",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_living_and_bedrooms_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-living-bedrooms",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_template_device_cost_rate_yearly",
                          primary: "Template Device",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_template_device_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_template_device_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:countertop",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_template_device_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-template_device",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_dishwasher_cost_rate_yearly",
                          primary: "Dishwasher",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_dishwasher_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_dishwasher_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:dishwasher",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_dishwasher_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-dishwasher",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_washing_machine_cost_rate_yearly",
                          primary: "Washing machine",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_washing_machine_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_washing_machine_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:washing-machine",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_washing_machine_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-washing-machine",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_attic_and_tv_cost_rate_yearly",
                          primary: "Attic & TV",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_attic_and_tv_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_attic_and_tv_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:home-roof",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_attic_and_tv_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-attic-tv",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_charger_cost_rate_yearly",
                          primary: "Charger",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_charger_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_charger_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:ev-station",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_charger_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-charger",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_untracked_cost_rate_yearly",
                          primary: "Untracked",
                          secondary:
                            "{% set cost = states('sensor.sbf2_untracked_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_untracked_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:help-network-outline",
                          icon_color:
                            "{% set c = states('sensor.sbf2_untracked_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-untracked",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "heading",
                  heading: "Subset Devices",
                  icon: "mdi:devices",
                },
                {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "grid",
                      columns: 2,
                      square: false,
                      card_mod: {
                        style:
                          ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                      },
                      cards: [
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_attic_cost_rate_yearly",
                          primary: "Attic",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_attic_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_attic_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:home-roof",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_attic_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-attic",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_airco_cost_rate_yearly",
                          primary: "Airco",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_airco_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_airco_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:air-conditioner",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_airco_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-airco",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_all_lights_cost_rate_yearly",
                          primary: "All Lights",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_all_lights_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_all_lights_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:lightbulb-group",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_all_lights_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-all-lights",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_floor_heating_cost_rate_yearly",
                          primary: "Floor heating",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_floor_heating_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_floor_heating_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:heating-coil",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_floor_heating_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-floor-heating",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_office_cost_rate_yearly",
                          primary: "Office",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_office_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_office_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:desk",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_office_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-office",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_tv_cost_rate_yearly",
                          primary: "TV",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_tv_cost_rate_yearly')|float(0) %} {% set kwh = states('sensor.sbf2_dev_tv_energy_rate_yearly')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:television",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_tv_cost_rate_yearly') | float(0) %} {% if c < 182.5 %} green {% elif c < 547.5 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path: "/lovelace-battery/financials-tv",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
          {
            type: "conditional",
            conditions: [
              {
                entity: "input_select.financial_view_period",
                state: "All-Time",
              },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "heading",
                  heading: "Electricity Groups",
                  icon: "mdi:domain",
                },
                {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "grid",
                      columns: 2,
                      square: false,
                      card_mod: {
                        style:
                          ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                      },
                      cards: [
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_living_and_bedrooms_cost_rate_cumulative",
                          primary: "Living & bedrooms",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_living_and_bedrooms_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_living_and_bedrooms_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:sofa",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_living_and_bedrooms_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-living-bedrooms",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_template_device_cost_rate_cumulative",
                          primary: "Template Device",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_template_device_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_template_device_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:countertop",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_template_device_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-template_device",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_dishwasher_cost_rate_cumulative",
                          primary: "Dishwasher",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_dishwasher_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_dishwasher_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:dishwasher",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_dishwasher_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-dishwasher",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_washing_machine_cost_rate_cumulative",
                          primary: "Washing machine",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_washing_machine_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_washing_machine_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:washing-machine",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_washing_machine_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-washing-machine",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_attic_and_tv_cost_rate_cumulative",
                          primary: "Attic & TV",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_attic_and_tv_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_attic_and_tv_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:home-roof",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_attic_and_tv_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-attic-tv",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_charger_cost_rate_cumulative",
                          primary: "Charger",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_charger_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_charger_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:ev-station",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_charger_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-charger",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_untracked_cost_rate_cumulative",
                          primary: "Untracked",
                          secondary:
                            "{% set cost = states('sensor.sbf2_untracked_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_untracked_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:help-network-outline",
                          icon_color:
                            "{% set c = states('sensor.sbf2_untracked_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-untracked",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "heading",
                  heading: "Subset Devices",
                  icon: "mdi:devices",
                },
                {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "grid",
                      columns: 2,
                      square: false,
                      card_mod: {
                        style:
                          ":host {\n  --grid-card-gap: 0px;\n}\nha-card {\n  box-shadow: none !important;\n  background: none !important;\n  margin: 0px !important;\n}\n",
                      },
                      cards: [
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_attic_cost_rate_cumulative",
                          primary: "Attic",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_attic_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_attic_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:home-roof",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_attic_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-attic",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_airco_cost_rate_cumulative",
                          primary: "Airco",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_airco_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_airco_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:air-conditioner",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_airco_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-airco",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_all_lights_cost_rate_cumulative",
                          primary: "All Lights",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_all_lights_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_all_lights_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:lightbulb-group",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_all_lights_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-all-lights",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity:
                            "sensor.sbf2_dev_floor_heating_cost_rate_cumulative",
                          primary: "Floor heating",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_floor_heating_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_floor_heating_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:heating-coil",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_floor_heating_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-floor-heating",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_office_cost_rate_cumulative",
                          primary: "Office",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_office_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_office_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:desk",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_office_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path:
                              "/lovelace-battery/financials-office",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                        {
                          type: "custom:mushroom-template-card",
                          entity: "sensor.sbf2_dev_tv_cost_rate_cumulative",
                          primary: "TV",
                          secondary:
                            "{% set cost = states('sensor.sbf2_dev_tv_cost_rate_cumulative')|float(0) %} {% set kwh = states('sensor.sbf2_dev_tv_energy_rate_cumulative')|float(0) %} {% set avg = (cost / kwh) | round(3) if kwh != 0 else 0 %} \u20ac{{ cost | round(2) }} ({{ kwh | round(2) }} @ {{ avg }})",
                          icon: "mdi:television",
                          icon_color:
                            "{% set c = states('sensor.sbf2_dev_tv_cost_rate_cumulative') | float(0) %} {% if c < 500.0 %} green {% elif c < 1500.0 %} orange {% else %} red {% endif %}",
                          layout: "horizontal",
                          fill_container: true,
                          tap_action: {
                            action: "navigate",
                            navigation_path: "/lovelace-battery/financials-tv",
                          },
                          card_mod: {
                            style:
                              "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    title: "Template Device History",
    path: "financials-template_device",
    subview: true,
    type: "panel",
    cards: [
      {
        type: "vertical-stack",
        cards: [
          {
            type: "conditional",
            conditions: [
              { entity: "input_select.financial_view_period", state: "Daily" },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "custom:mushroom-template-card",
                  entity: "sensor.sbf2_dev_template_device_cost_rate_daily",
                  primary: "Template Device",
                  icon_type: "none",
                  tap_action: {
                    action: "more-info",
                    entity: "sensor.sbf2_dev_template_device_cost_rate_daily",
                  },
                  card_mod: {
                    style:
                      "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n",
                  },
                },
                {
                  type: "custom:mushroom-chips-card",
                  alignment: "center",
                  chips: [
                    {
                      type: "template",
                      content: "7 Days",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '7') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '7') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '7') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '7') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: { entity_id: "input_select.chart_daily_days" },
                        data: { option: "7" },
                      },
                    },
                    {
                      type: "template",
                      content: "14 Days",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '14') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '14') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '14') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '14') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: { entity_id: "input_select.chart_daily_days" },
                        data: { option: "14" },
                      },
                    },
                    {
                      type: "template",
                      content: "30 Days",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '30') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '30') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '30') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '30') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: { entity_id: "input_select.chart_daily_days" },
                        data: { option: "30" },
                      },
                    },
                    {
                      type: "template",
                      content: "60 Days",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '60') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '60') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '60') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '60') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: { entity_id: "input_select.chart_daily_days" },
                        data: { option: "60" },
                      },
                    },
                    {
                      type: "template",
                      content: "90 Days",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '90') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '90') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '90') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '90') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: { entity_id: "input_select.chart_daily_days" },
                        data: { option: "90" },
                      },
                    },
                  ],
                },
                {
                  type: "custom:config-template-card",
                  entities: ["input_select.chart_daily_days"],
                  card: {
                    type: "custom:apexcharts-card",
                    graph_span:
                      "${states['input_select.chart_daily_days'].state + 'd'}",
                    span: { end: "day" },
                    header: { show: false, title: "Template Device" },
                    apex_config: {
                      yaxis: { show: true, title: { text: "Cost (€)" } },
                      chart: {
                        height: 280,
                        zoom: { enabled: false },
                        toolbar: { show: false },
                      },
                      xaxis: { type: "datetime", tooltip: { enabled: false } },
                      tooltip: { enabled: true },
                      plotOptions: {
                        bar: {
                          borderRadius: 4,
                          columnWidth: "60%",
                          dataLabels: { position: "top" },
                          colors: {
                            ranges: [
                              { from: -100000, to: 0.5, color: "#10b981" },
                              { from: 0.5, to: 1.5, color: "#f59e0b" },
                              { from: 1.5, to: 100000, color: "#ef4444" },
                            ],
                          },
                        },
                      },
                      fill: { type: "solid", opacity: 0.5 },
                      stroke: { show: true, width: 1.5 },
                      dataLabels: {
                        enabled:
                          "${window.innerWidth < 600 ? parseInt(states['input_select.chart_daily_days'].state) <= 7 : parseInt(states['input_select.chart_daily_days'].state) <= 30}",
                        offsetY: -15,
                        style: { colors: ["var(--primary-text-color)"] },
                        background: { enabled: false },
                        formatter:
                          "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n",
                      },
                      grid: {
                        borderColor: "rgba(128, 128, 128, 0.2)",
                        strokeDashArray: 2,
                      },
                    },
                    series: [
                      {
                        entity: "sensor.sbf2_dev_template_device_cost_rate_cumulative",
                        name: "Template Device",
                        type: "column",
                        show: { datalabels: true },
                        statistics: { type: "change", period: "day" },
                      },
                    ],
                  },
                },
                {
                  type: "custom:config-template-card",
                  entities: ["input_select.chart_daily_days"],
                  card: {
                    type: "custom:apexcharts-card",
                    graph_span:
                      "${states['input_select.chart_daily_days'].state + 'd'}",
                    span: { end: "day" },
                    header: { show: false, title: "Template Device (Energy)" },
                    apex_config: {
                      yaxis: { show: true, title: { text: "Energy (kWh)" } },
                      chart: {
                        height: 280,
                        zoom: { enabled: false },
                        toolbar: { show: false },
                      },
                      xaxis: { type: "datetime", tooltip: { enabled: false } },
                      tooltip: { enabled: true },
                      plotOptions: {
                        bar: {
                          borderRadius: 4,
                          columnWidth: "60%",
                          dataLabels: { position: "top" },
                          colors: {
                            ranges: [
                              { from: -100000, to: 2.0, color: "#10b981" },
                              { from: 2.0, to: 5.0, color: "#f59e0b" },
                              { from: 5.0, to: 100000, color: "#ef4444" },
                            ],
                          },
                        },
                      },
                      fill: { type: "solid", opacity: 0.5 },
                      stroke: { show: true, width: 1.5 },
                      dataLabels: {
                        enabled:
                          "${window.innerWidth < 600 ? parseInt(states['input_select.chart_daily_days'].state) <= 7 : parseInt(states['input_select.chart_daily_days'].state) <= 30}",
                        offsetY: -15,
                        style: { colors: ["var(--primary-text-color)"] },
                        background: { enabled: false },
                        formatter:
                          "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n",
                      },
                      grid: {
                        borderColor: "rgba(128, 128, 128, 0.2)",
                        strokeDashArray: 2,
                      },
                    },
                    series: [
                      {
                        entity: "sensor.sbf2_dev_template_device_energy_rate_cumulative",
                        name: "Template Device (Energy)",
                        unit: " kWh",                        type: "column",
                        show: { datalabels: true },
                        statistics: { type: "change", period: "day" },
                      },
                    ],
                  },
                },
                {
                  type: "conditional",
                  conditions: [
                    { entity: "sensor.sbf2_dev_template_device_avg_rate_daily", state_not: "unavailable" },
                    { entity: "sensor.sbf2_dev_template_device_avg_rate_daily", state_not: "unknown" }
                  ],
                  card: {
                    type: "custom:config-template-card",
                    entities: ["input_select.chart_daily_days"],
                    card: {
                      type: "custom:apexcharts-card",
                      graph_span: "${states['input_select.chart_daily_days'].state + 'd'}",
                      span: { end: "day" },
                      header: { show: false, title: "Template Device (EUR/kWh)" },
                      apex_config: {
                        yaxis: { show: true, title: { text: "EUR/kWh" }, labels: { formatter: "EVAL:function(val) { return parseFloat(val).toFixed(3); }" } },
                        chart: { height: 280, zoom: { enabled: false }, toolbar: { show: false } },
                        xaxis: { type: "datetime", tooltip: { enabled: false } },
                        tooltip: { enabled: true },
                        plotOptions: {
                          bar: {
                            borderRadius: 4,
                            columnWidth: "60%",
                            dataLabels: { position: "top" },
                            colors: {
                              ranges: [
                                { from: -100000, to: 0.15, color: "#10b981" },
                                { from: 0.15, to: 0.30, color: "#f59e0b" },
                                { from: 0.30, to: 100000, color: "#ef4444" },
                              ],
                            },
                          },
                        },
                        fill: { type: "solid", opacity: 0.5 },
                        stroke: { show: true, width: 1.5 },
                        dataLabels: {
                          enabled: "${window.innerWidth < 600 ? parseInt(states['input_select.chart_daily_days'].state) <= 7 : parseInt(states['input_select.chart_daily_days'].state) <= 30}",
                          offsetY: -15,
                          style: { colors: ["var(--primary-text-color)"] },
                          background: { enabled: false },
                          formatter: "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(3);\n  }\n  return '';\n}\n",
                        },
                        grid: { borderColor: "rgba(128, 128, 128, 0.2)", strokeDashArray: 2 },
                      },
                      series: [
                        {
                          entity: "sensor.sbf2_dev_template_device_avg_rate_daily",
                          name: "Template Device (EUR/kWh)",
                          color: "#f97316",
                          type: "column",
                          show: { datalabels: true },
                          statistics: { type: "state", period: "day" },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            type: "conditional",
            conditions: [
              { entity: "input_select.financial_view_period", state: "Weekly" },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "custom:mushroom-template-card",
                  entity: "sensor.sbf2_dev_template_device_cost_rate_weekly",
                  primary: "Template Device",
                  icon_type: "none",
                  tap_action: {
                    action: "more-info",
                    entity: "sensor.sbf2_dev_template_device_cost_rate_weekly",
                  },
                  card_mod: {
                    style:
                      "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n",
                  },
                },
                {
                  type: "custom:mushroom-chips-card",
                  alignment: "center",
                  chips: [
                    {
                      type: "template",
                      content: "4 Weeks",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '4') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '4') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: {
                          entity_id: "input_select.chart_weekly_weeks",
                        },
                        data: { option: "4" },
                      },
                    },
                    {
                      type: "template",
                      content: "8 Weeks",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '8') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '8') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: {
                          entity_id: "input_select.chart_weekly_weeks",
                        },
                        data: { option: "8" },
                      },
                    },
                    {
                      type: "template",
                      content: "12 Weeks",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: {
                          entity_id: "input_select.chart_weekly_weeks",
                        },
                        data: { option: "12" },
                      },
                    },
                    {
                      type: "template",
                      content: "26 Weeks",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '26') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '26') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: {
                          entity_id: "input_select.chart_weekly_weeks",
                        },
                        data: { option: "26" },
                      },
                    },
                    {
                      type: "template",
                      content: "52 Weeks",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '52') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '52') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: {
                          entity_id: "input_select.chart_weekly_weeks",
                        },
                        data: { option: "52" },
                      },
                    },
                  ],
                },
                {
                  type: "custom:config-template-card",
                  entities: ["input_select.chart_weekly_weeks"],
                  card: {
                    type: "custom:apexcharts-card",
                    graph_span:
                      "${states['input_select.chart_weekly_weeks'].state + 'w'}",
                    span: { end: "day" },
                    header: { show: false, title: "Template Device" },
                    apex_config: {
                      yaxis: { show: true, title: { text: "Cost (€)" } },
                      chart: {
                        height: 280,
                        zoom: { enabled: false },
                        toolbar: { show: false },
                      },
                      xaxis: { type: "datetime", tooltip: { enabled: false } },
                      tooltip: { enabled: true },
                      plotOptions: {
                        bar: {
                          borderRadius: 4,
                          columnWidth: "60%",
                          dataLabels: { position: "top" },
                          colors: {
                            ranges: [
                              { from: -100000, to: 3.5, color: "#10b981" },
                              { from: 3.5, to: 10.5, color: "#f59e0b" },
                              { from: 10.5, to: 100000, color: "#ef4444" },
                            ],
                          },
                        },
                      },
                      fill: { type: "solid", opacity: 0.5 },
                      stroke: { show: true, width: 1.5 },
                      dataLabels: {
                        enabled:
                          "${window.innerWidth < 600 ? parseInt(states['input_select.chart_weekly_weeks'].state) <= 8 : parseInt(states['input_select.chart_weekly_weeks'].state) <= 26}",
                        offsetY: -15,
                        style: { colors: ["var(--primary-text-color)"] },
                        background: { enabled: false },
                        formatter:
                          "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n",
                      },
                      grid: {
                        borderColor: "rgba(128, 128, 128, 0.2)",
                        strokeDashArray: 2,
                      },
                    },
                    series: [
                      {
                        entity: "sensor.sbf2_dev_template_device_cost_rate_cumulative",
                        name: "Template Device",
                        type: "column",
                        show: { datalabels: true },
                        statistics: { type: "change", period: "week" },
                      },
                    ],
                  },
                },
                {
                  type: "custom:config-template-card",
                  entities: ["input_select.chart_weekly_weeks"],
                  card: {
                    type: "custom:apexcharts-card",
                    graph_span:
                      "${states['input_select.chart_weekly_weeks'].state + 'w'}",
                    span: { end: "day" },
                    header: { show: false, title: "Template Device (Energy)" },
                    apex_config: {
                      yaxis: { show: true, title: { text: "Energy (kWh)" } },
                      chart: {
                        height: 280,
                        zoom: { enabled: false },
                        toolbar: { show: false },
                      },
                      xaxis: { type: "datetime", tooltip: { enabled: false } },
                      tooltip: { enabled: true },
                      plotOptions: {
                        bar: {
                          borderRadius: 4,
                          columnWidth: "60%",
                          dataLabels: { position: "top" },
                          colors: {
                            ranges: [
                              { from: -100000, to: 14.0, color: "#10b981" },
                              { from: 14.0, to: 35.0, color: "#f59e0b" },
                              { from: 35.0, to: 100000, color: "#ef4444" },
                            ],
                          },
                        },
                      },
                      fill: { type: "solid", opacity: 0.5 },
                      stroke: { show: true, width: 1.5 },
                      dataLabels: {
                        enabled:
                          "${window.innerWidth < 600 ? parseInt(states['input_select.chart_weekly_weeks'].state) <= 8 : parseInt(states['input_select.chart_weekly_weeks'].state) <= 26}",
                        offsetY: -15,
                        style: { colors: ["var(--primary-text-color)"] },
                        background: { enabled: false },
                        formatter:
                          "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n",
                      },
                      grid: {
                        borderColor: "rgba(128, 128, 128, 0.2)",
                        strokeDashArray: 2,
                      },
                    },
                    series: [
                      {
                        entity: "sensor.sbf2_dev_template_device_energy_rate_cumulative",
                        name: "Template Device (Energy)",
                        unit: " kWh",                        type: "column",
                        show: { datalabels: true },
                        statistics: { type: "change", period: "week" },
                      },
                    ],
                  },
                },
                {
                  type: "conditional",
                  conditions: [
                    { entity: "sensor.sbf2_dev_template_device_avg_rate_weekly", state_not: "unavailable" },
                    { entity: "sensor.sbf2_dev_template_device_avg_rate_weekly", state_not: "unknown" }
                  ],
                  card: {
                    type: "custom:config-template-card",
                    entities: ["input_select.chart_weekly_weeks"],
                    card: {
                      type: "custom:apexcharts-card",
                      graph_span: "${states['input_select.chart_weekly_weeks'].state + 'w'}",
                      span: { end: "week" },
                      header: { show: false, title: "Template Device (EUR/kWh)" },
                      apex_config: {
                        yaxis: { show: true, title: { text: "EUR/kWh" }, labels: { formatter: "EVAL:function(val) { return parseFloat(val).toFixed(3); }" } },
                        chart: { height: 280, zoom: { enabled: false }, toolbar: { show: false } },
                        xaxis: { type: "datetime", tooltip: { enabled: false } },
                        tooltip: { enabled: true },
                        plotOptions: {
                          bar: {
                            borderRadius: 4,
                            columnWidth: "60%",
                            dataLabels: { position: "top" },
                            colors: {
                              ranges: [
                                { from: -100000, to: 0.15, color: "#10b981" },
                                { from: 0.15, to: 0.30, color: "#f59e0b" },
                                { from: 0.30, to: 100000, color: "#ef4444" },
                              ],
                            },
                          },
                        },
                        fill: { type: "solid", opacity: 0.5 },
                        stroke: { show: true, width: 1.5 },
                        dataLabels: {
                          enabled: "${window.innerWidth < 600 ? parseInt(states['input_select.chart_weekly_weeks'].state) <= 4 : parseInt(states['input_select.chart_weekly_weeks'].state) <= 12}",
                          offsetY: -15,
                          style: { colors: ["var(--primary-text-color)"] },
                          background: { enabled: false },
                          formatter: "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(3);\n  }\n  return '';\n}\n",
                        },
                        grid: { borderColor: "rgba(128, 128, 128, 0.2)", strokeDashArray: 2 },
                      },
                      series: [
                        {
                          entity: "sensor.sbf2_dev_template_device_avg_rate_weekly",
                          name: "Template Device (EUR/kWh)",
                          color: "#f97316",
                          type: "column",
                          show: { datalabels: true },
                          statistics: { type: "state", period: "week" },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            type: "conditional",
            conditions: [
              {
                entity: "input_select.financial_view_period",
                state: "Monthly",
              },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "custom:mushroom-template-card",
                  entity: "sensor.sbf2_dev_template_device_cost_rate_monthly",
                  primary: "Template Device",
                  icon_type: "none",
                  tap_action: {
                    action: "more-info",
                    entity: "sensor.sbf2_dev_template_device_cost_rate_monthly",
                  },
                  card_mod: {
                    style:
                      "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n",
                  },
                },
                {
                  type: "custom:mushroom-chips-card",
                  alignment: "center",
                  chips: [
                    {
                      type: "template",
                      content: "6 Months",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '6') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '6') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '6') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '6') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: {
                          entity_id: "input_select.chart_monthly_months",
                        },
                        data: { option: "6" },
                      },
                    },
                    {
                      type: "template",
                      content: "12 Months",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: {
                          entity_id: "input_select.chart_monthly_months",
                        },
                        data: { option: "12" },
                      },
                    },
                    {
                      type: "template",
                      content: "24 Months",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '24') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '24') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '24') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '24') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: {
                          entity_id: "input_select.chart_monthly_months",
                        },
                        data: { option: "24" },
                      },
                    },
                    {
                      type: "template",
                      content: "36 Months",
                      card_mod: {
                        style:
                          "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '36') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '36') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '36') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '36') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                      },
                      tap_action: {
                        action: "call-service",
                        service: "input_select.select_option",
                        target: {
                          entity_id: "input_select.chart_monthly_months",
                        },
                        data: { option: "36" },
                      },
                    },
                  ],
                },
                {
                  type: "custom:config-template-card",
                  entities: ["input_select.chart_monthly_months"],
                  card: {
                    type: "custom:apexcharts-card",
                    graph_span:
                      "${states['input_select.chart_monthly_months'].state + 'month'}",
                    span: { end: "day" },
                    header: { show: false, title: "Template Device" },
                    apex_config: {
                      yaxis: { show: true, title: { text: "Cost (€)" } },
                      chart: {
                        height: 280,
                        zoom: { enabled: false },
                        toolbar: { show: false },
                      },
                      xaxis: { type: "datetime", tooltip: { enabled: false } },
                      tooltip: { enabled: true },
                      plotOptions: {
                        bar: {
                          borderRadius: 4,
                          columnWidth: "60%",
                          dataLabels: { position: "top" },
                          colors: {
                            ranges: [
                              { from: -100000, to: 15.0, color: "#10b981" },
                              { from: 15.0, to: 45.0, color: "#f59e0b" },
                              { from: 45.0, to: 100000, color: "#ef4444" },
                            ],
                          },
                        },
                      },
                      fill: { type: "solid", opacity: 0.5 },
                      stroke: { show: true, width: 1.5 },
                      dataLabels: {
                        enabled:
                          "${window.innerWidth < 600 ? parseInt(states['input_select.chart_monthly_months'].state) <= 6 : parseInt(states['input_select.chart_monthly_months'].state) <= 24}",
                        offsetY: -15,
                        style: { colors: ["var(--primary-text-color)"] },
                        background: { enabled: false },
                        formatter:
                          "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n",
                      },
                      grid: {
                        borderColor: "rgba(128, 128, 128, 0.2)",
                        strokeDashArray: 2,
                      },
                    },
                    series: [
                      {
                        entity: "sensor.sbf2_dev_template_device_cost_rate_cumulative",
                        name: "Template Device",
                        type: "column",
                        show: { datalabels: true },
                        statistics: { type: "change", period: "month" },
                      },
                    ],
                  },
                },
                {
                  type: "custom:config-template-card",
                  entities: ["input_select.chart_monthly_months"],
                  card: {
                    type: "custom:apexcharts-card",
                    graph_span:
                      "${states['input_select.chart_monthly_months'].state + 'month'}",
                    span: { end: "day" },
                    header: { show: false, title: "Template Device (Energy)" },
                    apex_config: {
                      yaxis: { show: true, title: { text: "Energy (kWh)" } },
                      chart: {
                        height: 280,
                        zoom: { enabled: false },
                        toolbar: { show: false },
                      },
                      xaxis: { type: "datetime", tooltip: { enabled: false } },
                      tooltip: { enabled: true },
                      plotOptions: {
                        bar: {
                          borderRadius: 4,
                          columnWidth: "60%",
                          dataLabels: { position: "top" },
                          colors: {
                            ranges: [
                              { from: -100000, to: 60.0, color: "#10b981" },
                              { from: 60.0, to: 150.0, color: "#f59e0b" },
                              { from: 150.0, to: 100000, color: "#ef4444" },
                            ],
                          },
                        },
                      },
                      fill: { type: "solid", opacity: 0.5 },
                      stroke: { show: true, width: 1.5 },
                      dataLabels: {
                        enabled:
                          "${window.innerWidth < 600 ? parseInt(states['input_select.chart_monthly_months'].state) <= 6 : parseInt(states['input_select.chart_monthly_months'].state) <= 24}",
                        offsetY: -15,
                        style: { colors: ["var(--primary-text-color)"] },
                        background: { enabled: false },
                        formatter:
                          "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n",
                      },
                      grid: {
                        borderColor: "rgba(128, 128, 128, 0.2)",
                        strokeDashArray: 2,
                      },
                    },
                    series: [
                      {
                        entity: "sensor.sbf2_dev_template_device_energy_rate_cumulative",
                        name: "Template Device (Energy)",
                        unit: " kWh",                        type: "column",
                        show: { datalabels: true },
                        statistics: { type: "change", period: "month" },
                      },
                    ],
                  },
                },
                {
                  type: "conditional",
                  conditions: [
                    { entity: "sensor.sbf2_dev_template_device_avg_rate_monthly", state_not: "unavailable" },
                    { entity: "sensor.sbf2_dev_template_device_avg_rate_monthly", state_not: "unknown" }
                  ],
                  card: {
                    type: "custom:config-template-card",
                    entities: ["input_select.chart_monthly_months"],
                    card: {
                      type: "custom:apexcharts-card",
                      graph_span: "${states['input_select.chart_monthly_months'].state + 'month'}",
                      span: { end: "month" },
                      header: { show: false, title: "Template Device (EUR/kWh)" },
                      apex_config: {
                        yaxis: { show: true, title: { text: "EUR/kWh" }, labels: { formatter: "EVAL:function(val) { return parseFloat(val).toFixed(3); }" } },
                        chart: { height: 280, zoom: { enabled: false }, toolbar: { show: false } },
                        xaxis: { type: "datetime", tooltip: { enabled: false } },
                        tooltip: { enabled: true },
                        plotOptions: {
                          bar: {
                            borderRadius: 4,
                            columnWidth: "60%",
                            dataLabels: { position: "top" },
                            colors: {
                              ranges: [
                                { from: -100000, to: 0.15, color: "#10b981" },
                                { from: 0.15, to: 0.30, color: "#f59e0b" },
                                { from: 0.30, to: 100000, color: "#ef4444" },
                              ],
                            },
                          },
                        },
                        fill: { type: "solid", opacity: 0.5 },
                        stroke: { show: true, width: 1.5 },
                        dataLabels: {
                          enabled: "${window.innerWidth < 600 ? parseInt(states['input_select.chart_monthly_months'].state) <= 6 : parseInt(states['input_select.chart_monthly_months'].state) <= 12}",
                          offsetY: -15,
                          style: { colors: ["var(--primary-text-color)"] },
                          background: { enabled: false },
                          formatter: "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(3);\n  }\n  return '';\n}\n",
                        },
                        grid: { borderColor: "rgba(128, 128, 128, 0.2)", strokeDashArray: 2 },
                      },
                      series: [
                        {
                          entity: "sensor.sbf2_dev_template_device_avg_rate_monthly",
                          name: "Template Device (EUR/kWh)",
                          color: "#f97316",
                          type: "column",
                          show: { datalabels: true },
                          statistics: { type: "state", period: "month" },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            type: "conditional",
            conditions: [
              { entity: "input_select.financial_view_period", state: "Yearly" },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "custom:apexcharts-card",
                  graph_span: "10y",
                  span: { end: "day" },
                  header: { show: false, title: "Template Device (Last 10 Years)" },
                  apex_config: {
                    yaxis: { show: true, title: { text: "Cost (€)" } },
                    chart: {
                      height: 280,
                      zoom: { enabled: false },
                      toolbar: { show: false },
                    },
                    xaxis: { type: "datetime", tooltip: { enabled: false } },
                    tooltip: { enabled: true },
                    plotOptions: {
                      bar: {
                        borderRadius: 4,
                        columnWidth: "60%",
                        dataLabels: { position: "top" },
                        colors: {
                          ranges: [
                            { from: -100000, to: 182.5, color: "#10b981" },
                            { from: 182.5, to: 547.5, color: "#f59e0b" },
                            { from: 547.5, to: 100000, color: "#ef4444" },
                          ],
                        },
                      },
                    },
                    fill: { type: "solid", opacity: 0.5 },
                    stroke: { show: true, width: 1.5 },
                    dataLabels: {
                      enabled: true,
                      offsetY: -15,
                      style: { colors: ["var(--primary-text-color)"] },
                      background: { enabled: false },
                      formatter:
                        "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n",
                    },
                    grid: {
                      borderColor: "rgba(128, 128, 128, 0.2)",
                      strokeDashArray: 2,
                    },
                  },
                  series: [
                    {
                      entity: "sensor.sbf2_dev_template_device_cost_rate_cumulative",
                      name: "Template Device",
                      type: "column",
                      show: { datalabels: true },
                      statistics: { type: "change", period: "month" },
                      group_by: { func: "sum", duration: "1y" },
                    },
                  ],
                },
                {
                  type: "custom:apexcharts-card",
                  graph_span: "10y",
                  span: { end: "day" },
                  header: { show: false, title: "Template Device (Energy)" },
                  apex_config: {
                    yaxis: { show: true, title: { text: "Energy (kWh)" } },
                    chart: {
                      height: 280,
                      zoom: { enabled: false },
                      toolbar: { show: false },
                    },
                    xaxis: { type: "datetime", tooltip: { enabled: false } },
                    tooltip: { enabled: true },
                    plotOptions: {
                      bar: {
                        borderRadius: 4,
                        columnWidth: "60%",
                        dataLabels: { position: "top" },
                        colors: {
                          ranges: [
                            { from: -100000, to: 730.0, color: "#10b981" },
                            { from: 730.0, to: 1825.0, color: "#f59e0b" },
                            { from: 1825.0, to: 100000, color: "#ef4444" },
                          ],
                        },
                      },
                    },
                    fill: { type: "solid", opacity: 0.5 },
                    stroke: { show: true, width: 1.5 },
                    dataLabels: {
                      enabled: true,
                      offsetY: -15,
                      style: { colors: ["var(--primary-text-color)"] },
                      background: { enabled: false },
                      formatter:
                        "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n",
                    },
                    grid: {
                      borderColor: "rgba(128, 128, 128, 0.2)",
                      strokeDashArray: 2,
                    },
                  },
                  series: [
                    {
                      entity: "sensor.sbf2_dev_template_device_energy_rate_cumulative",
                      name: "Template Device (Energy)",
                      unit: " kWh",                      type: "column",
                      show: { datalabels: true },
                      statistics: { type: "change", period: "month" },
                      group_by: { func: "sum", duration: "1y" },
                    },
                  ],
                },
                {
                  type: "conditional",
                  conditions: [
                    { entity: "sensor.sbf2_dev_template_device_avg_rate_yearly", state_not: "unavailable" },
                    { entity: "sensor.sbf2_dev_template_device_avg_rate_yearly", state_not: "unknown" }
                  ],
                  card: {
                    type: "custom:apexcharts-card",
                    graph_span: "10y",
                    span: { end: "day" },
                    header: { show: false, title: "Template Device (EUR/kWh)" },
                    apex_config: {
                      yaxis: { show: true, title: { text: "EUR/kWh" }, labels: { formatter: "EVAL:function(val) { return parseFloat(val).toFixed(3); }" } },
                      chart: { height: 280, zoom: { enabled: false }, toolbar: { show: false } },
                      xaxis: { type: "datetime", tooltip: { enabled: false } },
                      tooltip: { enabled: true },
                      plotOptions: { bar: { borderRadius: 4, columnWidth: "60%", dataLabels: { position: "top" } } },
                      fill: { type: "solid", opacity: 0.5 },
                      stroke: { show: true, width: 1.5 },
                      dataLabels: {
                        enabled: true,
                        offsetY: -15,
                        style: { colors: ["var(--primary-text-color)"] },
                        background: { enabled: false },
                        formatter: "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(3);\n  }\n  return '';\n}\n",
                      },
                      grid: { borderColor: "rgba(128, 128, 128, 0.2)", strokeDashArray: 2 },
                    },
                    series: [
                      {
                        entity: "sensor.sbf2_dev_template_device_avg_rate_yearly",
                        name: "Template Device (EUR/kWh)",
                        color: "#f97316",
                        type: "column",
                        show: { datalabels: true },
                        statistics: { type: "state", period: "month" },
                        group_by: { func: "avg", duration: "1y" },
                      },
                    ],
                  }
                }
              ]
            }
          },
          {
            type: "conditional",
            conditions: [
              {
                entity: "input_select.financial_view_period",
                state: "All-Time",
              },
            ],
            card: {
              type: "vertical-stack",
              cards: [
                {
                  type: "custom:apexcharts-card",
                  graph_span: "10y",
                  span: { end: "day" },
                  header: { show: false, title: "Template Device (All-Time)" },
                  apex_config: {
                    yaxis: { show: true, title: { text: "Cost (€)" } },
                    chart: {
                      height: 280,
                      zoom: { enabled: false },
                      toolbar: { show: false },
                    },
                    xaxis: { type: "datetime", tooltip: { enabled: false } },
                    tooltip: { enabled: true },
                    plotOptions: {
                      bar: {
                        borderRadius: 4,
                        columnWidth: "60%",
                        dataLabels: { position: "top" },
                        colors: {
                          ranges: [
                            { from: -100000, to: 500.0, color: "#10b981" },
                            { from: 500.0, to: 1500.0, color: "#f59e0b" },
                            { from: 1500.0, to: 100000, color: "#ef4444" },
                          ],
                        },
                      },
                    },
                    fill: { type: "solid", opacity: 0.5 },
                    stroke: { show: true, width: 1.5 },
                    dataLabels: {
                      enabled: true,
                      offsetY: -15,
                      style: { colors: ["var(--primary-text-color)"] },
                      background: { enabled: false },
                      formatter:
                        "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n",
                    },
                    grid: {
                      borderColor: "rgba(128, 128, 128, 0.2)",
                      strokeDashArray: 2,
                    },
                  },
                  series: [
                    {
                      entity: "sensor.sbf2_dev_template_device_cost_rate_cumulative",
                      name: "Template Device",
                      type: "column",
                      show: { datalabels: true },
                      statistics: { type: "change", period: "month" },
                      group_by: { func: "sum", duration: "1y" },
                    },
                  ],
                },
                {
                  type: "custom:apexcharts-card",
                  graph_span: "10y",
                  span: { end: "day" },
                  header: { show: false, title: "Template Device (Energy)" },
                  apex_config: {
                    yaxis: { show: true, title: { text: "Energy (kWh)" } },
                    chart: {
                      height: 280,
                      zoom: { enabled: false },
                      toolbar: { show: false },
                    },
                    xaxis: { type: "datetime", tooltip: { enabled: false } },
                    tooltip: { enabled: true },
                    plotOptions: {
                      bar: {
                        borderRadius: 4,
                        columnWidth: "60%",
                        dataLabels: { position: "top" },
                        colors: {
                          ranges: [
                            { from: -100000, to: 730.0, color: "#10b981" },
                            { from: 730.0, to: 1825.0, color: "#f59e0b" },
                            { from: 1825.0, to: 100000, color: "#ef4444" },
                          ],
                        },
                      },
                    },
                    fill: { type: "solid", opacity: 0.5 },
                    stroke: { show: true, width: 1.5 },
                    dataLabels: {
                      enabled: true,
                      offsetY: -15,
                      style: { colors: ["var(--primary-text-color)"] },
                      background: { enabled: false },
                      formatter:
                        "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n",
                    },
                    grid: {
                      borderColor: "rgba(128, 128, 128, 0.2)",
                      strokeDashArray: 2,
                    },
                  },
                  series: [
                    {
                      entity: "sensor.sbf2_dev_template_device_energy_rate_cumulative",
                      name: "Template Device (Energy)",
                      unit: " kWh",                      type: "column",
                      show: { datalabels: true },
                      statistics: { type: "change", period: "month" },
                      group_by: { func: "sum", duration: "1y" },
                    },
                  ],
                },
                {
                  type: "conditional",
                  conditions: [
                    { entity: "sensor.sbf2_dev_template_device_avg_rate_cumulative", state_not: "unavailable" },
                    { entity: "sensor.sbf2_dev_template_device_avg_rate_cumulative", state_not: "unknown" }
                  ],
                  card: {
                    type: "custom:apexcharts-card",
                    graph_span: "10y",
                    span: { end: "day" },
                    header: { show: false, title: "Template Device (EUR/kWh)" },
                    apex_config: {
                      yaxis: { show: true, title: { text: "EUR/kWh" }, labels: { formatter: "EVAL:function(val) { return parseFloat(val).toFixed(3); }" } },
                      chart: { height: 280, zoom: { enabled: false }, toolbar: { show: false } },
                      xaxis: { type: "datetime", tooltip: { enabled: false } },
                      tooltip: { enabled: true },
                      plotOptions: { bar: { borderRadius: 4, columnWidth: "60%", dataLabels: { position: "top" } } },
                      fill: { type: "solid", opacity: 0.5 },
                      stroke: { show: true, width: 1.5 },
                      dataLabels: {
                        enabled: true,
                        offsetY: -15,
                        style: { colors: ["var(--primary-text-color)"] },
                        background: { enabled: false },
                        formatter: "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return parseFloat(val).toFixed(3);\n  }\n  return '';\n}\n",
                      },
                      grid: { borderColor: "rgba(128, 128, 128, 0.2)", strokeDashArray: 2 },
                    },
                    series: [
                      {
                        entity: "sensor.sbf2_dev_template_device_avg_rate_cumulative",
                        name: "Template Device (EUR/kWh)",
                        color: "#f97316",
                        type: "column",
                        show: { datalabels: true },
                        statistics: { type: "state", period: "month" },
                        group_by: { func: "avg", duration: "1y" },
                      },
                    ],
                  }
                }
              ]
            }
          },
        ],
      },
    ],
  },

{ "title": "Total System Earnings History", "path": "financials-total-system-earnings", "subview": true, "type": "panel", "cards": [{ "type": "vertical-stack", "cards": [{ "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Daily" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_system_earnings_rate_daily", "primary": "Total System Earnings", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_system_earnings_rate_daily" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "7 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '7') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '7') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '7') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '7') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "7" } } }, { "type": "template", "content": "14 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '14') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '14') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '14') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '14') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "14" } } }, { "type": "template", "content": "30 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '30') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '30') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '30') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '30') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "30" } } }, { "type": "template", "content": "60 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '60') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '60') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '60') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '60') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "60" } } }, { "type": "template", "content": "90 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '90') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '90') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '90') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '90') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "90" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_daily_days"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_daily_days'].state + 'd'}", "span": { "end": "day" }, "header": { "show": false, "title": "Total System Earnings" }, "apex_config": { "chart": { "stacked": true, "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#ffc107", "#9c27b0"] }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_daily_days'].state) <= 7 : parseInt(states['input_select.chart_daily_days'].state) <= 30}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val, opts) {\n  let s0 = opts.w.globals.series[0][opts.dataPointIndex];\n  let s1 = opts.w.globals.series[1][opts.dataPointIndex];\n  let valid0 = s0 !== null && s0 !== undefined;\n  let valid1 = s1 !== null && s1 !== undefined;\n  let val0 = valid0 ? parseFloat(s0) : 0;\n  let val1 = valid1 ? parseFloat(s1) : 0;\n  let tot = val0 + val1;\n  \n  let targetSeries = 0;\n  if (valid1 && val1 >= 0) {\n      targetSeries = 1;\n  } else if (valid1 && val1 < 0) {\n      targetSeries = 0;\n  }\n  if (!valid0 && valid1) {\n      targetSeries = 1;\n  }\n  \n  if (opts.seriesIndex === targetSeries) {\n      return '\u20ac' + tot.toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_solar_only_earnings_rate_cumulative", "name": "Solar", "type": "column", "color": "#ffc107", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "day" } }, { "entity": "sensor.sbf2_battery_added_value_rate_cumulative", "name": "Battery", "type": "column", "color": "#9c27b0", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "day" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Weekly" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_system_earnings_rate_weekly", "primary": "Total System Earnings", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_system_earnings_rate_weekly" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "4 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '4') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '4') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "4" } } }, { "type": "template", "content": "8 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '8') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '8') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "8" } } }, { "type": "template", "content": "12 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "12" } } }, { "type": "template", "content": "26 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '26') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '26') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "26" } } }, { "type": "template", "content": "52 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '52') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '52') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "52" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_weekly_weeks"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_weekly_weeks'].state + 'w'}", "span": { "end": "day" }, "header": { "show": false, "title": "Total System Earnings" }, "apex_config": { "chart": { "stacked": true, "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#ffc107", "#9c27b0"] }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_weekly_weeks'].state) <= 8 : parseInt(states['input_select.chart_weekly_weeks'].state) <= 26}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val, opts) {\n  let s0 = opts.w.globals.series[0][opts.dataPointIndex];\n  let s1 = opts.w.globals.series[1][opts.dataPointIndex];\n  let valid0 = s0 !== null && s0 !== undefined;\n  let valid1 = s1 !== null && s1 !== undefined;\n  let val0 = valid0 ? parseFloat(s0) : 0;\n  let val1 = valid1 ? parseFloat(s1) : 0;\n  let tot = val0 + val1;\n  \n  let targetSeries = 0;\n  if (valid1 && val1 >= 0) {\n      targetSeries = 1;\n  } else if (valid1 && val1 < 0) {\n      targetSeries = 0;\n  }\n  if (!valid0 && valid1) {\n      targetSeries = 1;\n  }\n  \n  if (opts.seriesIndex === targetSeries) {\n      return '\u20ac' + tot.toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_solar_only_earnings_rate_cumulative", "name": "Solar", "type": "column", "color": "#ffc107", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "week" } }, { "entity": "sensor.sbf2_battery_added_value_rate_cumulative", "name": "Battery", "type": "column", "color": "#9c27b0", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "week" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Monthly" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_system_earnings_rate_monthly", "primary": "Total System Earnings", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_system_earnings_rate_monthly" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "6 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '6') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '6') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '6') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '6') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "6" } } }, { "type": "template", "content": "12 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "12" } } }, { "type": "template", "content": "24 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '24') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '24') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '24') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '24') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "24" } } }, { "type": "template", "content": "36 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '36') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '36') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '36') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '36') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "36" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_monthly_months"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_monthly_months'].state + 'month'}", "span": { "end": "day" }, "header": { "show": false, "title": "Total System Earnings" }, "apex_config": { "chart": { "stacked": true, "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#ffc107", "#9c27b0"] }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_monthly_months'].state) <= 6 : parseInt(states['input_select.chart_monthly_months'].state) <= 24}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val, opts) {\n  let s0 = opts.w.globals.series[0][opts.dataPointIndex];\n  let s1 = opts.w.globals.series[1][opts.dataPointIndex];\n  let valid0 = s0 !== null && s0 !== undefined;\n  let valid1 = s1 !== null && s1 !== undefined;\n  let val0 = valid0 ? parseFloat(s0) : 0;\n  let val1 = valid1 ? parseFloat(s1) : 0;\n  let tot = val0 + val1;\n  \n  let targetSeries = 0;\n  if (valid1 && val1 >= 0) {\n      targetSeries = 1;\n  } else if (valid1 && val1 < 0) {\n      targetSeries = 0;\n  }\n  if (!valid0 && valid1) {\n      targetSeries = 1;\n  }\n  \n  if (opts.seriesIndex === targetSeries) {\n      return '\u20ac' + tot.toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_solar_only_earnings_rate_cumulative", "name": "Solar", "type": "column", "color": "#ffc107", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" } }, { "entity": "sensor.sbf2_battery_added_value_rate_cumulative", "name": "Battery", "type": "column", "color": "#9c27b0", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Yearly" }], "card": { "type": "custom:apexcharts-card", "graph_span": "10y", "span": { "end": "day" }, "header": { "show": false, "title": "Total System Earnings (Last 10 Years)" }, "apex_config": { "chart": { "stacked": true, "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#ffc107", "#9c27b0"] }, "dataLabels": { "enabled": true, "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val, opts) {\n  let s0 = opts.w.globals.series[0][opts.dataPointIndex];\n  let s1 = opts.w.globals.series[1][opts.dataPointIndex];\n  let valid0 = s0 !== null && s0 !== undefined;\n  let valid1 = s1 !== null && s1 !== undefined;\n  let val0 = valid0 ? parseFloat(s0) : 0;\n  let val1 = valid1 ? parseFloat(s1) : 0;\n  let tot = val0 + val1;\n  \n  let targetSeries = 0;\n  if (valid1 && val1 >= 0) {\n      targetSeries = 1;\n  } else if (valid1 && val1 < 0) {\n      targetSeries = 0;\n  }\n  if (!valid0 && valid1) {\n      targetSeries = 1;\n  }\n  \n  if (opts.seriesIndex === targetSeries) {\n      return '\u20ac' + tot.toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_solar_only_earnings_rate_cumulative", "name": "Solar", "type": "column", "color": "#ffc107", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }, { "entity": "sensor.sbf2_battery_added_value_rate_cumulative", "name": "Battery", "type": "column", "color": "#9c27b0", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "All-Time" }], "card": { "type": "custom:apexcharts-card", "graph_span": "10y", "span": { "end": "day" }, "header": { "show": false, "title": "Total System Earnings (All-Time)" }, "apex_config": { "chart": { "stacked": true, "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#ffc107", "#9c27b0"] }, "dataLabels": { "enabled": true, "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val, opts) {\n  let s0 = opts.w.globals.series[0][opts.dataPointIndex];\n  let s1 = opts.w.globals.series[1][opts.dataPointIndex];\n  let valid0 = s0 !== null && s0 !== undefined;\n  let valid1 = s1 !== null && s1 !== undefined;\n  let val0 = valid0 ? parseFloat(s0) : 0;\n  let val1 = valid1 ? parseFloat(s1) : 0;\n  let tot = val0 + val1;\n  \n  let targetSeries = 0;\n  if (valid1 && val1 >= 0) {\n      targetSeries = 1;\n  } else if (valid1 && val1 < 0) {\n      targetSeries = 0;\n  }\n  if (!valid0 && valid1) {\n      targetSeries = 1;\n  }\n  \n  if (opts.seriesIndex === targetSeries) {\n      return '\u20ac' + tot.toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_solar_only_earnings_rate_cumulative", "name": "Solar", "type": "column", "color": "#ffc107", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }, { "entity": "sensor.sbf2_battery_added_value_rate_cumulative", "name": "Battery", "type": "column", "color": "#9c27b0", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }] } }] }] }, { "title": "Solar-Only Earnings History", "path": "financials-solar-only-earnings", "subview": true, "type": "panel", "cards": [{ "type": "vertical-stack", "cards": [{ "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Daily" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_solar_only_earnings_rate_daily", "primary": "Solar-Only Earnings", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_solar_only_earnings_rate_daily" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "7 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '7') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '7') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '7') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '7') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "7" } } }, { "type": "template", "content": "14 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '14') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '14') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '14') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '14') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "14" } } }, { "type": "template", "content": "30 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '30') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '30') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '30') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '30') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "30" } } }, { "type": "template", "content": "60 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '60') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '60') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '60') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '60') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "60" } } }, { "type": "template", "content": "90 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '90') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '90') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '90') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '90') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "90" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_daily_days"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_daily_days'].state + 'd'}", "span": { "end": "day" }, "header": { "show": false, "title": "Solar-Only Earnings" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#ffc107"] }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_daily_days'].state) <= 7 : parseInt(states['input_select.chart_daily_days'].state) <= 30}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_solar_only_earnings_rate_cumulative", "name": "Solar-Only Earnings", "type": "column", "color": "#ffc107", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "day" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Weekly" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_solar_only_earnings_rate_weekly", "primary": "Solar-Only Earnings", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_solar_only_earnings_rate_weekly" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "4 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '4') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '4') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "4" } } }, { "type": "template", "content": "8 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '8') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '8') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "8" } } }, { "type": "template", "content": "12 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "12" } } }, { "type": "template", "content": "26 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '26') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '26') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "26" } } }, { "type": "template", "content": "52 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '52') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '52') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "52" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_weekly_weeks"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_weekly_weeks'].state + 'w'}", "span": { "end": "day" }, "header": { "show": false, "title": "Solar-Only Earnings" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#ffc107"] }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_weekly_weeks'].state) <= 8 : parseInt(states['input_select.chart_weekly_weeks'].state) <= 26}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_solar_only_earnings_rate_cumulative", "name": "Solar-Only Earnings", "type": "column", "color": "#ffc107", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "week" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Monthly" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_solar_only_earnings_rate_monthly", "primary": "Solar-Only Earnings", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_solar_only_earnings_rate_monthly" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "6 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '6') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '6') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '6') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '6') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "6" } } }, { "type": "template", "content": "12 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "12" } } }, { "type": "template", "content": "24 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '24') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '24') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '24') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '24') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "24" } } }, { "type": "template", "content": "36 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '36') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '36') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '36') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '36') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "36" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_monthly_months"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_monthly_months'].state + 'month'}", "span": { "end": "day" }, "header": { "show": false, "title": "Solar-Only Earnings" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#ffc107"] }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_monthly_months'].state) <= 6 : parseInt(states['input_select.chart_monthly_months'].state) <= 24}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_solar_only_earnings_rate_cumulative", "name": "Solar-Only Earnings", "type": "column", "color": "#ffc107", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Yearly" }], "card": { "type": "custom:apexcharts-card", "graph_span": "10y", "span": { "end": "day" }, "header": { "show": false, "title": "Solar-Only Earnings (Last 10 Years)" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#ffc107"] }, "dataLabels": { "enabled": true, "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_solar_only_earnings_rate_cumulative", "name": "Solar-Only Earnings", "type": "column", "color": "#ffc107", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "All-Time" }], "card": { "type": "custom:apexcharts-card", "graph_span": "10y", "span": { "end": "day" }, "header": { "show": false, "title": "Solar-Only Earnings (All-Time)" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#ffc107"] }, "dataLabels": { "enabled": true, "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_solar_only_earnings_rate_cumulative", "name": "Solar-Only Earnings", "type": "column", "color": "#ffc107", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }] } }] }] }, { "title": "Battery Added Value History", "path": "financials-battery-added-value", "subview": true, "type": "panel", "cards": [{ "type": "vertical-stack", "cards": [{ "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Daily" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_battery_added_value_rate_daily", "primary": "Battery Added Value", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_battery_added_value_rate_daily" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "7 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '7') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '7') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '7') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '7') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "7" } } }, { "type": "template", "content": "14 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '14') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '14') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '14') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '14') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "14" } } }, { "type": "template", "content": "30 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '30') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '30') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '30') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '30') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "30" } } }, { "type": "template", "content": "60 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '60') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '60') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '60') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '60') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "60" } } }, { "type": "template", "content": "90 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '90') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '90') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '90') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '90') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "90" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_daily_days"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_daily_days'].state + 'd'}", "span": { "end": "day" }, "header": { "show": false, "title": "Battery Added Value" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#9c27b0"] }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_daily_days'].state) <= 7 : parseInt(states['input_select.chart_daily_days'].state) <= 30}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_battery_added_value_rate_cumulative", "name": "Battery Added Value", "type": "column", "color": "#9c27b0", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "day" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Weekly" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_battery_added_value_rate_weekly", "primary": "Battery Added Value", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_battery_added_value_rate_weekly" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "4 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '4') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '4') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "4" } } }, { "type": "template", "content": "8 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '8') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '8') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "8" } } }, { "type": "template", "content": "12 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "12" } } }, { "type": "template", "content": "26 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '26') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '26') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "26" } } }, { "type": "template", "content": "52 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '52') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '52') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "52" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_weekly_weeks"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_weekly_weeks'].state + 'w'}", "span": { "end": "day" }, "header": { "show": false, "title": "Battery Added Value" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#9c27b0"] }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_weekly_weeks'].state) <= 8 : parseInt(states['input_select.chart_weekly_weeks'].state) <= 26}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_battery_added_value_rate_cumulative", "name": "Battery Added Value", "type": "column", "color": "#9c27b0", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "week" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Monthly" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_battery_added_value_rate_monthly", "primary": "Battery Added Value", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_battery_added_value_rate_monthly" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "6 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '6') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '6') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '6') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '6') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "6" } } }, { "type": "template", "content": "12 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "12" } } }, { "type": "template", "content": "24 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '24') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '24') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '24') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '24') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "24" } } }, { "type": "template", "content": "36 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '36') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '36') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '36') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '36') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "36" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_monthly_months"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_monthly_months'].state + 'month'}", "span": { "end": "day" }, "header": { "show": false, "title": "Battery Added Value" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#9c27b0"] }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_monthly_months'].state) <= 6 : parseInt(states['input_select.chart_monthly_months'].state) <= 24}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_battery_added_value_rate_cumulative", "name": "Battery Added Value", "type": "column", "color": "#9c27b0", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Yearly" }], "card": { "type": "custom:apexcharts-card", "graph_span": "10y", "span": { "end": "day" }, "header": { "show": false, "title": "Battery Added Value (Last 10 Years)" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#9c27b0"] }, "dataLabels": { "enabled": true, "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_battery_added_value_rate_cumulative", "name": "Battery Added Value", "type": "column", "color": "#9c27b0", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "All-Time" }], "card": { "type": "custom:apexcharts-card", "graph_span": "10y", "span": { "end": "day" }, "header": { "show": false, "title": "Battery Added Value (All-Time)" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5, "colors": ["#9c27b0"] }, "dataLabels": { "enabled": true, "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_battery_added_value_rate_cumulative", "name": "Battery Added Value", "type": "column", "color": "#9c27b0", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }] } }] }] }, { "title": "Effective Cost History", "path": "financials-effective-cost", "subview": true, "type": "panel", "cards": [{ "type": "vertical-stack", "cards": [{ "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Daily" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_total_system_cost_rate_daily", "primary": "Effective Cost", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_total_system_cost_rate_daily" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "7 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '7') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '7') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '7') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '7') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "7" } } }, { "type": "template", "content": "14 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '14') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '14') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '14') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '14') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "14" } } }, { "type": "template", "content": "30 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '30') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '30') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '30') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '30') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "30" } } }, { "type": "template", "content": "60 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '60') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '60') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '60') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '60') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "60" } } }, { "type": "template", "content": "90 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '90') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '90') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '90') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '90') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "90" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_daily_days"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_daily_days'].state + 'd'}", "span": { "end": "day" }, "header": { "show": false, "title": "Effective Cost" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" }, "colors": { "ranges": [{ "from": -100000, "to": 0.5, "color": "#10b981" }, { "from": 0.5, "to": 1.5, "color": "#f59e0b" }, { "from": 1.5, "to": 100000, "color": "#ef4444" }] } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5 }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_daily_days'].state) <= 7 : parseInt(states['input_select.chart_daily_days'].state) <= 30}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_total_system_cost_rate_cumulative", "name": "Effective Cost", "type": "column", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "day" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Weekly" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_total_system_cost_rate_weekly", "primary": "Effective Cost", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_total_system_cost_rate_weekly" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "4 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '4') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '4') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "4" } } }, { "type": "template", "content": "8 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '8') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '8') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "8" } } }, { "type": "template", "content": "12 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "12" } } }, { "type": "template", "content": "26 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '26') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '26') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "26" } } }, { "type": "template", "content": "52 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '52') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '52') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "52" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_weekly_weeks"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_weekly_weeks'].state + 'w'}", "span": { "end": "day" }, "header": { "show": false, "title": "Effective Cost" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" }, "colors": { "ranges": [{ "from": -100000, "to": 3.5, "color": "#10b981" }, { "from": 3.5, "to": 10.5, "color": "#f59e0b" }, { "from": 10.5, "to": 100000, "color": "#ef4444" }] } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5 }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_weekly_weeks'].state) <= 8 : parseInt(states['input_select.chart_weekly_weeks'].state) <= 26}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_total_system_cost_rate_cumulative", "name": "Effective Cost", "type": "column", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "week" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Monthly" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_total_system_cost_rate_monthly", "primary": "Effective Cost", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_total_system_cost_rate_monthly" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "6 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '6') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '6') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '6') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '6') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "6" } } }, { "type": "template", "content": "12 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "12" } } }, { "type": "template", "content": "24 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '24') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '24') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '24') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '24') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "24" } } }, { "type": "template", "content": "36 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '36') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '36') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '36') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '36') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "36" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_monthly_months"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_monthly_months'].state + 'month'}", "span": { "end": "day" }, "header": { "show": false, "title": "Effective Cost" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" }, "colors": { "ranges": [{ "from": -100000, "to": 15.0, "color": "#10b981" }, { "from": 15.0, "to": 45.0, "color": "#f59e0b" }, { "from": 45.0, "to": 100000, "color": "#ef4444" }] } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5 }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_monthly_months'].state) <= 6 : parseInt(states['input_select.chart_monthly_months'].state) <= 24}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_total_system_cost_rate_cumulative", "name": "Effective Cost", "type": "column", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Yearly" }], "card": { "type": "custom:apexcharts-card", "graph_span": "10y", "span": { "end": "day" }, "header": { "show": false, "title": "Effective Cost (Last 10 Years)" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" }, "colors": { "ranges": [{ "from": -100000, "to": 182.5, "color": "#10b981" }, { "from": 182.5, "to": 547.5, "color": "#f59e0b" }, { "from": 547.5, "to": 100000, "color": "#ef4444" }] } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5 }, "dataLabels": { "enabled": true, "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_total_system_cost_rate_cumulative", "name": "Effective Cost", "type": "column", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "All-Time" }], "card": { "type": "custom:apexcharts-card", "graph_span": "10y", "span": { "end": "day" }, "header": { "show": false, "title": "Effective Cost (All-Time)" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" }, "colors": { "ranges": [{ "from": -100000, "to": 500.0, "color": "#10b981" }, { "from": 500.0, "to": 1500.0, "color": "#f59e0b" }, { "from": 1500.0, "to": 100000, "color": "#ef4444" }] } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5 }, "dataLabels": { "enabled": true, "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_total_system_cost_rate_cumulative", "name": "Effective Cost", "type": "column", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }] } }] }] }, { "title": "Net Bill History", "path": "financials-net-bill", "subview": true, "type": "panel", "cards": [{ "type": "vertical-stack", "cards": [{ "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Daily" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_net_grid_cost_rate_daily", "primary": "Net Bill", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_net_grid_cost_rate_daily" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "7 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '7') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '7') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '7') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '7') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "7" } } }, { "type": "template", "content": "14 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '14') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '14') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '14') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '14') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "14" } } }, { "type": "template", "content": "30 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '30') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '30') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '30') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '30') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "30" } } }, { "type": "template", "content": "60 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '60') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '60') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '60') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '60') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "60" } } }, { "type": "template", "content": "90 Days", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_daily_days', '90') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_daily_days', '90') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_daily_days', '90') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_daily_days', '90') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_daily_days" }, "data": { "option": "90" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_daily_days"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_daily_days'].state + 'd'}", "span": { "end": "day" }, "header": { "show": false, "title": "Net Bill" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" }, "colors": { "ranges": [{ "from": -100000, "to": 0.5, "color": "#10b981" }, { "from": 0.5, "to": 1.5, "color": "#f59e0b" }, { "from": 1.5, "to": 100000, "color": "#ef4444" }] } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5 }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_daily_days'].state) <= 7 : parseInt(states['input_select.chart_daily_days'].state) <= 30}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_net_grid_cost_rate_cumulative", "name": "Net Bill", "type": "column", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "day" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Weekly" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_net_grid_cost_rate_weekly", "primary": "Net Bill", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_net_grid_cost_rate_weekly" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "4 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '4') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '4') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '4') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "4" } } }, { "type": "template", "content": "8 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '8') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '8') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '8') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "8" } } }, { "type": "template", "content": "12 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "12" } } }, { "type": "template", "content": "26 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '26') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '26') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '26') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "26" } } }, { "type": "template", "content": "52 Weeks", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_weekly_weeks', '52') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_weekly_weeks', '52') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_weekly_weeks', '52') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_weekly_weeks" }, "data": { "option": "52" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_weekly_weeks"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_weekly_weeks'].state + 'w'}", "span": { "end": "day" }, "header": { "show": false, "title": "Net Bill" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" }, "colors": { "ranges": [{ "from": -100000, "to": 3.5, "color": "#10b981" }, { "from": 3.5, "to": 10.5, "color": "#f59e0b" }, { "from": 10.5, "to": 100000, "color": "#ef4444" }] } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5 }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_weekly_weeks'].state) <= 8 : parseInt(states['input_select.chart_weekly_weeks'].state) <= 26}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_net_grid_cost_rate_cumulative", "name": "Net Bill", "type": "column", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "week" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Monthly" }], "card": { "type": "vertical-stack", "cards": [{ "type": "custom:mushroom-template-card", "entity": "sensor.sbf2_net_grid_cost_rate_monthly", "primary": "Net Bill", "icon_type": "none", "tap_action": { "action": "more-info", "entity": "sensor.sbf2_net_grid_cost_rate_monthly" }, "card_mod": { "style": "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n" } }, { "type": "custom:mushroom-chips-card", "alignment": "center", "chips": [{ "type": "template", "content": "6 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '6') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '6') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '6') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '6') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "6" } } }, { "type": "template", "content": "12 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '12') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '12') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '12') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '12') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "12" } } }, { "type": "template", "content": "24 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '24') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '24') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '24') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '24') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "24" } } }, { "type": "template", "content": "36 Months", "card_mod": { "style": "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.chart_monthly_months', '36') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.chart_monthly_months', '36') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.chart_monthly_months', '36') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.chart_monthly_months', '36') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n" }, "tap_action": { "action": "call-service", "service": "input_select.select_option", "target": { "entity_id": "input_select.chart_monthly_months" }, "data": { "option": "36" } } }] }, { "type": "custom:config-template-card", "entities": ["input_select.chart_monthly_months"], "card": { "type": "custom:apexcharts-card", "graph_span": "${states['input_select.chart_monthly_months'].state + 'month'}", "span": { "end": "day" }, "header": { "show": false, "title": "Net Bill" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" }, "colors": { "ranges": [{ "from": -100000, "to": 15.0, "color": "#10b981" }, { "from": 15.0, "to": 45.0, "color": "#f59e0b" }, { "from": 45.0, "to": 100000, "color": "#ef4444" }] } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5 }, "dataLabels": { "enabled": "${window.innerWidth < 600 ? parseInt(states['input_select.chart_monthly_months'].state) <= 6 : parseInt(states['input_select.chart_monthly_months'].state) <= 24}", "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_net_grid_cost_rate_cumulative", "name": "Net Bill", "type": "column", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" } }] } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "Yearly" }], "card": { "type": "custom:apexcharts-card", "graph_span": "10y", "span": { "end": "day" }, "header": { "show": false, "title": "Net Bill (Last 10 Years)" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" }, "colors": { "ranges": [{ "from": -100000, "to": 182.5, "color": "#10b981" }, { "from": 182.5, "to": 547.5, "color": "#f59e0b" }, { "from": 547.5, "to": 100000, "color": "#ef4444" }] } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5 }, "dataLabels": { "enabled": true, "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_net_grid_cost_rate_cumulative", "name": "Net Bill", "type": "column", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }] } }, { "type": "conditional", "conditions": [{ "entity": "input_select.financial_view_period", "state": "All-Time" }], "card": { "type": "custom:apexcharts-card", "graph_span": "10y", "span": { "end": "day" }, "header": { "show": false, "title": "Net Bill (All-Time)" }, "apex_config": { "chart": { "height": 280, "zoom": { "enabled": false }, "toolbar": { "show": false } }, "xaxis": { "type": "datetime", "tooltip": { "enabled": false } }, "tooltip": { "enabled": true }, "plotOptions": { "bar": { "borderRadius": 4, "columnWidth": "60%", "dataLabels": { "position": "top" }, "colors": { "ranges": [{ "from": -100000, "to": 500.0, "color": "#10b981" }, { "from": 500.0, "to": 1500.0, "color": "#f59e0b" }, { "from": 1500.0, "to": 100000, "color": "#ef4444" }] } } }, "fill": { "type": "solid", "opacity": 0.5 }, "stroke": { "show": true, "width": 1.5 }, "dataLabels": { "enabled": true, "offsetY": -15, "style": { "colors": ["var(--primary-text-color)"] }, "background": { "enabled": false }, "formatter": "EVAL:function(val) {\n  if (val !== null && val !== undefined && val !== '') {\n      return '\u20ac' + parseFloat(val).toFixed(2);\n  }\n  return '';\n}\n" }, "grid": { "borderColor": "rgba(128, 128, 128, 0.2)", "strokeDashArray": 2 } }, "series": [{ "entity": "sensor.sbf2_net_grid_cost_rate_cumulative", "name": "Net Bill", "type": "column", "show": { "datalabels": true }, "statistics": { "type": "change", "period": "month" }, "group_by": { "func": "sum", "duration": "1y" } }] } }] }] }
];

const getPrefix = (states) => {
  if (!states) return "sensor.sbf2_";
  const sample = Object.keys(states).find((id) =>
    id.endsWith("_system_earnings_rate_daily"),
  );
  if (sample) {
    return sample.split("_system_earnings_rate_daily")[0] + "_";
  }
  return "sensor.sbf2_";
};

class SbfDashboardStrategy extends HTMLElement {
  static async generateDashboard(info) {
    const states = info.hass ? info.hass.states : {};
    const prefix = getPrefix(states);

    // Resolve current dashboard root base URL (e.g. "/lovelace-sbf" or "/solar-financials")
    const parts = window.location.pathname.split("/");
    const dashUrl = parts.length > 1 && parts[1] !== "" ? "/" + parts[1] : "";

    let jsonStr = JSON.stringify(GOLDEN_VIEWS);

    // Replace dummy dashboard navigation paths with dynamic current root URL
    jsonStr = jsonStr.replaceAll("/lovelace-battery/", `${dashUrl}/`);
    jsonStr = jsonStr.replaceAll(
      'navigation_path":"financials-',
      `navigation_path":"${dashUrl}/financials-`,
    );
    jsonStr = jsonStr.replaceAll(
      'navigation_path":"power-',
      `navigation_path":"${dashUrl}/power-`,
    );

    // Replace default sensor prefix if user customized it
    if (prefix !== "sensor.sbf2_") {
      jsonStr = jsonStr.replaceAll("sensor.sbf2_", prefix);
    }

    const finalViews = JSON.parse(jsonStr);

    // Universal Power Breakdown & Subview Auto-Generator for any user
    const totPwr = states[prefix + "total_power_consumption"];
    if (totPwr && totPwr.attributes && totPwr.attributes.tracked_devices) {
      const tracked = totPwr.attributes.tracked_devices;
      const subDevs = totPwr.attributes.sub_devices || [];
      const names = {
        ...(totPwr.attributes.device_names || {}),
        ...(info.config && info.config.device_names
          ? info.config.device_names
          : {}),
      };
      const untrackedSensor = prefix + "untracked_power";

      const getSmartIcon = (name, entityId) => {
        if (
          states[entityId] &&
          states[entityId].attributes &&
          states[entityId].attributes.icon
        )
          return states[entityId].attributes.icon;
        const n = (name || "").toLowerCase();
        if (
          n.includes("kitchen") ||
          n.includes("keuken") ||
          n.includes("dish") ||
          n.includes("vaat")
        )
          return "mdi:countertop";
        if (
          n.includes("living") ||
          n.includes("woon") ||
          n.includes("couch") ||
          n.includes("bank")
        )
          return "mdi:sofa";
        if (n.includes("bed") || n.includes("slaap")) return "mdi:bed";
        if (n.includes("wash") || n.includes("was"))
          return "mdi:washing-machine";
        if (n.includes("tv") || n.includes("tele")) return "mdi:television";
        if (
          n.includes("charg") ||
          n.includes("laad") ||
          n.includes("ev") ||
          n.includes("myenergi")
        )
          return "mdi:ev-station";
        if (
          n.includes("airco") ||
          n.includes("clima") ||
          n.includes("heat") ||
          n.includes("warm") ||
          n.includes("cool")
        )
          return "mdi:air-conditioner";
        if (n.includes("light") || n.includes("lamp") || n.includes("licht"))
          return "mdi:lightbulb";
        if (n.includes("office") || n.includes("kantoor") || n.includes("desk"))
          return "mdi:desk";
        if (n.includes("attic") || n.includes("zolder") || n.includes("roof"))
          return "mdi:home-roof";
        if (n.includes("untracked")) return "mdi:help-network-outline";
        return "mdi:power-plug";
      };

      const slugify = (str) => {
        return (str || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      };

      const makeBreakdownCard = (entityId, label, slug) => ({
        type: "custom:mushroom-template-card",
        entity: entityId,
        primary: label,
        secondary: `{{ states('${entityId}') | float(0) | round(0) }} W`,
        icon: getSmartIcon(label, entityId),
        icon_color: `{% set p = states('${entityId}') | float(0) %} {% if p < 50 %} green {% elif p < 1000 %} orange {% else %} red {% endif %}`,
        layout: "horizontal",
        fill_container: true,
        tap_action: {
          action: "navigate",
          navigation_path: `${dashUrl}/power-${slug}`,
        },
        card_mod: {
          style:
            "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: none !important;\n}\n",
        },
      });

      const makeChip = (option, label) => ({
        type: "template",
        content: label,
        tap_action: {
          action: "call-service",
          service: "input_select.select_option",
          target: { entity_id: "input_select.power_chart_days" },
          data: { option: option },
        },
        card_mod: {
          style: `ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.power_chart_days', '${option}') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.power_chart_days', '${option}') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.power_chart_days', '${option}') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.power_chart_days', '${option}') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n`,
        },
      });

      const makeSubview = (entityId, label, slug) => ({
        type: "panel",
        path: `power-${slug}`,
        title: `${label} Power`,
        subview: true,
        cards: [
          {
            type: "vertical-stack",
            cards: [
              {
                type: "custom:mushroom-template-card",
                entity: entityId,
                primary: `${label} Power`,
                icon_type: "none",
                tap_action: { action: "more-info" },
                card_mod: {
                  style:
                    "ha-card {\n  box-shadow: none !important;\n  border: none !important;\n  background: transparent !important;\n  padding: 16px 16px 4px 16px !important;\n  cursor: pointer !important;\n}\nha-card .primary {\n  font-size: 24px !important;\n  font-weight: 600 !important;\n  letter-spacing: -0.5px !important;\n}\n",
                },
              },
              {
                type: "custom:mushroom-chips-card",
                alignment: "center",
                chips: [
                  makeChip("1", "1 Day"),
                  makeChip("3", "3 Days"),
                  makeChip("7", "7 Days"),
                  makeChip("14", "14 Days"),
                ],
              },
              {
                type: "custom:config-template-card",
                entities: ["input_select.power_chart_days"],
                card: {
                  type: "custom:apexcharts-card",
                  graph_span:
                    "${(states['input_select.power_chart_days'] && states['input_select.power_chart_days'].state && !isNaN(parseInt(states['input_select.power_chart_days'].state)) ? states['input_select.power_chart_days'].state : '7') + 'd'}",
                  header: { show: false },
                  apex_config: {
                    chart: {
                      height: 360,
                      toolbar: { show: false },
                      zoom: { enabled: false },
                    },
                    fill: { type: "solid", opacity: 0.15 },
                    stroke: { show: true, width: 2, curve: "straight" },
                    grid: {
                      borderColor: "rgba(128, 128, 128, 0.2)",
                      strokeDashArray: 2,
                    },
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
                          "${(() => { let d = (states['input_select.power_chart_days'] && !isNaN(parseInt(states['input_select.power_chart_days'].state)) ? parseInt(states['input_select.power_chart_days'].state) : 7); return d <= 3 ? '5minute' : 'hour'; })()}",
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      });

      // 1. Rebuild cards for Tracked Devices grid (excluding subset devices)
      const mainDevs = tracked.filter((dev) => !subDevs.includes(dev));
      const trackedCards = mainDevs.map((dev) => {
        const label =
          names[dev] ||
          dev.replace("sensor.", "").replace("_power", "").replace("_", " ");
        return makeBreakdownCard(dev, label, slugify(label));
      });
      trackedCards.push(
        makeBreakdownCard(untrackedSensor, "Untracked", "untracked"),
      );

      // 2. Rebuild cards for Subset Devices grid
      const subsetCards = subDevs.map((dev) => {
        const label =
          names[dev] ||
          dev.replace("sensor.", "").replace("_power", "").replace("_", " ");
        return makeBreakdownCard(dev, label, slugify(label));
      });

      // Update the power breakdown view in finalViews
      const pwrView = finalViews.find((v) => v.path === "power");
      if (pwrView) {
        const stacks = [];
        const findStacks = (obj) => {
          if (obj && typeof obj === "object") {
            if (
              obj.type === "custom:stack-in-card" &&
              obj.cards &&
              obj.cards[0] &&
              obj.cards[0].type === "grid"
            ) {
              stacks.push(obj.cards[0]);
            }
            Object.values(obj).forEach(findStacks);
          }
        };
        findStacks(pwrView);
        if (stacks.length >= 1) stacks[0].cards = trackedCards;
        if (stacks.length >= 2) stacks[1].cards = subsetCards;
      }

      // Dynamically populate cards for ANY user
      const findAndPopulateCards = (obj) => {
        if (obj && typeof obj === "object") {
          if (obj.cards && Array.isArray(obj.cards)) {
            obj.cards = obj.cards.filter((c) => {
              if (c && c.entity === "sensor.dummy_battery_temp") {
                const batPwr =
                  totPwr && totPwr.attributes
                    ? totPwr.attributes.battery_sensor || ""
                    : "";
                const t1 = batPwr.replace("_power", "_temperature");
                const t2 = batPwr.replace(
                  "_battery_power",
                  "_battery_temperature",
                );
                if (states[t1]) {
                  c.entity = t1;
                  return true;
                }
                if (states[t2]) {
                  c.entity = t2;
                  return true;
                }
                return false;
              }
              return true;
            });
          }

          if (obj.entity === "sensor.dummy_price") {
            if (totPwr.attributes.price_sensor)
              obj.entity = totPwr.attributes.price_sensor;
          }

          if (obj.type === "custom:power-flow-card-plus" && obj.entities) {
            if (
              totPwr.attributes.grid_sensor &&
              obj.entities.grid &&
              typeof obj.entities.grid === "object"
            ) {
              obj.entities.grid.entity = totPwr.attributes.grid_sensor;
            }
            if (
              totPwr.attributes.solar_sensor &&
              obj.entities.solar &&
              typeof obj.entities.solar === "object"
            ) {
              obj.entities.solar.entity = totPwr.attributes.solar_sensor;
            }
            if (
              totPwr.attributes.battery_sensor &&
              obj.entities.battery &&
              typeof obj.entities.battery === "object"
            ) {
              obj.entities.battery.entity = totPwr.attributes.battery_sensor;
              const batPwr = totPwr.attributes.battery_sensor;
              const g1 = batPwr.replace("_power", "");
              const g2 = batPwr + "_soc";
              const g3 = batPwr.replace("_power", "_soc");
              if (
                states[g1] &&
                states[g1].attributes &&
                states[g1].attributes.unit_of_measurement === "%"
              ) {
                obj.entities.battery.state_of_charge = g1;
              } else if (states[g2]) {
                obj.entities.battery.state_of_charge = g2;
              } else if (states[g3]) {
                obj.entities.battery.state_of_charge = g3;
              } else {
                delete obj.entities.battery.state_of_charge;
              }
            }
            if (obj.entities.home && typeof obj.entities.home === "object") {
              obj.entities.home.entity = prefix + "total_power_consumption";
            }
            const flowIndividuals = mainDevs.map((dev) => {
              const label =
                names[dev] ||
                dev
                  .replace("sensor.", "")
                  .replace("_power", "")
                  .replace("_", " ");
              return {
                entity: dev,
                name: label,
                icon: getSmartIcon(label, dev),
                secondary_info: {},
              };
            });
            flowIndividuals.push({
              entity: untrackedSensor,
              name: "Untracked",
              icon: "mdi:help-network-outline",
              secondary_info: {},
            });
            obj.entities.individual = flowIndividuals;
          }
          Object.values(obj).forEach(findAndPopulateCards);
        }
      };
      finalViews.forEach(findAndPopulateCards);

      // Filter out existing power subviews and append newly generated ones
      let newViews = finalViews.filter(
        (v) => !String(v.path || "").startsWith("power-"),
      );

      const allDevs = [...mainDevs, untrackedSensor, ...subDevs];
      allDevs.forEach((dev) => {
        const label =
          dev === untrackedSensor
            ? "Untracked"
            : names[dev] ||
            dev
              .replace("sensor.", "")
              .replace("_power", "")
              .replace("_", " ");
        newViews.push(makeSubview(dev, label, slugify(label)));
      });

      // --- DYNAMIC FINANCIALS INJECTION ---

      // Find the generic Financials view and the Kitchen templates to use as a base
      const finView = finalViews.find((v) => v.path === "financials");
      const templateSubView = finalViews.find(
        (v) => v.path === "financials-template_device",
      );

      const pySlugify = (str) => {
        return (str || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/(^_|_$)/g, "");
      };

      const getDevInfo = (devId) => {
        let label =
          names[devId] ||
          (states[devId] &&
            states[devId].attributes &&
            states[devId].attributes.friendly_name);
        let devTarget = null;

        const costEntity = tracked.find(
          (e) =>
            states[e] &&
            states[e].attributes &&
            states[e].attributes.source_entity_id === devId,
        );

        if (costEntity) {
          const prefixFull = "sensor." + prefix;
          if (
            costEntity.startsWith(prefixFull) &&
            costEntity.endsWith("_cost_rate_daily")
          ) {
            devTarget = costEntity.substring(
              prefixFull.length,
              costEntity.length - 16,
            );
          }

          if (
            !label &&
            states[costEntity].attributes &&
            states[costEntity].attributes.friendly_name
          ) {
            let fn = states[costEntity].attributes.friendly_name;
            if (fn.endsWith(" Cost Rate")) fn = fn.substring(0, fn.length - 10);
            else if (fn.endsWith(" Cost Cumulative"))
              fn = fn.substring(0, fn.length - 16);
            else if (fn.endsWith(" Cost Daily"))
              fn = fn.substring(0, fn.length - 11);
            label = fn;
          }
        }

        if (!label) {
          label = devId
            .replace("sensor.", "")
            .replace(/_power/g, "")
            .replace(/_/g, " ");
        }

        if (!devTarget) {
          devTarget =
            devId === untrackedSensor ? "untracked" : "dev_" + pySlugify(label);
        }

        return { label, devTarget };
      };

      if (finView && templateSubView) {
        const periods = [
          { state: "Daily", suffix: "daily" },
          { state: "Weekly", suffix: "weekly" },
          { state: "Monthly", suffix: "monthly" },
          { state: "Yearly", suffix: "yearly" },
          { state: "All-Time", suffix: "cumulative" },
        ];

        let templateCardStr = "";
        try {
          let foundStr = "";
          const findKitchenCard = (obj) => {
            if (foundStr) return;
            if (obj && typeof obj === "object") {
              if (
                obj.type === "custom:mushroom-template-card" &&
                obj.primary === "Template Device"
              ) {
                foundStr = JSON.stringify(obj);
              }
              Object.values(obj).forEach(findKitchenCard);
            }
          };

          finView.sections.forEach((section) => {
            if (section.cards) {
              const dailyCond = section.cards.find(
                (c) =>
                  c.type === "conditional" &&
                  c.conditions &&
                  c.conditions[0] &&
                  c.conditions[0].state === "Daily",
              );
              if (dailyCond) {
                findKitchenCard(dailyCond);
              }
            }
          });

          templateCardStr = foundStr;
        } catch (e) {
          console.error("Could not find Kitchen card template", e);
        }

        if (templateCardStr) {
          finView.sections.forEach((section) => {
            if (!section.cards) return;
            section.cards.forEach((card) => {
              if (
                card.type === "conditional" &&
                card.conditions &&
                card.conditions.length > 0
              ) {
                const pState = card.conditions[0].state;
                const periodInfo = periods.find((p) => p.state === pState);
                if (!periodInfo) return;

                let stacks = [];
                const findStacks = (obj) => {
                  if (obj && typeof obj === "object") {
                    if (
                      obj.type === "custom:stack-in-card" &&
                      obj.cards &&
                      obj.cards[0] &&
                      obj.cards[0].type === "grid"
                    ) {
                      stacks.push(obj.cards[0]);
                    }
                    Object.values(obj).forEach(findStacks);
                  }
                };
                findStacks(card.card);

                if (stacks.length >= 2) {
                  const makeFinCard = (devId, devName, devTarget) => {
                    const isUntracked = devId === untrackedSensor;

                    let newStr = templateCardStr;
                    newStr = newStr.replace(/_daily/g, "_" + periodInfo.suffix);

                    // Scale thresholds based on the period
                    let multiplier = 1;
                    if (periodInfo.suffix === "weekly") multiplier = 7;
                    else if (periodInfo.suffix === "monthly") multiplier = 30;
                    else if (periodInfo.suffix === "yearly" || periodInfo.suffix === "cumulative") multiplier = 365;

                    if (multiplier !== 1) {
                      newStr = newStr.replace(/c < 0\.5/g, "c < " + (0.5 * multiplier));
                      newStr = newStr.replace(/c < 1\.5/g, "c < " + (1.5 * multiplier));
                    }

                    newStr = newStr.replace(
                      /financials-template_device/g,
                      "financials-" + slugify(devName),
                    );
                    newStr = newStr.replace(
                      /power-template_device/g,
                      "financials-" + slugify(devName),
                    );
                    newStr = newStr.replace(/dev_template_device/g, devTarget);
                    newStr = newStr.replace(
                      /"primary":"Template Device"/g,
                      '"primary":"' + devName + '"',
                    );
                    newStr = newStr.replace(/"Template Device"/g, '"' + devName + '"');
                    newStr = newStr.replace(
                      /"icon":"mdi:countertop"/g,
                      '"icon":"' + getSmartIcon(devName, devId) + '"',
                    );

                    return JSON.parse(newStr);
                  };

                  const finTrackedCards = mainDevs.map((dev) => {
                    const info = getDevInfo(dev);
                    return makeFinCard(dev, info.label, info.devTarget);
                  });
                  finTrackedCards.push(
                    makeFinCard(untrackedSensor, "Untracked", "untracked"),
                  );

                  const finSubsetCards = subDevs.map((dev) => {
                    const info = getDevInfo(dev);
                    return makeFinCard(dev, info.label, info.devTarget);
                  });

                  stacks[0].cards = finTrackedCards;
                  stacks[1].cards = finSubsetCards;
                }
              }
            });
          });
        }

        const isDeviceSubview = (v) => {
          if (!v.path) return false;
          if (!v.path.startsWith("financials-")) return false;
          const sysViews = [
            "financials-total-system-earnings",
            "financials-solar-only-earnings",
            "financials-battery-added-value",
            "financials-effective-cost",
            "financials-net-bill",
          ];
          if (sysViews.includes(v.path)) return false;
          return true;
        };
        newViews = newViews.filter((v) => !isDeviceSubview(v));

        const templateSubviewStr = JSON.stringify(templateSubView);

        const allDevs = [...mainDevs, untrackedSensor, ...subDevs];
        allDevs.forEach((dev) => {
          const info = getDevInfo(dev);
          const label = dev === untrackedSensor ? "Untracked" : info.label;
          const devTarget =
            dev === untrackedSensor ? "untracked" : info.devTarget;

          let subStr = templateSubviewStr;
          subStr = subStr.replace(/dev_template_device/g, devTarget);
          subStr = subStr.replace(/"Template Device"/g, '"' + label + '"');
          subStr = subStr.replace(
            /"Template Device History"/g,
            '"' + label + ' History"',
          );
          subStr = subStr.replace(/"Template Device Costs"/g, '"' + label + ' Costs"');
          subStr = subStr.replace(
            /financials-template_device/g,
            "financials-" + slugify(label),
          );
          subStr = subStr.replace(
            /"icon":"mdi:countertop"/g,
            '"icon":"' + getSmartIcon(label, dev) + '"',
          );

          const parsedSub = JSON.parse(subStr);
          // Inject the stacked pill chips period selector below the device label
          if (
            parsedSub.cards &&
            parsedSub.cards[0] &&
            parsedSub.cards[0].cards
          ) {
            parsedSub.cards[0].cards.forEach((condCard) => {
              console.log(
                "Checking condCard:",
                condCard.type,
                condCard.card ? condCard.card.type : "none",
                "Conditions:",
                condCard.conditions ? condCard.conditions[0].state : "none",
              );
              console.log(
                "Checking condCard:",
                condCard.type,
                condCard.card ? condCard.card.type : "none",
                "Conditions:",
                condCard.conditions ? condCard.conditions[0].state : "none",
              );
              if (condCard.type === "conditional" && condCard.card) {
                if (
                  condCard.card.type === "custom:apexcharts-card" ||
                  condCard.card.type === "custom:config-template-card"
                ) {
                  condCard.card = {
                    type: "vertical-stack",
                    cards: [condCard.card],
                  };
                  console.log(
                    "MUTATED COND CARD!",
                    condCard.conditions[0].state,
                  );
                  console.log(
                    "MUTATED COND CARD!",
                    condCard.conditions[0].state,
                  );
                }
                if (condCard.card.cards) {
                  let insertIndex = Math.max(0, condCard.card.cards.length - 1);
                  const pillsIndex = condCard.card.cards.findIndex(
                    (c) => c.type === "custom:mushroom-chips-card",
                  );
                  if (pillsIndex !== -1) {
                    insertIndex = pillsIndex;
                  }
                  condCard.card.cards.splice(insertIndex, 0, {
                    type: "custom:mushroom-chips-card",
                    alignment: "center",
                    card_mod: {
                      style:
                        "ha-card {\n  background: rgba(var(--rgb-primary-text-color), 0.05);\n  border-radius: 24px;\n  padding: 4px;\n  margin: 0 auto;\n  width: fit-content;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  margin-bottom: 8px !important;\n}\n",
                    },
                    chips: [
                      {
                        type: "template",
                        content: "Daily",
                        card_mod: {
                          style:
                            "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.financial_view_period', 'Daily') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.financial_view_period', 'Daily') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.financial_view_period', 'Daily') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.financial_view_period', 'Daily') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                        },
                        tap_action: {
                          action: "call-service",
                          service: "input_select.select_option",
                          target: {
                            entity_id: "input_select.financial_view_period",
                          },
                          data: { option: "Daily" },
                        },
                      },
                      {
                        type: "template",
                        content: "Weekly",
                        card_mod: {
                          style:
                            "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.financial_view_period', 'Weekly') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.financial_view_period', 'Weekly') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.financial_view_period', 'Weekly') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.financial_view_period', 'Weekly') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                        },
                        tap_action: {
                          action: "call-service",
                          service: "input_select.select_option",
                          target: {
                            entity_id: "input_select.financial_view_period",
                          },
                          data: { option: "Weekly" },
                        },
                      },
                      {
                        type: "template",
                        content: "Monthly",
                        card_mod: {
                          style:
                            "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.financial_view_period', 'Monthly') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.financial_view_period', 'Monthly') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.financial_view_period', 'Monthly') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.financial_view_period', 'Monthly') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                        },
                        tap_action: {
                          action: "call-service",
                          service: "input_select.select_option",
                          target: {
                            entity_id: "input_select.financial_view_period",
                          },
                          data: { option: "Monthly" },
                        },
                      },
                      {
                        type: "template",
                        content: "Yearly",
                        card_mod: {
                          style:
                            "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.financial_view_period', 'Yearly') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.financial_view_period', 'Yearly') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.financial_view_period', 'Yearly') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.financial_view_period', 'Yearly') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                        },
                        tap_action: {
                          action: "call-service",
                          service: "input_select.select_option",
                          target: {
                            entity_id: "input_select.financial_view_period",
                          },
                          data: { option: "Yearly" },
                        },
                      },
                      {
                        type: "template",
                        content: "All",
                        card_mod: {
                          style:
                            "ha-card {\n  background: {{ 'var(--card-background-color)' if is_state('input_select.financial_view_period', 'All-Time') else 'transparent' }} !important;\n  box-shadow: {{ '0 2px 4px rgba(0,0,0,0.1)' if is_state('input_select.financial_view_period', 'All-Time') else 'none' }} !important;\n  border: none !important;\n  --text-color: {{ 'var(--primary-text-color)' if is_state('input_select.financial_view_period', 'All-Time') else 'var(--secondary-text-color)' }};\n  font-weight: {{ '600' if is_state('input_select.financial_view_period', 'All-Time') else '400' }};\n  margin: 0 !important;\n  border-radius: 20px !important;\n  padding: 0px 8px !important;\n}\n",
                        },
                        tap_action: {
                          action: "call-service",
                          service: "input_select.select_option",
                          target: {
                            entity_id: "input_select.financial_view_period",
                          },
                          data: { option: "All-Time" },
                        },
                      },
                    ],
                  });
                }
              }
            });
          }

          newViews.push(parsedSub);
        });
      }

      const mainFinView = newViews.find((v) => v.path === "financials");
      let sourcePill = null;
      if (
        mainFinView &&
        mainFinView.sections &&
        mainFinView.sections[0] &&
        mainFinView.sections[0].cards
      ) {
        sourcePill = mainFinView.sections[0].cards.find(
          (c) =>
            c.type === "custom:mushroom-chips-card" &&
            c.chips &&
            c.chips.length === 5,
        );
      }

      const sysViewsList = [
        "financials-total-system-earnings",
        "financials-solar-only-earnings",
        "financials-battery-added-value",
        "financials-effective-cost",
        "financials-net-bill",
      ];
      newViews.forEach((v) => {
        if (sysViewsList.includes(v.path)) {
          if (v.cards && v.cards[0] && v.cards[0].cards) {
            v.cards[0].cards.forEach((condCard) => {
              if (
                condCard.type === "conditional" &&
                condCard.card &&
                sourcePill
              ) {
                if (
                  condCard.card.type === "custom:apexcharts-card" ||
                  condCard.card.type === "custom:config-template-card"
                ) {
                  condCard.card = {
                    type: "grid",
                    columns: 1,
                    square: false,
                    card_mod: {
                      style:
                        "ha-card { box-shadow: none !important; background: none !important; border: none !important; margin: 0px !important; }",
                    },
                    cards: [
                      JSON.parse(JSON.stringify(sourcePill)),
                      condCard.card,
                    ],
                  };
                } else if (condCard.card.cards) {
                  let insertIndex = Math.max(0, condCard.card.cards.length - 1);
                  const pillsIndex = condCard.card.cards.findIndex(
                    (c) => c.type === "custom:mushroom-chips-card",
                  );
                  if (pillsIndex !== -1) {
                    insertIndex = pillsIndex;
                  }
                  condCard.card.cards.splice(
                    insertIndex,
                    0,
                    JSON.parse(JSON.stringify(sourcePill)),
                  );
                }
              }
            });
          }
        }
      });

      // --- END DYNAMIC FINANCIALS INJECTION ---

      return { views: newViews };
    }

    return { views: finalViews };
  }
}

const safeDefine = (tag, baseClass) => {
  if (!customElements.get(tag)) {
    customElements.define(tag, class extends baseClass { });
  }
};

safeDefine("ll-strategy-solar-battery-financials", SbfDashboardStrategy);
safeDefine("ll-strategy-sbf", SbfDashboardStrategy);
safeDefine(
  "ll-strategy-dashboard-solar-battery-financials",
  SbfDashboardStrategy,
);
safeDefine("ll-strategy-view-solar-battery-financials", SbfDashboardStrategy);
