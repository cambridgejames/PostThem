import * as FileUtil from "@common/util/fileUtil";
import * as SettingsUtil from "@common/util/settingsUtil";
import * as StringUtil from "@common/util/stringUtil";

import * as PluginUtil from "@preload/mainWindow/util/pluginUtil";

export const utils = {
  FileUtil,
  PluginUtil,
  SettingsUtil,
  StringUtil,
};
export type Utils = typeof utils;
