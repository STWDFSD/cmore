<script setup>
// --- Imports ---
import { onBeforeMount, onMounted, onBeforeUnmount, computed, ref } from "vue";
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

// --- Tab State ---
const activeTab = ref("overview");

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
        <!-- Tabbed Interface -->
        <div class="card mt-4">
          <div class="card-header pb-0">
            <div class="row">
              <div class="col-12">
                <div class="nav-tabs-container">
                  <ul class="nav nav-tabs" id="aoa-tabs" role="tablist">
                    <li class="nav-item" role="presentation">
                      <button
                        class="nav-link"
                        :class="{ active: activeTab === 'overview' }"
                        @click="activeTab = 'overview'"
                        type="button"
                        role="tab"
                        aria-selected="activeTab === 'overview'"
                      >
                        <i class="fa-solid fa-chart-line"></i>
                        <span>Overview</span>
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button
                        class="nav-link"
                        :class="{ active: activeTab === 'criterias' }"
                        @click="activeTab = 'criterias'"
                        type="button"
                        role="tab"
                        aria-selected="activeTab === 'criterias'"
                      >
                        <i class="fa-solid fa-list-check"></i>
                        <span>Criteria</span>
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button
                        class="nav-link"
                        :class="{ active: activeTab === 'moe' }"
                        @click="activeTab = 'moe'"
                        type="button"
                        role="tab"
                        aria-selected="activeTab === 'moe'"
                      >
                        <i class="fa-solid fa-calculator"></i>
                        <span>MOE Score</span>
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button
                        class="nav-link"
                        :class="{ active: activeTab === 'cost' }"
                        @click="activeTab = 'cost'"
                        type="button"
                        role="tab"
                        aria-selected="activeTab === 'cost'"
                      >
                        <i class="fa-solid fa-dollar-sign"></i>
                        <span>Total Cost</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="tab-content" id="aoa-tab-content">
              <!-- Overview Tab -->
              <div
                class="tab-pane fade"
                :class="{ 'show active': activeTab === 'overview' }"
                role="tabpanel"
                aria-labelledby="overview-tab"
              >
                <aoa-overview />
              </div>

              <!-- Criteria Tab -->
              <div
                class="tab-pane fade"
                :class="{ 'show active': activeTab === 'criterias' }"
                role="tabpanel"
                aria-labelledby="criterias-tab"
              >
                <aoa-criterias />
              </div>

              <!-- MOE Score Tab -->
              <div
                class="tab-pane fade"
                :class="{ 'show active': activeTab === 'moe' }"
                role="tabpanel"
                aria-labelledby="moe-tab"
              >
                <aoa-moe-score />
              </div>

              <!-- Total Cost Tab -->
              <div
                class="tab-pane fade"
                :class="{ 'show active': activeTab === 'cost' }"
                role="tabpanel"
                aria-labelledby="cost-tab"
              >
                <aoa-total-cost />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
/* Sophisticated Tab Container */
.nav-tabs-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.nav-tabs-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.nav-tabs {
  border: none;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0;
  margin-bottom: 0;
  white-space: nowrap;
  min-width: 100%;
  display: flex;
  flex-wrap: nowrap;
}

/* Clean Tab Links */
.nav-tabs .nav-link {
  border: none;
  border-radius: 0;
  color: #6c757d;
  font-weight: 500;
  padding: 1rem 1.5rem;
  margin: 0;
  transition: all 0.2s ease;
  position: relative;
  background: transparent;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  min-width: 120px;
  text-align: center;
  flex-shrink: 0;
}

.nav-tabs .nav-link:hover {
  color: #495057;
  background: rgba(0, 0, 0, 0.02);
}

.nav-tabs .nav-link.active {
  color: #495057;
  background: #fff;
  font-weight: 600;
  border-bottom: 2px solid #004466;
}

.nav-tabs .nav-link i {
  margin-right: 0.5rem;
  font-size: 1em;
  opacity: 0.7;
}

.nav-tabs .nav-link.active i {
  opacity: 1;
}

/* Clean Tab Content */
.tab-content {
  padding: 1.5rem 0;
  min-height: 400px;
  background: #fff;
}

.tab-pane {
  transition: opacity 0.2s ease;
}

.tab-pane.fade {
  opacity: 0;
}

.tab-pane.fade.show {
  opacity: 1;
}

.tab-pane.fade.show.active {
  opacity: 1;
}

/* Sophisticated Card Styling */
.card {
  border: 1px solid #e9ecef;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: #fff;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.card-body {
  padding: 0 1.5rem 1.5rem;
}

/* Mobile Responsive Design */
@media (max-width: 768px) {
  .nav-tabs .nav-link {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
    min-width: 100px;
  }

  .nav-tabs .nav-link i {
    margin-right: 0.4rem;
    font-size: 0.9em;
  }

  .nav-tabs .nav-link span {
    font-size: 0.875rem;
  }

  .card-header {
    padding: 0.75rem 1rem;
  }

  .card-body {
    padding: 0 1rem 1rem;
  }

  .tab-content {
    padding: 1rem 0;
  }
}

/* Small Mobile Devices */
@media (max-width: 480px) {
  .nav-tabs .nav-link {
    padding: 0.75rem 0.75rem;
    font-size: 0.8rem;
    min-width: 90px;
  }

  .nav-tabs .nav-link i {
    margin-right: 0.3rem;
    font-size: 0.85em;
  }

  .nav-tabs .nav-link span {
    font-size: 0.8rem;
  }

  .card-header {
    padding: 0.5rem 0.75rem;
  }

  .card-body {
    padding: 0 0.75rem 0.75rem;
  }

  .tab-content {
    padding: 0.75rem 0;
  }
}

/* Extra Small Mobile Devices */
@media (max-width: 360px) {
  .nav-tabs .nav-link {
    padding: 0.625rem 0.5rem;
    font-size: 0.75rem;
    min-width: 80px;
  }

  .nav-tabs .nav-link i {
    margin-right: 0.25rem;
    font-size: 0.8em;
  }

  .nav-tabs .nav-link span {
    font-size: 0.75rem;
  }
}

/* Ensure proper touch targets on mobile */
@media (hover: none) and (pointer: coarse) {
  .nav-tabs .nav-link {
    min-height: 44px; /* Minimum touch target size */
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
