import { Logger } from "@sdk/index";
import { LoggerChannel } from "@common/model/ipcChannelModels";
import { AnyFunction, AsyncFunction, IpcReturnMessage } from "@interface/common";
import { RenderLogger } from "@preload/common/util/loggerUtil";
import { callRender, callRenderAsync, registerOnRender } from "@preload/common/util/ipcRenderUtil";
import { ForwardedRenderApi } from "@preload/common/forwardedRenderApi";

import * as StringUtil from "@common/util/stringUtil";

const LOGGER: Logger = RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);

/**
 * 只允许执行一次的目标函数
 *
 * @template T 目标函数类型
 */
class TargetProxy<T extends (...args: any[]) => any> {
  private readonly _target: T;
  public readonly traceId: string;

  private _called: boolean = false;
  private _targetResult?: ReturnType<T>;
  private _exception?: Error;

  public constructor(target: T) {
    this._target = target;
    this.traceId = crypto.randomUUID();
  }

  /**
   * 执行目标函数
   *
   * @param {Parameters<T>} args 入参
   * @returns {ReturnType<T>} 返回值
   */
  public call(...args: Parameters<T>): ReturnType<T> {
    if (this._called) {
      if (this._exception) {
        throw this._exception;
      }
      return this._targetResult!;
    }
    this._called = true;
    try {
      this._targetResult = this._target(...args);
      return this._targetResult!;
    } catch (exception) {
      this._exception = exception instanceof Error ? exception : new Error(exception);
      throw this._exception;
    }
  }
}

/**
 * 目标函数代理类
 *
 * @template T 目标函数类型
 */
class ProxyManager<T extends AnyFunction> {
  private static INSTANCE: ProxyManager<any>;

  private readonly _proxyMap: Map<string, T> = new Map();
  private readonly _proxyTraceMap: Map<string, Map<string, TargetProxy<T>>> = new Map();

  private constructor() {
    const proceedTargetByTraceId = async (aspectName: string, traceId: string, ...args: any[]): Promise<any> => {
      if (!this._proxyMap.has(aspectName) || !this._proxyTraceMap.get(aspectName)?.has(traceId)) {
        throw new Error(`Proceed target failed: aspect "${aspectName}" not found.`);
      }
      const target: TargetProxy<T> = this._proxyTraceMap.get(aspectName)!.get(traceId)!;
      return target.call(...args as Parameters<T>);
    };
    registerOnRender(ForwardedRenderApi.MAIN_WINDOW_PLUGIN_PROXY_TARGET_PROCEED, proceedTargetByTraceId);
  }

  /**
   * 获取目标函数代理类实例
   *
   * @template T aaa
   * @return {ProxyManager<T>} 目标函数代理类实例
   */
  public static getInstance<T extends AnyFunction>(): ProxyManager<T> {
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
   * @returns {AsyncFunction<T>} 目标函数的代理
   */
  public registerProxy(target: T, aspectName: string): AsyncFunction<T> {
    if (StringUtil.isEmpty(aspectName)) {
      LOGGER.warn("Skip to create proxy, aspect name is empty.");
      return target;
    }
    if (this._proxyMap.has(aspectName)) {
      LOGGER.warn(`Create proxy, aspect name "${aspectName}" conflict, it will be overwrite.`);
    }
    this._proxyMap.set(aspectName, target);
    this._proxyTraceMap.set(aspectName, new Map());
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      if (this._proxyMap.get(aspectName) !== target || !this._proxyTraceMap.has(aspectName)) {
        LOGGER.warn(`Skip to call proxy, target proxy of "${aspectName}" not found. The original function will be executed.`);
        return target(...args); // 如果代理被移除，就直接执行原函数
      }
      const targetProxy: TargetProxy<T> = new TargetProxy(target);
      try {
        this._proxyTraceMap.get(aspectName)!.set(targetProxy.traceId, targetProxy);
        return await this.doProxy(targetProxy, aspectName, ...args);
      } finally {
        this._proxyTraceMap.get(aspectName)!.delete(targetProxy.traceId);
      }
    }) as ((...args: Parameters<T>) => Promise<ReturnType<T>>);
  }

  /**
   * 调用插件函数
   *
   * @param {TargetProxy<T>} target 目标函数
   * @param {string} aspectName 被调函数名称
   * @param {Parameters<T>} args 参数
   * @returns {Promise<ReturnType<T>>} 返回值
   */
  private async doProxy(target: TargetProxy<T>, aspectName: string, ...args: Parameters<T>): Promise<ReturnType<T>> {
    const result: IpcReturnMessage<ReturnType<T>> = await this.callRender(aspectName, target.traceId, ...args);
    if (!result.status) {
      const throwable = new Error(result.message);
      if (result.error) {
        throwable.cause = result.error;
      }
      LOGGER.error(`Call proxy ${aspectName} failed: ${result.message}. The original function will be executed.\n`, throwable);
      return target.call(...args); // 发生异常后降级为执行原函数
    }
    return result.data!;
  }

  /**
   * 调用插件函数
   *
   * @param {string} aspectName 被调函数名称
   * @param {string} traceId 请求Id
   * @param {Parameters<T>} args 参数
   * @returns {Promise<IpcReturnMessage<ReturnType<T>>>} 返回值
   */
  private async callRender(aspectName: string, traceId: string, ...args: Parameters<T>): Promise<IpcReturnMessage<ReturnType<T>>> {
    return await callRenderAsync(ForwardedRenderApi.PLUGIN_WINDOW_CALL_ASPECT_PROXY, aspectName, traceId, ...args);
  }
}

/**
 * 将函数注册为切面函数
 *
 * @template T 目标函数类型
 * @param {T} target 目标函数
 * @param {string} aspectName 切面名称
 * @returns {((...args: Parameters<T>) => Promise<ReturnType<T>>)} 目标函数的代理
 */
export const createAspectProxy = <T extends (...args: any[]) => any>(target: T, aspectName: string):
  ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return ProxyManager.getInstance<T>().registerProxy(target, aspectName);
};

/**
 * 扫描并加载插件
 */
export const loadPlugins = async (): Promise<void> => {
  callRender(ForwardedRenderApi.PLUGIN_WINDOW_LOAD_ALL_PLUGINS);
  LOGGER.info("Start loading plugins.");
};
