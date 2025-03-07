import { LoggerManager } from "@main/logger/loggerManager";

const LOGGER = LoggerManager.getInstance().getNormalLogger("root");

/**
 * 渲染进程间通信管理类
 */
export class IpcForwardManager {
  private static INSTANCE: IpcForwardManager;

  private readonly _renderApiMap: Map<string, number> = new Map();

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
   * @param {number} renderName 渲染进程名称
   * @param {string} functionName Api名称
   * @returns {boolean} 注册结果
   */
  public registerRenderFunction(renderName: number, functionName: string): boolean {
    if (this._renderApiMap.has(functionName)) {
      LOGGER.warn(`Register function "${functionName}" for render "${renderName}" failed: function already registered.`);
      return false;
    }
    this._renderApiMap.set(functionName, renderName);
    LOGGER.debug(`Register function "${functionName}" for render "${renderName}" succeeded: function registered.`);
    return true;
  }

  /**
   * 根据渲染进程的Api获取渲染进程名称
   *
   * @param {string} functionName Api名称
   * @returns {number | undefined} 渲染进程名称
   */
  public getRenderName(functionName: string): number | undefined {
    return this._renderApiMap.get(functionName);
  }

  /**
   * 清空已注册的全部Api
   */
  public clearRegisteredFunctions(): void {
    this._renderApiMap.clear();
  }
}
