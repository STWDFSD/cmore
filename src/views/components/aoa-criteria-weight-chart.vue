<script setup>
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  PieSeries,
  AccumulationTooltip,
  AccumulationDataLabel,
  AccumulationLegend,
} from "@syncfusion/ej2-vue-charts";
import { loadChartTheme, roundedCornnerPointRender } from "./theme-color";
import { computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import formatWithSpaces from "@/utils/formatWithSpaces";

const props = defineProps({
  mainCriteria: {
    type: Object,
    required: true,
  },
});

defineOptions({
  provide: {
    accumulationchart: [
      AccumulationLegend,
      PieSeries,
      AccumulationDataLabel,
      AccumulationTooltip,
    ],
  },
});

const store = useStore();

const criterias = computed(() =>
  props.mainCriteria?.ID
    ? store.state.criterias.filter((it) => it.ParentID == props.mainCriteria.ID)
    : []
);

const seriesData = computed(() =>
  criterias.value.map(({ Title, Weight }) => ({
    x: Title,
    y: formatWithSpaces(100 * Weight),
  }))
);

const annotations = computed(() =>
  criterias.value.map(({ Title, Weight }) => ({
    content: `<div style="padding: 5px; font-size: 12px; color: #fff;">${100 * Weight}%</div>`,
    region: "Series",
    coordinateUnits: "Point",
    x: Title,
    y: 100 * Weight,
  }))
);

const theme = loadChartTheme();
const chartArea = { border: { width: 0 } };
const dataLabel = {
  visible: true,
  position: "Outside",
  name: "x",
  enableRotation: true,
  connectorStyle: { length: "20px", type: "Curve" },
  font: { fontWeight: "600" },
  textWrap: "Wrap",
};
const border = { width: 3 };
const borderRadius = 8;
const animation = { enable: true };
const tooltip = {
  enable: true,
  header: "",
  format: "${point.x}: <b>${point.y}%</b>",
  enableHighlight: true,
};

const width = "100%";
const legendSettings = { visible: false };

function pointRender(args) {
  roundedCornnerPointRender(args);
}

const instance = getCurrentInstance();
if (instance) {
  instance.appContext.app.component(
    "ejs-accumulationchart",
    AccumulationChartComponent
  );
  instance.appContext.app.component(
    "e-accumulation-series-collection",
    AccumulationSeriesCollectionDirective
  );
  instance.appContext.app.component(
    "e-accumulation-series",
    AccumulationSeriesDirective
  );
}
</script>

<template>
  <ejs-accumulationchart
    v-if="criterias.length"
    id="aoa-criteria-weight-chart"
    :theme="theme"
    :chartArea="chartArea"
    :pointRender="pointRender"
    :annotations="annotations"
    :tooltip="tooltip"
    :enableBorderOnMouseMove="true"
    :width="width"
    :title="props.mainCriteria?.Title"
    :subTitle="props.mainCriteria?.Description"
    :enableSmartLabels="true"
    :legendSettings="legendSettings"
  >
    <e-accumulation-series-collection>
      <e-accumulation-series
        type="Pie"
        xName="x"
        yName="y"
        innerRadius="60%"
        :dataSource="seriesData"
        :dataLabel="dataLabel"
        :border="border"
        :animation="animation"
        :borderRadius="borderRadius"
      />
    </e-accumulation-series-collection>
  </ejs-accumulationchart>
</template>
