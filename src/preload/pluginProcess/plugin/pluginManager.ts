import { PluginManifest } from "@interface/manifest";
import { AfterAspect, AroundAspect, BeforeAspect, Logger } from "@sdk/index";
import { RenderLogger } from "@preload/common/util/loggerUtil";
import { LoggerChannel } from "@common/model/ipcChannelModels";

import * as FileUtil from "@common/util/fileUtil";
import * as StringUtil from "@common/util/stringUtil";
import * as path from "node:path";

const PLUGIN_DIR_NAME: string = "plugins";
const LOGGER: Logger = RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);

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

  private _mounted: boolean = false;
  private _preloadEntry?: PluginPreloadEntry;
  // private readonly webEntry?: string;

  /**
   * 实例化插件
   *
   * @param manifest 插件配置信息
   * @param pluginPath 插件根目录
   */
  public constructor(manifest: PluginManifest, pluginPath: string) {
    this.manifest = Object.freeze(manifest);
    this.pluginPath = pluginPath;
  }

  /**
   * 插件准备事件
   *
   * @returns {Promise<void>}
   */
  public async onMount(): Promise<void> {
    if (this._mounted) {
      LOGGER.warn(`Plugin ${this.manifest.uniqueId} is already mounted.`);
      return;
    }
    setTimeout(() => {
      this.initEntry(); // 只能在mount事件中调用，防止插件管理器校验插件路径失败
      this._mounted = true;
    }, 1);
  }

  /**
   * 初始化插件入口
   *
   * @private
   */
  private initEntry(): void {
    if (!StringUtil.isEmpty(this.manifest.entry.preload)) {
      const preloadEntry: string = path.join(PLUGIN_DIR_NAME, this.pluginPath, this.manifest.entry.preload!);
      this._preloadEntry = require(path.resolve(FileUtil.getConfigPath(preloadEntry))) as PluginPreloadEntry;
      this._preloadEntry?.onMount?.();
    }
  }
}

type BaseAspectType = BeforeAspect | AroundAspect | AfterAspect;
export interface NamedAspect<T extends BaseAspectType> {
  pluginId: string;
  aspect: T;
}

/**
 * 插件管理器
 */
export class PluginManager {
  private static INSTANCE: PluginManager;

  private readonly managedPluginMap: Map<string, ManagedPlugin> = new Map();
  private readonly beforeAspectMap: Map<string, Array<NamedAspect<BeforeAspect>>> = new Map();
  private readonly aroundAspectMap: Map<string, Array<NamedAspect<AroundAspect>>> = new Map();
  private readonly afterAspectMap: Map<string, Array<NamedAspect<AfterAspect>>> = new Map();

  private constructor() {}

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
    if (this.managedPluginMap.has(manifest.uniqueId)) {
      LOGGER.warn(`Plugin '${manifest.uniqueId}' already registered and will be overwritten.`);
      this.removeAspectsByPluginId(manifest.uniqueId);
    }
    const managedPlugin: ManagedPlugin = new ManagedPlugin(manifest, pluginPath);
    this.managedPluginMap.set(manifest.uniqueId, managedPlugin);
    managedPlugin.onMount().then(() => {});
    LOGGER.info(`Registered plugin: "${manifest.name}".`);
  }

  /**
   * 删除指定插件注册过的所有切面
   *
   * @param pluginId 插件Id
   * @private
   */
  private removeAspectsByPluginId(pluginId: string): void {
    const removeAspects = <T extends BaseAspectType>(aspectMap: Map<string, Array<NamedAspect<T>>>, pluginId: string): void => {
      aspectMap.forEach((namedAspects, aspectName) => {
        aspectMap.set(aspectName, namedAspects.filter(namedAspect => namedAspect.pluginId === pluginId));
      });
    };
    removeAspects(this.beforeAspectMap, pluginId);
    removeAspects(this.aroundAspectMap, pluginId);
    removeAspects(this.afterAspectMap, pluginId);
  }

  /**
   * 注册Before切面处理方法
   *
   * @param {string} aspectName 切点名称
   * @param {BeforeAspect} aspectMethod 切面方法
   */
  public registerBefore(aspectName: string, aspectMethod: BeforeAspect): void {
    const currentPlugin = this.findByCallStack(3);
    if (!currentPlugin?.manifest.aspect.require.includes(aspectName)) {
      LOGGER.warn(`Plugin "${currentPlugin?.manifest.uniqueId}" has no permission to access aspect "${aspectName}".`);
      return;
    }
    const beforeAspects: Array<NamedAspect<BeforeAspect>> = this.beforeAspectMap.get(aspectName) || [];
    beforeAspects.push({
      pluginId: currentPlugin.manifest.uniqueId,
      aspect: aspectMethod,
    });
    this.beforeAspectMap.set(aspectName, beforeAspects);
  }

  /**
   * 获取Before切面处理方法
   *
   * @param {string} aspectName 切点名称
   * @return {Array<NamedAspect<BeforeAspect>>} Before切面处理方法
   */
  public getBefore(aspectName: string): Array<NamedAspect<BeforeAspect>> {
    return this.beforeAspectMap.get(aspectName) || [];
  }

  /**
   * 注册Around切面处理方法
   *
   * @param {string} aspectName 切点名称
   * @param {AroundAspect} aspectMethod 切面方法
   */
  public registerAround(aspectName: string, aspectMethod: AroundAspect): void {
    const currentPlugin = this.findByCallStack(3);
    if (!currentPlugin?.manifest.aspect.require.includes(aspectName)) {
      LOGGER.warn(`Plugin "${currentPlugin?.manifest.uniqueId}" has no permission to access aspect "${aspectName}".`);
      return;
    }
    const aroundAspects: Array<NamedAspect<AroundAspect>> = this.aroundAspectMap.get(aspectName) || [];
    aroundAspects.push({
      pluginId: currentPlugin.manifest.uniqueId,
      aspect: aspectMethod,
    });
    this.aroundAspectMap.set(aspectName, aroundAspects);
  }

  /**
   * 获取Around切面处理方法
   *
   * @param {string} aspectName 切点名称
   * @return {Array<NamedAspect<AroundAspect>>} Around切面处理方法
   */
  public getAround(aspectName: string): Array<NamedAspect<AroundAspect>> {
    return this.aroundAspectMap.get(aspectName) || [];
  }

  /**
   * 注册After切面处理方法
   *
   * @param {string} aspectName 切点名称
   * @param {AfterAspect} aspectMethod 切面方法
   */
  public registerAfter(aspectName: string, aspectMethod: AfterAspect): void {
    const currentPlugin = this.findByCallStack(3);
    if (!currentPlugin?.manifest.aspect.require.includes(aspectName)) {
      LOGGER.warn(`Plugin "${currentPlugin?.manifest.uniqueId}" has no permission to access aspect "${aspectName}".`);
      return;
    }
    const afterAspects: Array<NamedAspect<AfterAspect>> = this.afterAspectMap.get(aspectName) || [];
    afterAspects.push({
      pluginId: currentPlugin.manifest.uniqueId,
      aspect: aspectMethod,
    });
    this.afterAspectMap.set(aspectName, afterAspects);
  }

  /**
   * 获取After切面处理方法
   *
   * @param {string} aspectName 切点名称
   * @return {Array<NamedAspect<AfterAspect>>} After切面处理方法
   */
  public getAfter(aspectName: string): Array<NamedAspect<AfterAspect>> {
    return this.afterAspectMap.get(aspectName) || [];
  }

  /**
   * 根据调用栈查找插件
   *
   * @param startIndex 调用栈起始查找深度
   * @return {ManagedPlugin | null} 插件
   * @private
   */
  public findByCallStack(startIndex: number = 2): ManagedPlugin | null {
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
      const possiblePlugins: ManagedPlugin[] = [...this.managedPluginMap.values()]
        .filter(plugin => match[2].startsWith(path.join(customPluginRoot, plugin.pluginPath)));
      return possiblePlugins.length > 0 ? possiblePlugins[0] : null;
    };
    return stack.slice(startIndex).reduce<ManagedPlugin | null>((acc, item) => (acc || findByStackItem(item)), null);
  }
}
