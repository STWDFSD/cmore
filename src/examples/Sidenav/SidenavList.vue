<script setup>
import { useRoute } from "vue-router";

import SidenavItem from "./SidenavItem.vue";
import SidenavCard from "./SidenavCard.vue";

const sideRoutes = [
  ["/dashboard", "Dashboard", "tv-2", "info"],
  ["/aoa", "AoA", "chart-bar-32", "danger"],
];

const getRoute = () => {
  const route = useRoute();
  return route.path;
};
</script>

<template>
  <div
    class="collapse navbar-collapse w-auto h-auto h-100"
    id="sidenav-collapse-main"
  >
    <div class="mx-3">
      <sidenav-card />
    </div>
  </div>
  <div class="sidenav-footer">
    <ul class="navbar-nav">
      <li class="nav-item">
        <h6
          class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6 ms-2"
        >
          PAGES
        </h6>
      </li>
      <li
        class="nav-item"
        v-for="([path, label, icon, color], i) in sideRoutes"
        :key="i"
      >
        <sidenav-item
          :to="path"
          :class="{ active: getRoute() === path }"
          :navText="label"
        >
          <template v-slot:icon>
            <i
              :class="
                'ni ni-' + icon + ' text-' + color + ' text-sm opacity-10'
              "
            ></i>
          </template>
        </sidenav-item>
      </li>
    </ul>
  </div>
</template>
