import { RenderName } from "@common/model/ipcChannelModels";
import { LoggerManager } from "@main/logger/loggerManager";

const LOGGER = LoggerManager.getInstance().getNormalLogger("root");

/**
 * 渲染进程间通信管理类
 */
export class IpcForwardManager {
  private static INSTANCE: IpcForwardManager;

  private readonly _renderApiMap: Map<RenderName, Set<string>> = new Map();

  private constructor() {}

  /**
   * 渲染进程间通信管理器实例
   *
   * @return {IpcForwardManager} 渲染进程间通信管理器实例
   */
  public static getInstance(): IpcForwardManager {
    if (!this.INSTANCE) {
      this.INSTANCE = new IpcForwardManager();
    }
    return this.INSTANCE;
  }

  /**
   * 注册渲染进程的Api
   *
   * @param {RenderName} renderName 渲染进程名称
   * @param {string} functionName Api名称
   * @returns {boolean} 注册结果
   */
  public registerRenderFunction(renderName: RenderName, functionName: string): boolean {
    if (!this._renderApiMap.has(renderName)) {
      this._renderApiMap.set(renderName, new Set());
    }
    const currentFunctionSet = this._renderApiMap.get(renderName)!;
    if (currentFunctionSet.has(functionName)) {
      LOGGER.warn(`Register function "${functionName}" for render "${renderName}" failed: function already registered.`);
      return false;
    }
    currentFunctionSet.add(functionName);
    LOGGER.debug(`Register function "${functionName}" for render "${renderName}" succeeded: function registered.`);
    return true;
  }

  /**
   * 校验渲染进程的Api是否存在
   *
   * @param {RenderName} renderName 渲染进程名称
   * @param {string} functionName Api名称
   * @returns {boolean} 校验结果
   */
  public checkRenderFunction(renderName: RenderName, functionName: string): boolean {
    return this._renderApiMap.has(renderName) && this._renderApiMap.get(renderName)!.has(functionName);
  }
}
