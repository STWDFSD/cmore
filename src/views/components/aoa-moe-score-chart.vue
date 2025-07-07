<script setup>
import { ref, getCurrentInstance, computed } from "vue";
import { useStore } from "vuex";

import {
  ChartComponent,
  SeriesDirective,
  SeriesCollectionDirective,
  StackingColumnSeries,
  Legend,
  Category,
  Tooltip,
  Highlight,
  DataLabel,
} from "@syncfusion/ej2-vue-charts";

import { loadChartTheme } from "./theme-color";
import formatWithSpaces from "@/utils/formatWithSpaces";

// Define options for provide
defineOptions({
  provide: {
    chart: [
      StackingColumnSeries,
      Legend,
      Category,
      Tooltip,
      Highlight,
      DataLabel,
    ],
  },
});

// Manually register components
const instance = getCurrentInstance();
if (instance) {
  instance.appContext.app.component("ejs-chart", ChartComponent);
  instance.appContext.app.component(
    "e-series-collection",
    SeriesCollectionDirective
  );
  instance.appContext.app.component("e-series", SeriesDirective);
}

const theme = ref(loadChartTheme());

const store = useStore();

const project = computed(() => store.state.project);
const alternatives = computed(() => store.state.alternatives || []);

const criterias = computed(() => {
  const mainParentID =
    (store.state.criterias || []).find((it) => it.ParentID == 0)?.ID || -1;

  console.log("mainParentID", mainParentID);

  return (store.state.criterias || []).filter(
    (it) => it.ParentID == mainParentID
  );
});

const seriesDatas = computed(() =>
  criterias.value.map(({ ID: CID, Weight }) =>
    alternatives.value.map(({ ID: AID, Title }) => {
      const cValue = (store.state.criteriaValues || []).find(
        (it) => it.AlternativeID == AID && it.CriteriaID == CID
      );
      if (cValue) {
        return {
          x: Title,
          y: formatWithSpaces(100 * cValue._Value * Weight),
        };
      }
      return {
        x: Title,
        y: 0,
      };
    })
  )
);

const primaryXAxis = ref({
  majorGridLines: { width: 0 },
  minorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
  interval: 1,
  lineStyle: { width: 0 },
  labelIntersectAction: "Rotate45",
  valueType: "Category",
});

const primaryYAxis = ref({
  title: "Effectiveness",
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  majorGridLines: { width: 1 },
  minorGridLines: { width: 1 },
  minorTickLines: { width: 0 },
  interval: 20,
});

const chartArea = ref({
  border: {
    width: 1,
  },
});

const tooltip = ref({
  enable: true,
  enableHighlight: true,
  header: "",
  format: "${series.name}<br/>${point.y} %",
});

const marker = ref({
  visible: false,
  dataLabel: {
    visible: false,
  },
});

// const cornerRadius = ref({ topLeft: 4, topRight: 4 });
const legend = ref({ enableHighlight: true, shapeWidth: 9, shapeHeight: 9 });
const border = ref({ color: "#ffffff", width: 1 });
const width = ref("75%");
const title = ref("Performance Contributions to Overall Effectiveness");
const subTitle = ref(project.value.Title);
const stackLabels = ref({
  visible: true,
  format: "{value}%",
  font: { size: "12px" },
});

// Methods
// function load(args) {
//   theme.value = loadChartTheme(args);
// }

function legendClick(args) {
  if (args.series.index === 0) {
    if (args.chart.series[2].visible) {
      args.chart.series[2].cornerRadius.topLeft = 4;
      args.chart.series[2].cornerRadius.topRight = 4;
      args.chart.series[0].cornerRadius.topLeft = 0;
      args.chart.series[0].cornerRadius.topRight = 0;
    } else if (args.chart.series[1].visible) {
      args.chart.series[1].cornerRadius.topLeft = 4;
      args.chart.series[1].cornerRadius.topRight = 4;
      args.chart.series[0].cornerRadius.topLeft = 0;
      args.chart.series[0].cornerRadius.topRight = 0;
    } else {
      args.chart.series[0].cornerRadius.topLeft = 4;
      args.chart.series[0].cornerRadius.topRight = 4;
    }
  }
  if (args.series.index === 1) {
    if (args.chart.series[2].visible) {
      args.chart.series[2].cornerRadius.topLeft = 4;
      args.chart.series[2].cornerRadius.topRight = 4;
      args.chart.series[1].cornerRadius.topLeft = 0;
      args.chart.series[1].cornerRadius.topRight = 0;
    } else if (args.series.visible && args.chart.series[0].visible) {
      args.chart.series[0].cornerRadius.topLeft = 4;
      args.chart.series[0].cornerRadius.topRight = 4;
      args.chart.series[1].cornerRadius.topLeft = 0;
      args.chart.series[1].cornerRadius.topRight = 0;
    } else {
      args.chart.series[1].cornerRadius.topLeft = 4;
      args.chart.series[1].cornerRadius.topRight = 4;
      args.chart.series[0].cornerRadius.topLeft = 0;
      args.chart.series[0].cornerRadius.topRight = 0;
    }
  }

  if (args.series.index === 2) {
    if (!args.series.visible) {
      args.chart.series[2].cornerRadius.topLeft = 4;
      args.chart.series[2].cornerRadius.topRight = 4;
      args.chart.series[1].cornerRadius.topLeft = 0;
      args.chart.series[1].cornerRadius.topRight = 0;
      args.chart.series[0].cornerRadius.topLeft = 0;
      args.chart.series[0].cornerRadius.topRight = 0;
    } else if (args.chart.series[1].visible) {
      args.chart.series[1].cornerRadius.topLeft = 4;
      args.chart.series[1].cornerRadius.topRight = 4;
      args.chart.series[2].cornerRadius.topLeft = 0;
      args.chart.series[2].cornerRadius.topRight = 0;
    } else if (args.series.visible && args.chart.series[0].visible) {
      args.chart.series[0].cornerRadius.topLeft = 4;
      args.chart.series[0].cornerRadius.topRight = 4;
      args.chart.series[2].cornerRadius.topLeft = 0;
      args.chart.series[2].cornerRadius.topRight = 0;
    }
  }
}
</script>

<template>
  <ejs-chart
    id="aoa-moe-score-chart"
    :theme="theme"
    :title="title"
    :subTitle="subTitle"
    :stackLabels="stackLabels"
    :primaryXAxis="primaryXAxis"
    :primaryYAxis="primaryYAxis"
    :chartArea="chartArea"
    :width="width"
    :tooltip="tooltip"
    :legendClick="legendClick"
    :legendSettings="legend"
  >
    <e-series-collection>
      <e-series
        v-for="({ ID, Title }, idx) in criterias"
        :key="ID"
        :name="Title"
        :dataSource="seriesDatas[idx]"
        type="StackingColumn"
        xName="x"
        yName="y"
        columnWidth="0.4"
        :border="border"
        :marker="marker"
        legendShape="Rectangle"
      />
    </e-series-collection>
  </ejs-chart>
</template>
