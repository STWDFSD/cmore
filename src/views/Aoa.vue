<script setup>
// --- Imports ---
import { onBeforeMount, onMounted, onBeforeUnmount, computed } from "vue";
import { useStore } from "vuex";

import aoaProjects from "./components/aoa-projects.vue";
import aoaOverview from "./components/aoa-overview.vue";
import aoaMoeScore from "./components/aoa-moe-score.vue";
import aoaTotalCost from "./components/aoa-total-cost.vue";
import aoaCriterias from "./components/aoa-criterias.vue";

import setNavPills from "@/assets/js/nav-pills.js";
import setTooltip from "@/assets/js/tooltip.js";

// --- DOM and Store Setup ---
const body = document.getElementsByTagName("body")[0];
const store = useStore();
const project = computed(() => store.state.project);

// --- Lifecycle Hooks for Layout and UI State ---
onMounted(() => {
  store.state.isAbsolute = true;
  setNavPills();
  setTooltip();
});
onBeforeMount(() => {
  store.state.imageLayout = "profile-overview";
  store.state.showNavbar = false;
  store.state.showFooter = true;
  store.state.hideConfigButton = true;
  body.classList.add("profile-overview");
});
onBeforeUnmount(() => {
  store.state.isAbsolute = false;
  store.state.imageLayout = "default";
  store.state.showNavbar = true;
  store.state.showFooter = true;
  store.state.hideConfigButton = false;
  body.classList.remove("profile-overview");
});
</script>

<template>
  <!-- Main AOA analysis page -->
  <main>
    <div class="container-fluid">
      <!-- Header with background image and project info -->
      <div
        class="page-header min-height-300"
        style="
          background-image: url(&quot;https://images.unsplash.com/photo-1531512073830-ba890ca4eba2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80&quot;);
          margin-right: -24px;
          margin-left: -34%;
        "
      >
        <span class="mask bg-gradient-success opacity-6"></span>
      </div>
      <div class="card shadow-lg mt-n6">
        <div class="card-body p-3">
          <div class="row gx-4">
            <div class="col-auto">
              <div class="avatar avatar-xxl position-relative">
                <img
                  src="../assets/img/aoa-240.png"
                  alt="profile_image"
                  class="shadow-sm w-100 border-radius-lg"
                />
              </div>
            </div>
            <div class="col-auto my-auto">
              <div class="h-100">
                <h5 class="mb-1">Analysis of Alternative</h5>
                <p class="mb-0 text-sm opacity-5">
                  A Quantitative Analysis Tool to Make Hard Decision Easy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Main content: project sections -->
    <div class="pt-6 pb-4 container-fluid">
      <aoa-projects />
      <template v-if="project != null">
        <hr class="my-4" />
        <aoa-overview />
        <hr class="my-4" />
        <aoa-criterias />
        <hr class="my-4" />
        <aoa-moe-score />
        <hr class="my-4" />
        <aoa-total-cost />
      </template>
    </div>
  </main>
</template>
