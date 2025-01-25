import { PluginManifest } from "@preload/plugin/interface/manifestInterface";
import { BeforeAspect } from "@sdk/postThemSdk";

import * as FileUtil from "@preload/util/fileUtil";
import * as StringUtil from "@preload/util/stringUtil";
import * as path from "node:path";

const PLUGIN_DIR_NAME: string = "plugins";

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
  public readonly pluginPath: string;
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
    this.pluginPath = pluginPath;
    if (manifest.entry.preload) {
      const preloadEntry: string = path.resolve(FileUtil.getConfigPath(path.join(PLUGIN_DIR_NAME, pluginPath, manifest.entry.preload)));
      this.preloadEntry = require(preloadEntry) as PluginPreloadEntry;
    }
  }

  async onMount(): Promise<void> {
    setTimeout(() => this.preloadEntry?.onMount?.(), 1);
  }
}

export interface NamedBeforeAspect {
  pluginId: string;
  aspect: BeforeAspect;
}

/**
 * 插件管理器
 */
export class PluginManager {
  private static INSTANCE: PluginManager;
  private readonly managerPluginMap: Map<string, ManagedPlugin> = new Map();
  private readonly beforeAspectMap: Map<string, Array<NamedBeforeAspect>> = new Map();

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
   * 获取插件根目录
   *
   * @return {string} 插件根目录
   */
  public getPluginRoot(): string {
    return PLUGIN_DIR_NAME;
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

  /**
   * 注册Before切面处理方法
   *
   * @param aspectName 切点名称
   * @param aspectMethod 切面方法
   */
  public registerBefore(aspectName: string, aspectMethod: BeforeAspect): void {
    const currentPlugin = this.findByCallStack(3);
    if (!currentPlugin?.manifest.aspect.require.includes(aspectName)) {
      console.warn(`Plugin "${currentPlugin?.manifest.uniqueId}" has no permission to access aspect "${aspectName}".`);
      return;
    }
    const beforeAspects: Array<NamedBeforeAspect> = this.beforeAspectMap.get(aspectName) || [];
    beforeAspects.push({
      pluginId: currentPlugin.manifest.uniqueId,
      aspect: aspectMethod,
    });
    this.beforeAspectMap.set(aspectName, beforeAspects);
  }

  /**
   * 获取Before切面处理方法
   *
   * @param aspectName 切点名称
   * @return {NamedBeforeAspect} Before切面处理方法
   */
  public getBefore(aspectName: string): Array<NamedBeforeAspect> {
    return this.beforeAspectMap.get(aspectName) || [];
  }

  /**
   * 根据调用栈查找插件
   *
   * @param startIndex 调用栈起始查找深度
   * @return {ManagedPlugin | null} 插件
   */
  private findByCallStack(startIndex: number = 2): ManagedPlugin | null {
    const stack: string[] | undefined = new Error().stack?.split("\n").slice(1);
    if (!stack || stack.length <= startIndex) {
      return null;
    }
    const customPluginRoot: string = path.resolve(FileUtil.getConfigPath(PLUGIN_DIR_NAME));
    const findByStackItem = (stackItem: string): ManagedPlugin | null => {
      const match: string[] | null | undefined = stackItem.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
      if (!match || match.length <= 2 || StringUtil.isEmpty(match[2]) || !match[2].startsWith(customPluginRoot)) {
        return null; // 路径校验不成功返回null
      }
      const possiblePlugins: ManagedPlugin[] = [...this.managerPluginMap.values()]
        .filter(plugin => match[2].startsWith(path.join(customPluginRoot, plugin.pluginPath)));
      return possiblePlugins.length > 0 ? possiblePlugins[0] : null;
    };
    return stack.slice(startIndex).reduce<ManagedPlugin | null>((acc, item) => (acc || findByStackItem(item)), null);
  }
}
