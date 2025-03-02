import "@content/assets/css/mixin.css";
import "@content/assets/css/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// 在页面加载前先加载插件
await window.utils.PluginUtil.loadPlugins();

const elementApp = createApp(App);
elementApp.use(router).mount("#app");
