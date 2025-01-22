import { readDir, readFile } from "@preload/util/fileUtil";
import { PluginManager } from "@preload/plugin/pluginManager";
import {
  checkAndParseManifest,
  ManifestCheckResult,
  PluginManifest,
} from "@preload/plugin/interface/manifestInterface";

import * as path from "node:path";

const PLUGIN_DIR_NAME: string = "plugins";
const PLUGIN_MANIFEST_FILE_NAME: string = "manifest.json";
const PLUGIN_REQUIRED_FILES: string[] = [
  PLUGIN_MANIFEST_FILE_NAME,
];
const PLUGIN_MANAGER: PluginManager = PluginManager.getInstance();

type LoadPlugins = () => Promise<void>;

/**
 * 扫描并加载插件
 */
export const loadPlugins: LoadPlugins = async (): Promise<void> => {
  console.log("Start load plugins.");
  const pluginDirs: string[] = await readDir(PLUGIN_DIR_NAME);
  for (const pluginDir of pluginDirs) {
    const currentManifest: PluginManifest | null = await checkAndLoadPluginManifest(pluginDir);
    if (!currentManifest) {
      continue;
    }
    PLUGIN_MANAGER.register(currentManifest, path.join(PLUGIN_DIR_NAME, pluginDir));
  }
  console.log("Plugins loading completed.");
};

/**
 * 校验并加载manifest.json配置信息
 *
 * @param pluginDirName 插件根目录
 */
const checkAndLoadPluginManifest = async (pluginDirName: string): Promise<PluginManifest | null> => {
  const pathToPluginDir = path.join(PLUGIN_DIR_NAME, pluginDirName);
  const currentPluginFiles: string[] = await readDir(pathToPluginDir);
  for (const requiredPluginFile of PLUGIN_REQUIRED_FILES) {
    if (!currentPluginFiles.includes(requiredPluginFile)) {
      return null;
    }
  }
  const manifestContent = JSON.parse(await readFile(path.join(PLUGIN_DIR_NAME, pluginDirName, PLUGIN_MANIFEST_FILE_NAME)));
  const manifestCheckResult: ManifestCheckResult = await checkAndParseManifest(manifestContent, pathToPluginDir);
  if (!manifestCheckResult.result) {
    console.log(`Check plugin '${pluginDirName}', failed: ${manifestCheckResult.message}`);
    return null;
  }
  const manifest: PluginManifest = manifestCheckResult.data as PluginManifest;
  console.log(`Check plugin: '${manifest.name}', succeeded.`);
  return manifest;
};

/**
 * 插件工具类
 */
export interface PluginUtilType {
  loadPlugins: LoadPlugins;
}

export const PluginUtil: PluginUtilType = {
  loadPlugins,
};

