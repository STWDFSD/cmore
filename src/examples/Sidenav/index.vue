<script setup>
// --- Imports ---
import { computed } from "vue";
import { useStore } from "vuex";
import SidenavList from "./SidenavList.vue";

// --- Store State ---
const store = useStore();
const { state } = store;

// --- Reactive State Mappings ---
const isRTL = computed(() => state.isRTL); // Right-to-left layout flag
const layout = computed(() => state.layout); // Current layout type
const sidebarType = computed(() => state.sidebarType); // Sidebar style/type
const darkMode = computed(() => state.darkMode); // Dark mode enabled?
</script>

<template>
  <!-- Background for default layout (shows only if layout is 'default') -->
  <div
    v-show="layout === 'default'"
    class="min-height-300 position-absolute w-100"
    :class="{ 'bg-transparent': darkMode, 'bg-success': !darkMode }"
  ></div>

  <!-- Sidenav (main sidebar) -->
  <aside
    class="my-3 overflow-auto border-0 sidenav navbar navbar-vertical navbar-expand-xs border-radius-xl"
    :class="[
      isRTL ? 'me-3 rotate-caret fixed-end' : 'fixed-start ms-3', // RTL or LTR
      layout === 'landing' ? 'bg-transparent shadow-none' : '', // Landing page style
      sidebarType, // Custom sidebar type
    ]"
    id="sidenav-main"
  >
    <div class="sidenav-header">
      <!-- Close icon (visible on small screens) -->
      <i
        class="top-0 p-3 cursor-pointer fas fa-times text-secondary opacity-5 position-absolute end-0 d-none d-xl-none"
        aria-hidden="true"
        id="iconSidenav"
      ></i>

      <!-- Logo (links to home) -->
      <router-link class="m-0 navbar-brand" to="/">
        <img
          src="../../assets/img/cmore.svg"
          class="navbar-brand-img h-100"
          alt="CMORE Logo"
        />
      </router-link>
    </div>

    <hr class="mt-0 horizontal dark" />

    <!-- Navigation links -->
    <SidenavList />
  </aside>
</template>
