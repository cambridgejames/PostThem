import { AspectUtil, AspectUtilsType } from "@preload/plugin/util/aspectUtil";
import { PluginUtil, PluginUtilType } from "@preload/plugin/util/pluginUtil";

export interface Plugins {
  AspectUtil: AspectUtilsType;
  PluginUtil: PluginUtilType;
}

export const plugins: Plugins = {
  AspectUtil,
  PluginUtil,
};
