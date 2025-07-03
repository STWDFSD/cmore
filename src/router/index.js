import { createRouter, createWebHistory } from "vue-router";

import Dashboard from "../views/Dashboard.vue";
import Aoa from "../views/Aoa.vue";

// Define application routes
const routes = [
  {
    path: "/",
    redirect: "/dashboard", // Redirect root to dashboard
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/aoa",
    name: "AoA",
    component: Aoa,
  },
  // Add more routes here as needed
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

export default router;
