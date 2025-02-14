import { AspectUtilsType, CreateAspectProxy, Logger } from "@sdk/index";
import { LoggerChannel, RenderName } from "@common/model/ipcChannelModels";
import { IpcReturnMessage } from "@interface/common";
import { RenderLogger } from "@preload/common/util/loggerUtil";
import { callRender, registerOnRender } from "@preload/common/util/ipcRenderUtil";
import { ForwardedRenderApi } from "@preload/common/forwardedRenderApi";

import * as StringUtil from "@common/util/stringUtil";

const LOGGER: Logger = RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);

/**
 * 目标函数代理类
 *
 * @template T 目标函数类型
 */
class ProxyManager<T extends (...args: any[]) => any> {
  private static INSTANCE: ProxyManager<any>;

  private readonly _proxyMap: Map<string, T> = new Map();

  private constructor() {
    registerOnRender(ForwardedRenderApi.MAIN_WINDOW_PLUGIN_PROXY_TARGET_PROCEED, (aspectName: string, ...args: any[]): any => {
      if (!this._proxyMap.has(aspectName)) {
        throw new Error(`Proceed target failed: aspect "${aspectName}" not found.`);
      }
      const target: T = this._proxyMap.get(aspectName)!;
      return target(...args);
    });
  }

  /**
   * 获取目标函数代理类实例
   *
   * @template T aaa
   * @return {ProxyManager<T>} 目标函数代理类实例
   */
  public static getInstance<T extends (...args: any[]) => any>(): ProxyManager<T> {
    if (!this.INSTANCE) {
      this.INSTANCE = new ProxyManager<T>();
    }
    return this.INSTANCE;
  }

  /**
   * 将目标函数注册为切面函数
   *
   * @param {T} target 目标函数
   * @param {string} aspectName 切面名称
   */
  public registerProxy(target: T, aspectName: string): T {
    if (StringUtil.isEmpty(aspectName)) {
      LOGGER.warn("Skip to create proxy, aspect name is empty.");
      return target;
    }
    if (this._proxyMap.has(aspectName)) {
      LOGGER.warn(`Create proxy, aspect name "${aspectName}" conflict, it will be overwrite.`);
    }
    this._proxyMap.set(aspectName, target);
    return ((...args: Parameters<T>): ReturnType<T> => {
      if (this._proxyMap.get(aspectName) !== target) {
        return target(...args); // 如果代理被移除，就直接执行原函数
      }
      const result: IpcReturnMessage<ReturnType<T>> = this.callRender(aspectName, ...args);
      if (!result.status) {
        const throwable = new Error(result.message);
        if (result.error) {
          throwable.cause = result.error;
        }
        LOGGER.error(`Call proxy ${aspectName} failed: ${result.message}\n`, throwable);
        return target(...args); // 发生异常后降级为执行原函数  TODO：1. 原函数有可能多次执行；2. 主窗口注册的Api名称是Electron
      }
      return result.data!;
    }) as T;
  }

  /**
   * 调用插件函数
   *
   * @param {string} aspectName 被调函数名称
   * @param {Parameters<T>} args 参数
   * @returns {IpcReturnMessage<T>} 返回值
   */
  private callRender(aspectName: string, ...args: Parameters<T>): IpcReturnMessage<ReturnType<T>> {
    return callRender(RenderName.PLUGIN, ForwardedRenderApi.PLUGIN_WINDOW_CREATE_ASPECT_PROXY, aspectName, ...args);
  }
}

/**
 * 将函数注册为切面函数
 *
 * @param target 目标函数
 * @param aspectName 切面名称
 */
export const createAspectProxy: CreateAspectProxy = <T extends (...args: any[]) => any>(target: T, aspectName: string): T => {
  return ProxyManager.getInstance<T>().registerProxy(target, aspectName);
};

export const AspectUtil: AspectUtilsType = {
  createAspectProxy,
} as AspectUtilsType;
