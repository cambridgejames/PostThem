import { PluginManifest } from "@preload/plugin/interface/manifestInterface";
import * as FileUtil from "@preload/util/fileUtil";
import * as path from "node:path";

/**
 * 插件preload入口文件类型定义
 */
interface PluginPreloadEntry {
  onMount?(): void;
}

/**
 * 已加载的插件详细信息
 */
class ManagedPlugin implements PluginPreloadEntry {
  public readonly manifest: PluginManifest;
  private readonly preloadEntry?: PluginPreloadEntry;
  // private readonly webEntry?: string;

  /**
   * 实例化插件
   *
   * @param manifest 插件配置信息
   * @param pluginPath 插件根目录
   */
  constructor(manifest: PluginManifest, pluginPath: string) {
    this.manifest = Object.freeze(manifest);
    if (manifest.entry.preload) {
      const preloadEntry: string = path.resolve(FileUtil.getConfigPath(path.join(pluginPath, manifest.entry.preload)));
      this.preloadEntry = require(preloadEntry) as PluginPreloadEntry;
    }
  }

  async onMount(): Promise<void> {
    setTimeout(() => this.preloadEntry?.onMount?.(), 1);
  }
}

/**
 * 插件管理器
 */
export class PluginManager {
  private static INSTANCE: PluginManager;
  private readonly managerPluginMap: Map<string, ManagedPlugin> = new Map();

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
   * 注册插件
   *
   * @param manifest 插件配置信息
   * @param pluginPath 插件根目录
   */
  public register(manifest: PluginManifest, pluginPath: string): void {
    if (this.managerPluginMap.has(manifest.uniqueId)) {
      console.warn(`Plugin '${manifest.uniqueId}' already registered and will be overwritten.`);
    }
    const managedPlugin: ManagedPlugin = new ManagedPlugin(manifest, pluginPath);
    this.managerPluginMap.set(manifest.uniqueId, managedPlugin);
    managedPlugin.onMount().then(() => {});
    console.log(`Registered plugin: "${manifest.name}".`);
  }
}
