import {
  ProceedingTarget,
  BeforeAspect,
  AroundAspect,
  AfterAspect,
  CreateAspectProxy,
  RegisterBefore,
  RegisterAround,
  RegisterAfter,
  AspectUtilsType,
  Logger,
} from "@sdk/index";
import { LoggerChannel } from "@common/model/ipcChannelModels";
import { RenderLogger } from "@preload/common/util/loggerUtil";
import { NamedAspect, PluginManager } from "@preload/pluginProcess/plugin/pluginManager";

const PLUGIN_MANAGER: PluginManager = PluginManager.getInstance();
const LOGGER: Logger = RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);

/**
 * 切面目标函数代理类
 */
class ProceedingTargetImpl<T extends (...args: any[]) => any> implements ProceedingTarget<T> {
  private readonly _aspectName: string;
  private readonly _args: Parameters<T>;
  private readonly _target: T;
  private readonly _aspects: Array<NamedAspect<AroundAspect>>;

  public constructor(aspectName: string, args: Parameters<T>, target: T, aspects: Array<NamedAspect<AroundAspect>>) {
    this._aspectName = aspectName;
    this._args = args;
    this._target = target;
    this._aspects = aspects;
  }

  public getAspectName(): string {
    return this._aspectName;
  }

  public getArgs(): Parameters<T> {
    return this._args;
  }

  public proceed(): ReturnType<T> {
    return this._aspects.length === 0 ? this._target(this._args)
      : this._aspects[0].aspect(new ProceedingTargetImpl(this._aspectName, this._args, this._target, this._aspects.slice(1)));
  }
}

/**
 * 将函数注册为切面函数
 *
 * @param target 目标函数
 * @param aspectName 切面名称
 */
export const createAspectProxy: CreateAspectProxy = <T extends (...args: any[]) => any>(target: T, aspectName: string): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const realArgs: Parameters<T> = doBefore(aspectName, args);
    const result: ReturnType<T> = doAround(aspectName, target, realArgs);
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
      LOGGER.error(`Before calling method "${aspectName}", args returned by plugin "${beforeAspect.pluginId}" is not iterable.`);
    } catch (exception) {
      LOGGER.error(`Before calling method "${aspectName}", plugin "${beforeAspect.pluginId}" caused exception.`, exception);
    }
    return args;
  }, args);
};

/**
 * 执行Around切面处理函数
 *
 * @param aspectName 切点名称
 * @param target 目标函数
 * @param args 目标函数入参
 */
const doAround = <T extends (...args: any[]) => any>(aspectName: string, target: T, args: Parameters<T>): ReturnType<T> => {
  return new ProceedingTargetImpl(aspectName, args, target, PLUGIN_MANAGER.getAround(aspectName)).proceed();
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
      LOGGER.error(`After calling method "${aspectName}", plugin "${afterAspect.pluginId}" caused exception.`, exception);
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
 * 注册Around切面处理函数
 *
 * @param aspectName 切点名称
 * @param aspectMethod 切面函数
 */
const registerAround: RegisterAround = (aspectName: string, aspectMethod: AroundAspect): void => {
  PLUGIN_MANAGER.registerAround(aspectName, aspectMethod);
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

export const aspectUtil: AspectUtilsType = {
  createAspectProxy,
  registerBefore,
  registerAround,
  registerAfter,
};
