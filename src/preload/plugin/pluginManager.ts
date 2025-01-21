import { PluginManifest } from "@preload/plugin/interface/manifestInterface";
import * as FileUtil from "@preload/util/fileUtil";
import * as path from "node:path";

export class PluginManager {
  private static INSTANCE: PluginManager;

  /**
   * 获取插件管理器实例
   *
   * @return {PluginManager} 插件管理器实例
   */
  public static getInstance(): PluginManager {
    if (!this.INSTANCE) {
      this.INSTANCE = new PluginManager();
    }
    return this.INSTANCE;
  }

  /**
   * TODO: 注册插件
   *
   * @param manifest 插件配置信息
   * @param pluginPath 插件根目录
   */
  public register(manifest: PluginManifest, pluginPath: string): void {
    if (manifest.entry.preload) {
      const preloadEntry = manifest.entry.preload;
      const preloadScript = require(path.resolve(FileUtil.getConfigPath(path.join(pluginPath, preloadEntry))));
      preloadScript.onMount();
    }
    console.log(`Registered plugin: "${manifest.name}".`);
  }
}
