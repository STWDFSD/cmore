<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";

import ArgonButton from "@/components/ArgonButton.vue";
import formatWithSpaces from "@/utils/formatWithSpaces";
import onChangeValue from "@/utils/onChangeValue";
import { addItem } from "@/actions/addItem";
import { deleteItem } from "@/actions/deleteItem";

const store = useStore();

const alternatives = computed(() => store.state.alternatives);
const result = ref({});

watch(
  () => [alternatives.value],
  ([source]) => {
    let moe_cost = (source || []).map(
      ({ MoeScore, TotalCost }) => (100 * MoeScore) / (TotalCost || 1)
    );
    let rank = rankArray(moe_cost);
    result.value = { moe_cost, rank };
  },
  { immediate: true }
);

function rankArray(arr) {
  return arr
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .map((item, rank) => ({ ...item, rank: rank + 1 }))
    .sort((a, b) => a.index - b.index)
    .map((item) => item.rank);
}

const showModal = ref(false);
const newAlternative = ref({ Title: "", Description: "" });

function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
  newAlternative.value = { Title: "", Description: "" };
}
function submitAlternative() {
  let data = {
    ...newAlternative.value,
    ProjectID: store.state.project.ID,
  };

  addItem("Alternatives", data).then((res) => {
    store.commit("addAlternative", {
      ...data,
      ID: res.ID,
      TotalCost: 0,
      costValues: {},
    });
    closeModal();
  });
}

function deleteAlternative(ID) {
  if (confirm("Are you sure?")) {
    store.commit("deleteAlternative", ID);
    deleteItem("Alternatives", ID);
  }
}
</script>

<template>
  <div class="d-flex justify-content-end mb-3">
    <argon-button
      color="success"
      size="sm"
      variant="gradient"
      @click="openModal"
    >
      Add new Alternative
    </argon-button>
  </div>
  <div class="table-responsive">
    <table class="table table-bordered align-items-center mb-0">
      <thead>
        <tr class="text-secondary text-xs" style="background: #f8f9fa">
          <th class="opacity-7">Alternative</th>
          <th class="text-center opacity-7 px-1">
            <a href="#moe-score">
              <i class="fa fa-eye mb-1"></i>
              <br />
              MOE Score
            </a>
          </th>
          <th class="text-center opacity-7 px-1">
            <a href="#total-cost">
              <i class="fa fa-eye mb-1"></i>
              <br />
              Total Cost
            </a>
          </th>
          <th class="text-center opacity-7 px-1">MoE / Cost</th>
          <th class="text-center opacity-7 px-1">Rank</th>
          <th></th>
        </tr>
      </thead>
      <tbody v-if="alternatives == null">
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
          v-for="(
            { ID, Title, Description, MoeScore, TotalCost }, idx
          ) in alternatives"
          :key="ID"
        >
          <td class="px-3" :title="Description">
            <b
              contenteditable
              @blur="onChangeValue($event, 's', 'alternatives', 'Title', ID)"
            >
              {{ Title }}
            </b>
          </td>
          <td class="text-center">
            {{ formatWithSpaces(MoeScore) }}
            <small>%</small>
          </td>
          <td class="text-center prefix-dollor" unit="$">
            {{ formatWithSpaces(TotalCost) }}
          </td>
          <td class="text-center">
            {{ formatWithSpaces(result.moe_cost[idx], 2) }}
          </td>
          <td class="text-center" style="background: #f8f9fa">
            {{ result.rank[idx] }}
          </td>
          <td class="text-center">
            <a
              href="javascript:;"
              class="text-xs"
              @click="deleteAlternative(ID)"
            >
              <i class="fa fa-trash"></i>
            </a>
          </td>
        </tr>
        <tr>
          <td class="text-xs">
            {{ alternatives.length || "No" }} alternatives found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- Modal -->
  <transition name="slide-modal">
    <div v-if="showModal" class="custom-modal-backdrop">
      <div class="custom-modal">
        <div class="custom-modal-header bg-gradient-success">
          <span>Add New Alternative</span>
        </div>
        <div class="custom-modal-body">
          <form @submit.prevent="submitAlternative">
            <div class="form-group mb-3">
              <label class="form-label">Alternative Title</label>
              <input
                v-model="newAlternative.Title"
                type="text"
                class="form-control"
                required
                autocomplete="off"
              />
            </div>
            <div class="form-group mb-4">
              <label class="form-label">Description</label>
              <textarea
                v-model="newAlternative.Description"
                class="form-control"
                rows="2"
                required
              ></textarea>
            </div>
            <div class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-light me-2"
                @click="closeModal"
              >
                Close
              </button>
              <button type="submit" class="btn btn-primary">
                Add Alternative
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>
