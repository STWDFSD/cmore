<script setup>
const props = defineProps({
  CFID: Number,
  formula: String,
});

import { ref, watch } from "vue";
import { useStore } from "vuex";
import ArgonBadge from "@/components/ArgonBadge.vue";

const store = useStore();

const items = ref([]);
const childFields = ref([]);

function isField(str) {
  return /^\{\d+\}$/.test(str);
}

function parseFormula(CFID, formula, costFields) {
  childFields.value = costFields.filter((it) => it.ParentID == CFID);
  items.value = (formula || "").split(" ").map((item) => {
    if (isField(item)) {
      const id = Number(item.replace(/[{}]/g, ""));
      return childFields.value.find((f) => f.ID == id) || item;
    }
    return item;
  });
}

watch(
  () => [props.CFID, props.formula, store.state.costFields],
  ([CFID, formula, costFields]) => {
    parseFormula(CFID, formula, costFields);
  },
  { immediate: true }
);
</script>

<template>
  <template v-for="(item, idx) in items" :key="idx">
    <argon-badge
      v-if="item && item.ID"
      class="my-1"
      color="secondary"
      style="text-transform: none"
    >
      {{ item.Title }}
    </argon-badge>
    <span v-else class="mx-2">
      {{ item }}
    </span>
  </template>
</template>
