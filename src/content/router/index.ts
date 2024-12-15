import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { ConfigureType, WebviewConfigureItem } from "@interface/common";

/**
 * 生成Webview相关子路由
 */
const buildWebviewPageRouter = async (): Promise<Array<RouteRecordRaw>> => {
  const webviewConfigureItems: Array<WebviewConfigureItem> = await window.util.SettingsUtils
    .getConfigure("$.data", ConfigureType.WEBVIEW);
  const solution: Array<RouteRecordRaw> = [];
  if (webviewConfigureItems?.length > 0) {
    const webviewTabComponent = () => import("@content/components/webview/WebviewTab.vue");
    for (const item of webviewConfigureItems) {
      solution.push({
        path: item.id,
        name: `WEBVIEW_${item.id}`,
        component: webviewTabComponent,
      });
    }
  }
  return solution;
};

const routes: Array<RouteRecordRaw> = [{
  path: "/",
  name: "homePage",
  redirect: "/webview",
}, {
  path: "/webview",
  name: "webviewPage",
  component: () => import("@content/pages/WebviewPage.vue"),
  children: [{
    path: "",
    name: "defaultTab",
    component: () => import("@content/components/webview/WebviewDefaultTab.vue"),
  }, ...await buildWebviewPageRouter()],
}];

console.log(routes);

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
