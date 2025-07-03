<script setup>
// --- Imports ---
import { onMounted, ref } from "vue";
import { useStore } from "vuex";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonBadge from "@/components/ArgonBadge.vue";
import { addItem } from "@/actions/addItem";
import { editItem } from "@/actions/editItem";
import { getItems } from "@/actions/getItems";
import { deleteItem } from "@/actions/deleteItem";

// --- Store and State ---
const store = useStore();
const showModal = ref(false);
const newProject = ref({ Title: "", Description: "" });
const projects = ref(null);
const showEditModal = ref(false);
const currentEditProject = ref(null);

// --- Modal Handlers ---
function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
  newProject.value = { Title: "", Description: "" };
}

// --- Add Project ---
async function submitProject() {
  newProject.value.POC = store.state.user.Title;
  addItem("Projects", newProject.value).then((res) => {
    projects.value.push(res);
    closeModal();
  });
}

// --- Edit Modal Handlers ---
function openEditModal(project) {
  currentEditProject.value = { ...project };
  showEditModal.value = true;
}
function closeEditModal() {
  showEditModal.value = false;
  currentEditProject.value = null;
}

// --- Edit Project ---
function submitEditProject() {
  const idx = projects.value.findIndex(
    (p) => p.ID === currentEditProject.value.ID
  );
  if (idx == -1) return;
  projects.value[idx] = currentEditProject.value;
  editItem("Projects", currentEditProject.value.ID, {
    Title: currentEditProject.value.Title,
    Description: currentEditProject.value.Description,
  }).then(() => {
    closeEditModal();
    viewProject(currentEditProject.value);
  });
}

// --- Change Project Status ---
function onChangeStatus(project) {
  project.Status = (project.Status + 1) % 4;
  editItem("Projects", project.ID, { Status: project.Status });
}

// --- Load Projects on Mount ---
onMounted(() => {
  const keys = [
    "ID",
    "Title",
    "Description",
    "Created",
    "Status",
    "Docs",
    "POC",
    "CriteriaKey",
  ];
  getItems("Projects", keys).then((items) => {
    projects.value = items;
  });
});

// --- View Project and Load Details ---
function viewProject(project) {
  store.commit("setProject", project);
  (async function loadProjectDetails(project) {
    if (project == null) return;
    const { ID } = project;
    // Reset related state
    store.commit("setCriterias", null);
    store.commit("setCriteriaValues", null);
    store.commit("setAlternatives", null);
    store.commit("setCostFields", null);
    store.commit("setCosts", null);
    const data = {};
    const setData = (key) => (res) => {
      if (key == "alternatives") {
        res = res.map((it) => ({ ...it, TotalCost: 0, costValues: {} }));
      }
      data[key] = res;
      checkData();
    };
    function checkData() {
      if (Object.keys(data).length == 5) {
        store.commit("setCriterias", data.criterias);
        store.commit("setCriteriaValues", data.criteriaValues);
        store.commit("setAlternatives", data.alternatives);
        store.commit("setCostFields", data.costFields);
        store.commit("setCosts", data.costs);
      }
    }
    // Load all related project data
    getItems(
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
      `?$filter=ProjectID eq '${ID}'`
    ).then(setData("criterias"));
    getItems(
      "CriteriaValues",
      ["ID", "AlternativeID", "CriteriaID", "Value"],
      `?$filter=ProjectID eq ${ID}`
    ).then(setData("criteriaValues"));
    getItems(
      "Alternatives",
      ["ID", "Title", "Description"],
      `?$filter=ProjectID eq ${ID}`
    ).then(setData("alternatives"));
    getItems(
      "CostFields",
      ["ID", "ParentID", "Title", "Unit", "Formula"],
      `?$filter=ProjectID eq ${ID}`
    ).then(setData("costFields"));
    getItems(
      "Costs",
      ["ID", "AlternativeID", "CostFieldID", "Value"],
      `?$filter=ProjectID eq ${ID}`
    ).then(setData("costs"));
  })(project);
}

// --- Delete Project ---
function deleteProject(ID) {
  if (confirm("Are you sure?")) {
    projects.value = projects.value.filter((it) => it.ID != ID);
    deleteItem("Projects", ID);
  }
}
</script>

<template>
  <div class="card">
    <div class="card-header pb-2">
      <div class="d-flex justify-content-between">
        <b>Click Project Title</b>
        <argon-button
          color="success"
          size="sm"
          variant="gradient"
          @click="openModal"
        >
          Add new Project
        </argon-button>
      </div>
    </div>
    <div class="card-body pt-1">
      <!-- <q-table
        bordered
        flat
        title="Projects"
        :rows="projects || []"
        :columns="columns"
        row-key="ID"
        :separator="'vertical'"
      >
        <template v-slot:body-cell-Title="props">
          <q-td :props="props">
            <a
              class="text-light text-lg me-2"
              href="javascript:;"
              @click="openEditModal(props.row)"
            >
              <i class="fa fa-pencil"></i>
            </a>
            <a href="#project-overview" @click="viewProject(props.row)">
              <b>{{ props.row.Title }}</b>
            </a>
            <div class="text-xs ps-2">
              <i>{{ props.row.Description }}</i>
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-Status="props">
          <q-td :props="props">
            <a href="javascript:;">
              <argon-badge
                class="mx-1"
                variant="gradient"
                :color="
                  ['danger', 'warning', 'info', 'secondary'][props.row.Status]
                "
                :title="
                  'Click to change status to \'' +
                  ['Open', 'Pending', 'In Progress', 'Completed'][
                    (props.row.Status + 1) % 4
                  ] +
                  '\''
                "
                @click="onChangeStatus(props.row)"
              >
                {{
                  ["Open", "Pending", "In Progress", "Completed"][
                    props.row.Status
                  ]
                }}
              </argon-badge>
            </a>
          </q-td>
        </template>
        <template v-slot:body-cell-Docs="props">
          <q-td :props="props">
            <a href="javascript:;">
              <i class="fa fa-file-lines text-secondary"></i>
            </a>
          </q-td>
        </template>
        <template v-slot:body-cell-Actions="props">
          <q-td :props="props">
            <a href="javascript:;" @click="deleteProject(props.row.ID)">
              <i class="fa fa-trash"></i>
            </a>
          </q-td>
        </template>
      </q-table> -->

      <div class="table-responsive">
        <table class="table table-bordered align-items-center mb-0">
          <thead>
            <tr class="text-xs text-secondary">
              <th class="font-weight-bolder opacity-7">Project Title</th>
              <th class="text-center font-weight-bolder opacity-7">Dates</th>
              <th class="text-center font-weight-bolder opacity-7">Status</th>
              <th class="text-center font-weight-bolder opacity-7">Docs</th>
              <th class="text-center font-weight-bolder opacity-7">POC</th>
              <th></th>
            </tr>
          </thead>
          <tbody v-if="projects == null">
            <tr>
              <td colspan="6">
                <div class="text-center py-2">
                  <i class="fa fa-spin fa-ring"></i>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr
              v-for="project in projects"
              :key="project.ID"
              class="text-center"
            >
              <td class="ps-3" style="text-align: left !important">
                <a
                  class="text-light me-2"
                  href="javascript:;"
                  @click="openEditModal(project)"
                >
                  <i class="fa fa-pencil"></i>
                </a>
                <a href="#project-overview" @click="viewProject(project)">
                  <b>{{ project.Title }}</b>
                </a>
                <div class="text-xs ps-2">
                  <i>{{ project.Description }}</i>
                </div>
              </td>
              <td class="text-sm">
                {{ new Date(project.Created).toDateString() }}
              </td>
              <td class="align-middle text-sm">
                <a href="javascript:;">
                  <argon-badge
                    class="mx-1"
                    variant="gradient"
                    :color="
                      ['danger', 'warning', 'info', 'secondary'][project.Status]
                    "
                    :title="
                      'Click to change status to \'' +
                      ['Open', 'Pending', 'In Progress', 'Completed'][
                        (project.Status + 1) % 4
                      ] +
                      '\''
                    "
                    @click="onChangeStatus(project)"
                  >
                    {{
                      ["Open", "Pending", "In Progress", "Completed"][
                        project.Status
                      ]
                    }}
                  </argon-badge>
                </a>
              </td>
              <td>
                <a href="javascript:;">
                  <i class="fa fa-file-lines text-secondary"></i>
                </a>
              </td>
              <td>{{ project.POC }}</td>
              <td class="text-xs">
                <a href="javascript:;" @click="deleteProject(project.ID)">
                  <i class="fa fa-trash"></i>
                </a>
              </td>
            </tr>
            <tr class="text-xs">
              <td colspan="6">{{ projects.length || "No" }} projects found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <!-- Modal -->
  <transition name="slide-modal">
    <div v-if="showModal" class="custom-modal-backdrop">
      <div class="custom-modal">
        <div class="custom-modal-header bg-gradient-success">
          <span>Add New Project</span>
        </div>
        <div class="custom-modal-body">
          <form @submit.prevent="submitProject">
            <div class="form-group mb-3">
              <label for="project-title" class="form-label">
                Project Title
              </label>
              <input
                id="project-title"
                v-model="newProject.Title"
                type="text"
                class="form-control"
                required
                autocomplete="off"
              />
            </div>
            <div class="form-group mb-4">
              <label for="project-description" class="form-label">
                Description
              </label>
              <textarea
                id="project-description"
                v-model="newProject.Description"
                class="form-control"
                rows="3"
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
              <button type="submit" class="btn btn-primary">Add Project</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
  <!-- Edit Modal -->
  <transition name="slide-modal">
    <div v-if="showEditModal" class="custom-modal-backdrop">
      <div class="custom-modal">
        <div class="custom-modal-header bg-gradient-info">
          <span>Edit Project</span>
        </div>
        <div class="custom-modal-body">
          <form @submit.prevent="submitEditProject">
            <div class="form-group mb-3">
              <label for="edit-project-title" class="form-label"
                >Project Title</label
              >
              <input
                id="edit-project-title"
                v-model="currentEditProject.Title"
                type="text"
                class="form-control"
                required
                autocomplete="off"
              />
            </div>
            <div class="form-group mb-4">
              <label for="edit-project-description" class="form-label"
                >Description</label
              >
              <textarea
                id="edit-project-description"
                v-model="currentEditProject.Description"
                class="form-control"
                rows="3"
                required
              ></textarea>
            </div>
            <div class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-light me-2"
                @click="closeEditModal"
              >
                Close
              </button>
              <button type="submit" class="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>
