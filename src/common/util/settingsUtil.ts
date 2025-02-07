import { JSONPath } from "jsonpath-plus";
import { Configure, ConfigureType } from "@interface/common";
import * as FileUtil from "@common/util/fileUtil";
import * as StringUtil from "@common/util/stringUtil";

import * as path from "path";

import DefaultConfigure from "@preload/configure";

const CONFIG_FILE_PATH: string = "configure";
const CONFIG_FILE_NAME_SUFFIX: string = ".user.json";
// const CONFIG_FILE_INDENTATION: number = 2;

/**
 * 配置文件枚举相关信息
 */
interface ConfigureTypeInfo {
  // 文件名前缀
  name: string;
}

const ConfigureTypeMap: { [key in ConfigureType]: ConfigureTypeInfo } = {
  [ConfigureType.SETTINGS]: {
    name: "settings",
  },
  [ConfigureType.WEBVIEW]: {
    name: "webview",
  },
};

/**
 * 读取用户配置文件
 *
 * @param configureType 配置类型
 */
export const readConfigureFile = async <T> (configureType: ConfigureType): Promise<Configure<T>> => {
  try {
    const pathToFile = path.join(CONFIG_FILE_PATH, ConfigureTypeMap[configureType]?.name + CONFIG_FILE_NAME_SUFFIX);
    const userConfigure = await FileUtil.readFile(pathToFile);
    return StringUtil.isEmpty(userConfigure) ? DefaultConfigure[configureType] : JSON.parse(userConfigure);
  } catch (error) {
    return DefaultConfigure[configureType];
  }
};

/**
 * 根据JSONPath获取配置
 *
 * @param jsonPathStr JSONPath
 * @param configureType 配置类型
 */
export const getConfigure = async (jsonPathStr: string, configureType: ConfigureType): Promise<any> => {
  const userConfigJSON: Configure<unknown> = await readConfigureFile(configureType) as Configure<unknown>;
  const result: Array<any> = JSONPath({ path: jsonPathStr, json: userConfigJSON });
  return result.length ? result[0] : null;
};
