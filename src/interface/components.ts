import { Component } from "vue";

/**
 * 侧边栏图标按钮类型定义
 */
export interface NavigateTabItem {
  name: string,
  icon: string,
  url: string,
  enable?: boolean,
  component?: Component,
}
