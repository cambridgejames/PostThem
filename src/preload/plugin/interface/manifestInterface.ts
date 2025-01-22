import * as StringUtil from "@preload/util/stringUtil";
import * as FileUtil from "@preload/util/fileUtil";
import * as path from "node:path";

/**
 * manifest.json文件类型定义
 */
export interface PluginManifest {
  name: string;
  author: string;
  version: string;
  description: string;
  uniqueId: string;
  entry: PluginEntry;
  aspect?: PluginAspect;
}

/**
 * 插件入口类型定义
 */
export interface PluginEntry {
  preload?: string;
  web?: string;
}

/**
 * 插件依赖类型定义
 */
export interface PluginAspect {
  require?: Array<string>;
  provide?: Array<string>;
}

/**
 * manifest文件校验结果
 */
export interface ManifestCheckResult {
  result: boolean;
  message: string;
  data?: PluginManifest;
}

enum ManifestCheckMessage {
  SUCCESS = "success",
  TYPE_ILLEGAL = "Manifest is empty or not supported.",
  ATTRIBUTE_REQUIRED = "Manifest requires attribute \"{0}\", but not provided.",
  ENTRY_FILE_NOT_FOUND = "Configured entry file \"{0}\" not found.",
  ENTRY_FILE_PATH_ILLEGAL = "Configured entry file \"{0}\" illegal.",
  ENTRY_NUMBER_ILLEGAL = "At least 1 entry file needs to be configured, 0 have already been configured.",
  ASPECT_NUMBER_ILLEGAL = "At least 1 API must be configured in require or privileged when aspect is configured.",
}

/**
 * 校验并转换Manifest文件
 *
 * @param manifestContent manifest.json文件内容
 * @param pluginPath 插件根目录
 */
export const checkAndParseManifest = async (manifestContent: object, pluginPath: string): Promise<ManifestCheckResult> => {
  if (!manifestContent || typeof manifestContent !== "object") {
    return buildManifestCheckResult(false, ManifestCheckMessage.TYPE_ILLEGAL);
  }
  const manifest = manifestContent as PluginManifest;
  if (StringUtil.isEmpty(manifest.name)) {
    return buildManifestCheckResult(false, ManifestCheckMessage.ATTRIBUTE_REQUIRED, ["$.name"]);
  }
  if (StringUtil.isEmpty(manifest.author)) {
    return buildManifestCheckResult(false, ManifestCheckMessage.ATTRIBUTE_REQUIRED, ["$.author"]);
  }
  if (StringUtil.isEmpty(manifest.version)) {
    return buildManifestCheckResult(false, ManifestCheckMessage.ATTRIBUTE_REQUIRED, ["$.version"]);
  }
  if (StringUtil.isEmpty(manifest.description)) {
    return buildManifestCheckResult(false, ManifestCheckMessage.ATTRIBUTE_REQUIRED, ["$.description"]);
  }
  if (StringUtil.isEmpty(manifest.uniqueId)) {
    return buildManifestCheckResult(false, ManifestCheckMessage.ATTRIBUTE_REQUIRED, ["$.uniqueId"]);
  }
  // 校验插件入口配置
  const entryCheckResult = await checkEntry(manifest.entry, pluginPath);
  if (!entryCheckResult.result) {
    return entryCheckResult;
  }
  // 校验插件依赖配置
  const aspectCheckResult = checkAspect(manifest.aspect);
  if (!aspectCheckResult.result) {
    return aspectCheckResult;
  }
  return buildManifestCheckResult(true, ManifestCheckMessage.SUCCESS, [], manifest);
};

/**
 * 校验入口文件配置
 *
 * @param entry 入口文件配置
 * @param pluginPath 插件根目录
 */
const checkEntry = async (entry: PluginEntry, pluginPath: string): Promise<ManifestCheckResult> => {
  if (!entry || typeof entry !== "object") {
    return buildManifestCheckResult(false, ManifestCheckMessage.ATTRIBUTE_REQUIRED, ["$.entry"]);
  }
  let hasEntry: boolean = false;
  if (entry.preload) {
    hasEntry = true;
    if (!FileUtil.isLegal(entry.preload)) {
      return buildManifestCheckResult(false, ManifestCheckMessage.ENTRY_FILE_PATH_ILLEGAL, [entry.preload]);
    }
    if (!await FileUtil.isExists(path.join(pluginPath, entry.preload))) {
      return buildManifestCheckResult(false, ManifestCheckMessage.ENTRY_FILE_NOT_FOUND, [entry.preload]);
    }
  }
  if (entry.web) {
    hasEntry = true;
    if (!FileUtil.isLegal(entry.web)) {
      return buildManifestCheckResult(false, ManifestCheckMessage.ENTRY_FILE_PATH_ILLEGAL, [entry.web]);
    }
    if (!await FileUtil.isExists(path.join(pluginPath, entry.web))) {
      return buildManifestCheckResult(false, ManifestCheckMessage.ENTRY_FILE_NOT_FOUND, [entry.web]);
    }
  }
  if (!hasEntry) {
    return buildManifestCheckResult(false, ManifestCheckMessage.ENTRY_NUMBER_ILLEGAL);
  }
  return buildManifestCheckResult(true, ManifestCheckMessage.SUCCESS);
};

/**
 * 校验插件依赖定义
 *
 * @param aspect 插件依赖配置
 */
const checkAspect = (aspect: PluginAspect | undefined): ManifestCheckResult => {
  if (!aspect) {
    return buildManifestCheckResult(true, ManifestCheckMessage.SUCCESS);
  }
  return ((aspect.require?.length || 0) + (aspect.provide?.length || 0) > 0)
    ? buildManifestCheckResult(true, ManifestCheckMessage.SUCCESS)
    : buildManifestCheckResult(false, ManifestCheckMessage.ASPECT_NUMBER_ILLEGAL);
};

/**
 * 构造校验结果
 *
 * @param result 成功/失败
 * @param message 失败原因
 * @param messageArgs 失败原因的填充参数
 * @param data 格式化后的Manifest配置信息
 */
const buildManifestCheckResult = (result: boolean, message: ManifestCheckMessage, messageArgs: string[] = [],
  data?: PluginManifest): ManifestCheckResult => {
  const formatMessage = (message: string, messageArgs: string[]): string => {
    messageArgs.forEach((messageArg, index) => message = message.replaceAll(`{${index}}`, messageArg));
    return message;
  };
  return {
    result,
    message: result ? ManifestCheckMessage.SUCCESS : formatMessage(message, messageArgs),
    data: result ? data : undefined,
  };
};
