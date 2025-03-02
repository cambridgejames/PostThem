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
  aspect: PluginAspect;
}

/**
 * 插件入口类型定义
 */
export interface PluginEntry {
  preload?: string;
  webview: {
    [contributionPoint: string]: string;
  };
}

/**
 * 插件依赖类型定义
 */
export interface PluginAspect {
  require: Array<string>;
  provide: Array<string>;
}

/**
 * 扫描到的插件信息类型定义
 */
export interface ScannedPlugin {
  pluginDir: string;
  pluginManifest: PluginManifest;
}
