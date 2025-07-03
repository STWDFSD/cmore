<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

import ArgonButton from "@/components/ArgonButton.vue";
import AoaTotalCostTable from "./aoa-total-cost-table.vue";
import aoaGraph from "./aoa-graph.vue";
import { addItem } from "@/actions/addItem";
import onChangeValue from "@/utils/onChangeValue";

const store = useStore();

const project = computed(() => store.state.project);
const costFields = computed(() => store.state.costFields || []);
const costs = computed(() => store.state.costs || []);

function addCostField(Title, ParentID, Formula = "this") {
  const data = {
    ParentID,
    Title,
    Formula,
    ProjectID: project.value.ID,
  };

  addItem("CostFields", data).then((res) => {
    store.commit("addCostField", res);

    const idx = store.state.costFields.findIndex((it) => it.ID == ParentID);

    if (idx == -1) return;

    onChangeValue(
      {
        target: {
          value: (store.state.costFields[idx].Formula += ` + {${res.ID}}`),
        },
      },
      "s",
      "costFields",
      "Formula",
      ParentID
    );
  });
}

const nodes = computed(() => {
  return costFields.value.map((it) => ({
    ID: it.ID,
    Title: it.Title,
    Description: `{${it.ID}}`,
    ParentID: it.ParentID,
  }));
});

const edges = computed(() => {
  return costFields.value
    .filter((it) => it.ParentID !== 0)
    .map((it) => [it.ParentID, it.ID]);
});

const onClick = (ID) => {
  window.location.hash = `#aoa-cost-table-${ID}`;
};
</script>

<template>
  <div class="card" id="total-cost">
    <div class="card-header pb-0">
      <b>Total Cost</b>
      <div class="p-3 pt-2">
        <i class="fa-solid fa-file-circle-check fa-2x me-2"></i>
        <b class="text-lg">{{ project.Title }}</b>
      </div>
    </div>
    <div v-if="costs != null" class="card-body pt-0">
      <aoa-graph :nodes="nodes" :edges="edges" :onClick="onClick" />

      <argon-button
        v-if="costFields.length == 0"
        color="success"
        variant="gradient"
        size="sm"
        @click="addCostField('Total Cost', '0', '0')"
      >
        <span class="me-1 text-light">
          <i class="fa-solid fa-add"></i>
        </span>
        Add a table named 'Total Cost'
      </argon-button>

      <aoa-total-cost-table
        v-else
        v-for="{ ID: CFID } in costFields.filter(
          (it) => it.Title == 'Total Cost' || it.Formula != 'this'
        )"
        :key="CFID"
        :CFID="CFID"
        :addCostField="addCostField"
      />
    </div>
    <div v-else class="card-body pt-0">
      <div class="text-center py-2">
        <i class="fa fa-spin fa-ring"></i>
      </div>
    </div>
  </div>
</template>
