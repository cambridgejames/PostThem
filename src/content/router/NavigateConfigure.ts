import { NavigateTabItem } from "@interface/components";

export const topBtnList: Array<NavigateTabItem> = [
  { name: "sideBar.home", icon: "House", url: "/", component: () => import("@content/pages/HomePage.vue") },
  { name: "sideBar.webview", icon: "DishDot", url: "/webview", component: () => import("@content/pages/WebviewPage.vue") },
];

export const bottomBtnList: Array<NavigateTabItem> = [
  { name: "sideBar.settings", icon: "Setting", url: "/settings", component: () => import("@content/pages/SettingsPage.vue") },
];
