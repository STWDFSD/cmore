<script setup>
import {
  ChartComponent,
  SeriesDirective,
  SeriesCollectionDirective,
  ScatterSeries,
  Tooltip,
  Legend,
  Highlight,
} from "@syncfusion/ej2-vue-charts";
import { getCurrentInstance } from "vue";
import formatWithSpaces from "@/utils/formatWithSpaces";
import { loadChartTheme } from "./theme-color";

import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const series = computed(() =>
  (store.state.alternatives || []).map(({ MoeScore, TotalCost }) => [
    { MoeScore, TotalCost },
  ])
);

defineOptions({
  provide: {
    chart: [ScatterSeries, Legend, Tooltip, Highlight],
  },
});

const instance = getCurrentInstance();
if (instance) {
  instance.appContext.app.component("ejs-chart", ChartComponent);
  instance.appContext.app.component(
    "e-series-collection",
    SeriesCollectionDirective
  );
  instance.appContext.app.component("e-series", SeriesDirective);
}

const theme = loadChartTheme();

const primaryXAxis = {
  minimum: 0,
  maximum: 100,
  majorGridLines: { width: 0 },
  title: "MOE Score (%)",
};

const chartArea = {
  border: { width: 0 },
};

const primaryYAxis = {
  majorTickLines: { width: 0 },
  lineStyle: { width: 0 },
  rangePadding: "None",
  title: "Total Cost",
};

const marker = {
  width: 12,
  height: 12,
  shape: "Circle",
};

const width = "100%";
const title = "MoE vs Cost";
const legend = { enableHighlight: true };
const tooltip = { enable: true };

const axisLabelRender = (args) => {
  if (args.value >= 1000) {
    args.text = formatWithSpaces(args.value / 1000) + "K";
  }
};
</script>

<template>
  <ejs-chart
    v-if="series.length"
    id="aoa-result-chart"
    :theme="theme"
    :primaryXAxis="primaryXAxis"
    :primaryYAxis="primaryYAxis"
    :chartArea="chartArea"
    :width="width"
    :title="title"
    :tooltip="tooltip"
    :legendSettings="legend"
    :axisLabelRender="axisLabelRender"
  >
    <e-series-collection>
      <e-series
        v-for="({ ID, Title }, index) in store.state.alternatives"
        :key="ID"
        :dataSource="series[index]"
        :name="Title"
        type="Scatter"
        xName="MoeScore"
        yName="TotalCost"
        width="2"
        :marker="marker"
      >
      </e-series>
    </e-series-collection>
  </ejs-chart>
</template>
