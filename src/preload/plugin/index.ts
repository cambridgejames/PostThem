import { AspectUtil } from "@preload/plugin/util/aspectUtil";
import { AspectUtilsType } from "@sdk/postThemSdk";
import { PluginUtil, PluginUtilType } from "@preload/plugin/util/pluginUtil";

export interface Plugins {
  AspectUtil: AspectUtilsType;
  PluginUtil: PluginUtilType;
}

export const plugins: Plugins = {
  AspectUtil,
  PluginUtil,
};
