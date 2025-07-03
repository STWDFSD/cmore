<script setup>
const props = defineProps({
  mainCriteria: Object,
});

import { computed } from "vue";
import { useStore } from "vuex";

import ArgonButton from "@/components/ArgonButton.vue";

import onChangeValue from "@/utils/onChangeValue";
import formatWithSpaces from "@/utils/formatWithSpaces";
import { deleteItem } from "@/actions/deleteItem";

const store = useStore();

const criterias = computed(() => store.state.criterias);
const filteredCriterias = computed(() => {
  return props.mainCriteria?.ID
    ? criterias.value.filter((it) => it.ParentID === props.mainCriteria.ID)
    : [];
});

// START Delete Criteria
function deleteCriteria(ID) {
  if (confirm("Are you sure?")) {
    deleteRelatives(ID);
  }
}

function deleteRelatives(ID) {
  store.commit("deleteCriteria", ID);
  deleteItem("Criterias", ID);

  criterias.value
    .filter((it) => it.ParentID == ID)
    .forEach(({ ID }) => {
      deleteRelatives(ID);
    });
}
// END Delete Criteria

/**
 * @function decreaseOthers
 * @param ID ID of the criteria that reached 100 points
 * @description 5 points decrease from other filteredCriterias
 */
function decreaseOthers(ID) {
  filteredCriterias.value.map((it) => {
    if (it.ID != ID) {
      store.commit("changeValue", {
        list: "criterias",
        field: "Point",
        ID: it.ID,
        value: it.Point >= 5 ? it.Point - 5 : 0,
      });
    }
  });
}
</script>

<template>
  <div class="table-responsive">
    <table class="table table-bordered align-items-center mb-0">
      <thead>
        <tr class="text-secondary text-xs" style="background: #f8f9fa">
          <th class="opacity-7 px-2 py-0 bg-white">
            <argon-button color="success" variant="gradient" full-width>
              {{ mainCriteria.Title }}
            </argon-button>
          </th>
          <th class="text-center opacity-7 px-1">Weight</th>
          <th class="text-center opacity-7 px-1">Points<br />for Weight</th>
          <th class="text-center opacity-7 px-1">Desired<br />Type</th>
          <th class="text-center opacity-7 px-1">Low<br />Standard</th>
          <th class="text-center opacity-7 px-1">High<br />Standard</th>
          <th></th>
        </tr>
      </thead>
      <tbody v-if="filteredCriterias == null">
        <tr>
          <td colspan="7">
            <div class="text-center py-2">
              <i class="fa fa-spin fa-ring"></i>
            </div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr
          v-for="{
            ID,
            Title,
            Point,
            DesiredType,
            LowStandard,
            HighStandard,
            Description,
            Weight,
          } in filteredCriterias"
          :key="ID"
        >
          <td class="px-3" :title="Description">
            <b
              contenteditable
              @blur="onChangeValue($event, 's', 'criterias', 'Title', ID)"
            >
              {{ Title }}
            </b>
          </td>
          <td class="text-center">
            {{ formatWithSpaces(100 * Weight) }}
            <small> %</small>
          </td>
          <td class="text-center pb-0">
            <input
              type="range"
              :value="Point"
              min="0"
              max="100"
              @change="onChangeValue($event, 'n', 'criterias', 'Point', ID)"
            />
            <i
              v-if="Point < 100"
              class="fa fa-plus text-light"
              style="transform: translate(3px, -2px)"
            ></i>
            <a v-else href="javascript:;" @click="decreaseOthers(ID)">
              <i class="fa fa-plus" style="transform: translate(3px, -2px)"></i>
            </a>
          </td>
          <td class="text-center text-sm">
            <select
              :value="DesiredType"
              @change="
                onChangeValue($event, 's', 'criterias', 'DesiredType', ID)
              "
            >
              <option>Max</option>
              <option>Min</option>
              <option>Yes</option>
              <option>No</option>
              <option>Range</option>
            </select>
          </td>
          <td class="text-center">
            <span v-if="DesiredType == 'Yes'">No</span>
            <span v-else-if="DesiredType == 'No'">Yes</span>
            <span
              v-else
              contenteditable
              @blur="onChangeValue($event, 'n', 'criterias', 'LowStandard', ID)"
            >
              {{ formatWithSpaces(LowStandard) }}
            </span>
          </td>
          <td class="text-center">
            <span v-if="DesiredType == 'Yes'">Yes</span>
            <span v-else-if="DesiredType == 'No'">No</span>
            <span
              v-else
              contenteditable
              @blur="
                onChangeValue($event, 'n', 'criterias', 'HighStandard', ID)
              "
            >
              {{ formatWithSpaces(HighStandard) }}
            </span>
          </td>
          <td class="text-center">
            <a href="javascript:;" class="text-xs" @click="deleteCriteria(ID)">
              <i class="fa fa-trash"></i>
            </a>
          </td>
        </tr>
        <tr>
          <td class="text-xs">
            {{ filteredCriterias.length || "No" }} criterias found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
