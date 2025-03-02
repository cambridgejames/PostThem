import * as FileUtil from "@common/util/fileUtil";
import * as SettingsUtil from "@common/util/settingsUtil";
import * as StringUtil from "@common/util/stringUtil";

import * as HttpUtil from "@preload/webProcess/util/httpUtil";
import * as PathUtil from "@preload/webProcess/util/pathUtil";
import * as PluginUtil from "@preload/webProcess/util/pluginUtil";

export const utils = {
  FileUtil,
  HttpUtil,
  PathUtil,
  PluginUtil,
  SettingsUtil,
  StringUtil,
};
export type Utils = typeof utils;
