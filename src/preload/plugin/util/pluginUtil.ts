import { readDir, readFile } from "@preload/util/fileUtil";
import { PluginManager } from "@preload/plugin/pluginManager";
import * as path from "node:path";

const PLUGIN_DIR_NAME: string = "plugins";
const PLUGIN_MANIFEST_FILE_NAME: string = "manifest.json";
const PLUGIN_REQUIRED_FILES: string[] = [
  PLUGIN_MANIFEST_FILE_NAME,
];
const PLUGIN_MANAGER: PluginManager = PluginManager.getInstance();

interface Manifest {
  name: string;
  author: string;
  version: string;
  description: string;
  uniqueId: string;
  entry: string;
}

type LoadPlugins = () => Promise<void>;

/**
 * 扫描并加载插件
 */
export const loadPlugins: LoadPlugins = async (): Promise<void> => {
  console.log("Start load plugins.");
  const pluginDirs: string[] = await readDir(PLUGIN_DIR_NAME);
  for (const pluginDir of pluginDirs) {
    const currentManifest: Manifest | null = await checkAndLoadPlugin(pluginDir);
    if (!currentManifest) {
      continue;
    }
    console.log(`Found plugin in folder: '${currentManifest.name}'`);
    PLUGIN_MANAGER.register(currentManifest.name);
  }
};

const checkAndLoadPlugin = async (pluginDirName: string): Promise<Manifest | null> => {
  const currentPluginFiles: string[] = await readDir(path.join(PLUGIN_DIR_NAME, pluginDirName));
  for (const requiredPluginFile of PLUGIN_REQUIRED_FILES) {
    if (!currentPluginFiles.includes(requiredPluginFile)) {
      return null;
    }
  }
  const manifest = JSON.parse(await readFile(path.join(PLUGIN_DIR_NAME, pluginDirName, PLUGIN_MANIFEST_FILE_NAME)));
  if (!manifest || !manifest.name) {
    return null; // 没有manifest或者没有定义插件name的，视为非法插件
  }
  if (manifest.entry && !currentPluginFiles.includes(manifest.entry)) {
    return null;
  }
  console.log(`Check plugin: '${manifest.name}', succeeded.`);
  return manifest as Manifest;
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

