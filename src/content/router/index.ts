import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { ConfigureType, WebviewConfigureItem } from "@interface/common";
import { topBtnList, bottomBtnList } from "@content/router/NavigateConfigure";

/**
 * 生成Webview相关子路由
 *
 * @returns webview路径下的子router配置
 */
const buildWebviewPageRouter = async (): Promise<Array<RouteRecordRaw>> => {
  const webviewConfigureItems: Array<WebviewConfigureItem> = await window.utils.SettingsUtil
    .getConfigure("$.data", ConfigureType.WEBVIEW);
  const solution: Array<RouteRecordRaw> = [{
    path: "",
    name: "defaultTab",
    component: () => import("@content/components/webview/WebviewDefaultTab.vue"),
  }];
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

/**
 * 将导航配置转换成router配置
 *
 * @returns router配置
 */
const buildNavigationRouter = async (): Promise<Array<RouteRecordRaw>> => {
  const solution = [] as Array<RouteRecordRaw>;
  for (const btnItem of [...topBtnList, ...bottomBtnList]) {
    const currentItem = { path: btnItem.url, name: btnItem.name, component: btnItem.component } as RouteRecordRaw;
    if (btnItem.url === "/webview") {
      currentItem.children = await buildWebviewPageRouter();
    }
    solution.push(currentItem);
  }
  return solution;
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: await buildNavigationRouter(),
});
export default router;
