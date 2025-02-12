import { AspectUtil } from "@preload/mainWindow/plugin/util/aspectUtil";
import { AspectUtilsType } from "@sdk/index";
import { PluginUtil, PluginUtilType } from "@preload/mainWindow/plugin/util/pluginUtil";

export interface Plugins {
  AspectUtil: AspectUtilsType;
  PluginUtil: PluginUtilType;
}

export const plugins: Plugins = {
  AspectUtil,
  PluginUtil,
};
