import { PluginManager } from "@preload/plugin/pluginManager";
import { BeforeAspect, CreateAspectProxy, RegisterBefore, AspectUtilsType } from "@sdk/postThemSdk";

const PLUGIN_MANAGER: PluginManager = PluginManager.getInstance();

/**
 * 将方法注册为切面方法
 *
 * @param target 目标方法
 * @param aspectName 切面名称
 */
const createAspectProxy: CreateAspectProxy = <T extends (...args: any[]) => any>(target: T, aspectName: string): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const realArgs: Parameters<T> = doBefore(aspectName, args);
    const result = target(...realArgs);
    console.log(`After calling target method, name: ${aspectName}, result: ${result}`);
    return result;
  }) as T;
};

/**
 * 执行Before切面处理方法
 *
 * @param aspectName 切点名称
 * @param args 方法入参
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
 * 注册Before切面处理方法
 *
 * @param aspectName 切点名称
 * @param aspectMethod 切面方法
 */
const registerBefore: RegisterBefore = (aspectName: string, aspectMethod: BeforeAspect): void => {
  PLUGIN_MANAGER.registerBefore(aspectName, aspectMethod);
};

export const AspectUtil: AspectUtilsType = {
  createAspectProxy,
  registerBefore,
};
