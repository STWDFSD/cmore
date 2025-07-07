<script setup>
// --- Imports ---
import { computed } from "vue";
import { useStore } from "vuex";
import aoaResultChart from "./aoa-result-chart.vue";
import aoaAlternatives from "./aoa-alternatives.vue";

// --- Store State ---
const store = useStore();
const project = computed(() => store.state.project);
</script>

<template>
  <!-- Project overview content -->
  <div id="project-overview">
    <div class="mb-4">
      <div class="p-3 pt-2 pb-0">
        <i class="fa-solid fa-file-circle-check fa-2x me-2"></i>
        <b class="text-lg">
          {{ project.Title }}
        </b>
        <div class="mt-2 ms-2">
          <span>Project description</span>
          <u class="text-success ms-2">
            {{ project.Description || "No description." }}
          </u>
          <br />
          <span>Created by</span>
          <u class="text-success mx-2">
            {{ project.POC }}
          </u>
          <span>on</span>
          <u class="text-success ms-2">
            {{ new Date(project.Created).toDateString() }}
          </u>
        </div>
      </div>
      <hr />
    </div>
    <div class="pt-0">
      <div class="row">
        <!-- Alternatives list -->
        <div class="col-md-6">
          <aoa-alternatives />
        </div>
        <!-- Result chart -->
        <div class="col-md-6">
          <aoa-result-chart />
        </div>
      </div>
    </div>
  </div>
</template>
