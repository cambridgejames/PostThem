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
  webview?: string;
}

/**
 * 插件依赖类型定义
 */
export interface PluginAspect {
  require: Array<string>;
  provide: Array<string>;
}
