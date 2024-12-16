import "./assets/css/mixin.css";
import "./assets/css/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

createApp(App).use(router).mount("#app");
