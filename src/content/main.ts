import "./assets/css/mixin.css";
import "./assets/css/main.css";

import * as ElementPlusIconVue from "@element-plus/icons-vue";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const elementApp = createApp(App);
Object.entries(ElementPlusIconVue).forEach(([name, iconComponent]) => {
  elementApp.component(name, iconComponent);
});
elementApp.use(router).mount("#app");
