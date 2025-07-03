<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";

import ArgonButton from "@/components/ArgonButton.vue";
import aoaCriteriaWeightChart from "./aoa-criteria-weight-chart.vue";
import aoaGraph from "./aoa-graph.vue";
import aoaCriteriasTable from "./aoa-criterias-table.vue";

import formatWithSpaces from "@/utils/formatWithSpaces";
import { addItem } from "@/actions/addItem";
import { getItems } from "@/actions/getItems";

const store = useStore();

const project = computed(() => store.state.project);
const criterias = computed(() => store.state.criterias);

const showModal = ref(false);
const newCriteria = ref({
  Title: "",
  Description: "",
});
const mainCriteria = ref({});
const showTemplateModal = ref(false);
const useExistingTemplate = ref(false);
const criteriaTemplates = ref([]);
const newCriteriaTemplate = ref({
  Title: "",
  ID: 0,
});

// START Add Modal
function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
  newCriteria.value = { Title: "", Description: "" };
}
// END Add Modal

// START Submit Add Modal
function submitCriteria() {
  let data = {
    ...newCriteria.value,
    ProjectID: project.value.ID,
    ParentID: mainCriteria.value.ID,
  };

  addItem("Criterias", data).then((res) => {
    store.commit("addCriteria", res);
    closeModal();
  });
}
// END Submit Add Modal

function openTemplateModal() {
  newCriteriaTemplate.value = {
    Title: "",
    ID: 0,
  };
  useExistingTemplate.value = false;
  showTemplateModal.value = true;
}

function closeTemplateModal() {
  showTemplateModal.value = false;
}

async function submitTemplate() {
  if (useExistingTemplate.value) {
    const template = criteriaTemplates.value.find(
      (it) => it.ID == newCriteriaTemplate.value.ID
    );

    if (!template) return alert("Choose a template.");

    const criteras = await getItems(
      "Criterias",
      [
        "ID",
        "Title",
        "Description",
        "Point",
        "DesiredType",
        "LowStandard",
        "HighStandard",
        "ParentID",
      ],
      `?$filter=ProjectID eq '${template.ProjectID}'`
    );

    if (criteras.length == 0) return alert("No criterias found.");

    const ParentIDs = {}; // { oldID: newID }

    for (let i = 0; i < criteras.length; i++) {
      const { ID, ParentID, ...rest } = criteras[i];
      const res = await addItem("Criterias", {
        ...rest,
        ParentID: ParentID == 0 ? 0 : ParentIDs[ParentID],
        ProjectID: project.value.ID,
      });
      store.commit("addCriteria", res);

      ParentIDs[ID] = res.ID;
    }

    closeTemplateModal();
  } else {
    addItem("Criterias", {
      ProjectID: project.value.ID,
      Title: newCriteriaTemplate.value.Title,
      Description: "Criteria Template",
    }).then((res) => {
      store.commit("addCriteria", res);

      closeTemplateModal();
    });
  }
}

onMounted(() => {
  const keys = ["ID", "Title", "ProjectID"];

  getItems("Criterias", keys, "?$filter=ParentID eq 0").then((items) => {
    console.log("criteriaTemplates", items);
    criteriaTemplates.value = items;
  });
});

watch(
  project,
  () => {
    mainCriteria.value =
      (criterias.value || []).find((it) => it.ParentID == 0) || {};
  },
  { immediate: true }
);

watch(
  criterias,
  (criterias) => {
    if (mainCriteria.value.ID) return;
    mainCriteria.value = (criterias || []).find((it) => it.ParentID == 0) || {};
  },
  { immediate: true, deep: true }
);

const nodes = computed(() => {
  return (criterias.value || [])
    .filter(
      (it) =>
        it.ParentID == 0 || criterias.value.some((it1) => it.ParentID == it1.ID)
    )
    .map((it) => ({
      ID: it.ID,
      Title: it.Title,
      Description: formatWithSpaces(100 * it.Weight) + "%",
      ParentID: it.ParentID,
    }));
});

const edges = computed(() => {
  return nodes.value
    .filter((it) => it.ParentID != 0)
    .map((it) => [it.ParentID, it.ID]);
});

const onClick = (ID) => {
  mainCriteria.value =
    criterias.value.find((it) => (ID == 0 ? it.ParentID == 0 : it.ID == ID)) ||
    {};
};
</script>

<template>
  <div class="card" id="project-overview">
    <div class="card-header pb-0">
      <b>Criteria</b>
      <div class="p-3 pt-2">
        <i class="fa-solid fa-file-circle-check fa-2x me-2"></i>
        <b class="text-lg">{{ project.Title }}</b>
      </div>
    </div>
    <div class="card-body pt-0">
      <div v-if="(criterias || []).length == 0" class="mb-3">
        <argon-button
          color="success"
          variant="gradient"
          size="sm"
          :disabled="criterias == null"
          @click="openTemplateModal"
        >
          <span class="me-1 text-light">
            <i class="fa-solid fa-add"></i>
          </span>
          Add or Choose a Criteria Template
        </argon-button>
      </div>
      <div v-else>
        <div class="mb-3">
          <span>This project is using</span>
          <u class="text-success mx-2">
            {{ criterias[0].Title }}
          </u>
          <span>as its criteria template.</span>
        </div>
        <div class="row">
          <div class="col-md-12">
            <aoa-graph :nodes="nodes" :edges="edges" :onClick="onClick" />
          </div>
          <div class="col-md-12 text-right mb-3">
            <argon-button
              color="success"
              size="sm"
              variant="gradient"
              @click="openModal"
            >
              Add new Criteria
            </argon-button>
          </div>
          <div class="col-md-6">
            <aoa-criteria-weight-chart :mainCriteria="mainCriteria" />
          </div>
          <div class="col-md-6">
            <aoa-criterias-table :mainCriteria="mainCriteria" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <transition name="slide-modal">
    <div v-if="showModal" class="custom-modal-backdrop">
      <div class="custom-modal">
        <div class="custom-modal-header bg-gradient-success">
          <span>Add New Criteria</span>
        </div>
        <div class="custom-modal-body">
          <form @submit.prevent="submitCriteria">
            <div class="form-group mb-3">
              <label class="form-label">Criteria Title</label>
              <input
                v-model="newCriteria.Title"
                type="text"
                class="form-control"
                required
                autocomplete="off"
              />
            </div>
            <div class="form-group mb-4">
              <label class="form-label">Description</label>
              <textarea
                v-model="newCriteria.Description"
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
                Add Criteria
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>

  <!-- Choose Criteria Template Modal -->
  <transition name="slide-modal">
    <div v-if="showTemplateModal" class="custom-modal-backdrop">
      <div class="custom-modal">
        <div class="custom-modal-header bg-gradient-success">
          <span>Add or Choose a Criteria Template</span>
        </div>
        <div class="custom-modal-body">
          <div class="form-check form-switch mb-3">
            <input
              id="aoa-moe-score-show-value"
              class="form-check-input"
              type="checkbox"
              :checked="useExistingTemplate"
              @click="useExistingTemplate = !useExistingTemplate"
            />
            <label class="form-check-label mt-1" for="aoa-moe-score-show-value">
              Would you like to select an existing template?
            </label>
          </div>
          <div class="form-group mb-3">
            <label class="form-label">
              {{ useExistingTemplate ? "Search..." : "Template Title" }}
            </label>
            <input
              v-model="newCriteriaTemplate.Title"
              type="text"
              class="form-control"
              placeholder="e.g., Home buying criteria template"
              autocomplete="off"
            />
          </div>
          <div v-if="useExistingTemplate" class="form-group mb-3">
            <select
              class="form-control"
              v-model="newCriteriaTemplate.ID"
              :size="Math.min(Math.max(criteriaTemplates.length, 2), 5)"
            >
              <option
                v-for="item in criteriaTemplates.filter((it) =>
                  it.Title.toLowerCase().includes(
                    newCriteriaTemplate.Title.toLowerCase()
                  )
                )"
                :key="item.ID"
                :value="item.ID"
              >
                {{ item.Title }}
              </option>
            </select>
          </div>
          <div class="d-flex justify-content-end">
            <button
              type="button"
              class="btn btn-light me-2"
              @click="closeTemplateModal"
            >
              Close
            </button>
            <button class="btn btn-primary" @click="submitTemplate">
              {{ useExistingTemplate ? "Choose" : "Add" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
