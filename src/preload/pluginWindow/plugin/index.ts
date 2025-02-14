import { AspectUtil } from "@preload/pluginWindow/plugin/util/aspectUtil";
import { AspectUtilsType } from "@sdk/index";
import { PluginUtil, PluginUtilType } from "@preload/pluginWindow/plugin/util/pluginUtil";

export interface Plugins {
  AspectUtil: AspectUtilsType;
  PluginUtil: PluginUtilType;
}

export const plugins: Plugins = {
  AspectUtil,
  PluginUtil,
};
