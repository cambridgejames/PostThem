import { PluginManager } from "@preload/plugin/pluginManager";
import {
  BeforeAspect,
  AfterAspect,
  CreateAspectProxy,
  RegisterBefore,
  RegisterAfter,
  AspectUtilsType,
} from "@sdk/index";

const PLUGIN_MANAGER: PluginManager = PluginManager.getInstance();

/**
 * 将函数注册为切面函数
 *
 * @param target 目标函数
 * @param aspectName 切面名称
 */
const createAspectProxy: CreateAspectProxy = <T extends (...args: any[]) => any>(target: T, aspectName: string): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const realArgs: Parameters<T> = doBefore(aspectName, args);
    const result: ReturnType<T> = target(...realArgs);
    return doAfter(aspectName, result);
  }) as T;
};

/**
 * 执行Before切面处理函数
 *
 * @param aspectName 切点名称
 * @param args 目标函数入参
 */
const doBefore = <T extends any[]>(aspectName: string, args: T): T => {
  return PLUGIN_MANAGER.getBefore(aspectName).reduce<T>((args, beforeAspect): T => {
    try {
      const realArgs: T = beforeAspect.aspect(...args);
      if (realArgs !== undefined && realArgs !== null && typeof realArgs[Symbol.iterator] === "function") {
        return realArgs;
      }
      console.error(`Before calling method "${aspectName}", args returned by plugin "${beforeAspect.pluginId}" is not iterable.`);
    } catch (exception) {
      console.error(`Before calling method "${aspectName}", plugin "${beforeAspect.pluginId}" caused exception.`, exception);
    }
    return args;
  }, args);
};

/**
 * 执行After切面处理函数
 *
 * @param aspectName 切点名称
 * @param returnValue 目标函数返回值
 */
const doAfter = <T>(aspectName: string, returnValue: T): T => {
  return PLUGIN_MANAGER.getAfter(aspectName).reverse().reduce<T>((returnValue, afterAspect): T => {
    try {
      return afterAspect.aspect(returnValue);
    } catch (exception) {
      console.error(`After calling method "${aspectName}", plugin "${afterAspect.pluginId}" caused exception.`, exception);
      return returnValue;
    }
  }, returnValue);
};

/**
 * 注册Before切面处理函数
 *
 * @param aspectName 切点名称
 * @param aspectMethod 切面函数
 */
const registerBefore: RegisterBefore = (aspectName: string, aspectMethod: BeforeAspect): void => {
  PLUGIN_MANAGER.registerBefore(aspectName, aspectMethod);
};

/**
 * 注册After切面处理函数
 *
 * @param aspectName 切点名称
 * @param aspectMethod 切面函数
 */
const registerAfter: RegisterAfter = (aspectName: string, aspectMethod: AfterAspect): void => {
  PLUGIN_MANAGER.registerAfter(aspectName, aspectMethod);
};

export const AspectUtil: AspectUtilsType = {
  createAspectProxy,
  registerBefore,
  registerAfter,
};
