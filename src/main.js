import { loadAccessToken, loadRequestDigest } from "./utils/httpsRequest";

try {
  await loadAccessToken();
  await loadRequestDigest();
} catch (err) {
  document.write(`<h1>😕 Ooops! <i style="font-size: 20px;">${err}</i></h1>`);
  window.stop();
}

import { createApp } from "vue";
import store from "./store";
import router from "./router";
import { Quasar, QTable, QTd } from "quasar";

import "quasar/dist/quasar.css";
import "@quasar/extras/material-icons/material-icons.css";
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";

import App from "./App.vue";
import CmoreDashboard from "./cmore-dashboard";

const appInstance = createApp(App);
appInstance.use(store);
appInstance.use(router);
appInstance.use(CmoreDashboard);
appInstance.use(Quasar, {
  components: {
    QTable,
    QTd,
  },
});
appInstance.mount("#app");

import { registerLicense } from "@syncfusion/ej2-base";

/* eslint-disable */
// eslint-disable-next-line no-unused-vars

registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1NNaF1cWWhOYVF0WmFZfVtg" +
    "cF9DZFZTQGYuP1ZhSXxWdkNhW39adXFWQ2RdVEd9XUs="
);
