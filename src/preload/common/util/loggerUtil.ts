import { ipcRenderer } from "electron/renderer";
import { LoggerLevel } from "@interface/common";
import { LoggerChannel } from "@common/model/ipcChannelModels";
import { Logger } from "@sdk/index";

/**
 * 渲染进程Logger类
 */
export class RenderLogger implements Logger {
  private static INSTANCE_MAP: Map<LoggerChannel, RenderLogger> = new Map();

  private readonly _ipcChannel: LoggerChannel;
  private readonly _pluginId: string | undefined;

  private constructor(channel: LoggerChannel, pluginId: string | undefined) {
    this._ipcChannel = channel;
    this._pluginId = pluginId;
  }

  /**
   * 获取渲染进程Logger实例
   *
   * @param {LoggerChannel} channel 日志通道
   * @param {string} pluginId 插件Id
   * @return {Logger} 渲染进程Logger实例
   */
  public static getInstance(channel: LoggerChannel, pluginId?: string): Logger {
    if (!this.INSTANCE_MAP.has(channel)) {
      this.INSTANCE_MAP.set(channel, new RenderLogger(channel, pluginId));
    }
    return this.INSTANCE_MAP.get(channel)!;
  }

  public trace(message: any, ...args: any[]): void {
    this.sendMessage(LoggerLevel.TRACE, message, ...args);
  }

  public debug(message: any, ...args: any[]): void {
    this.sendMessage(LoggerLevel.DEBUG, message, ...args);
  }

  public info(message: any, ...args: any[]): void {
    this.sendMessage(LoggerLevel.INFO, message, ...args);
  }

  public warn(message: any, ...args: any[]): void {
    this.sendMessage(LoggerLevel.WARN, message, ...args);
  }

  public error(message: any, ...args: any[]): void {
    this.sendMessage(LoggerLevel.ERROR, message, ...args);
  }

  public fatal(message: any, ...args: any[]): void {
    this.sendMessage(LoggerLevel.FATAL, message, ...args);
  }

  /**
   * 向主进程发送日志消息
   *
   * @param {LoggerLevel} level 日志等级
   * @param {any} message 日志内容
   * @param {any[]} args 参数
   * @private
   */
  private sendMessage(level: LoggerLevel, message: any, ...args: any[]): void {
    if (this._pluginId) {
      ipcRenderer.send(this._ipcChannel, this._pluginId, level, message, ...args);
    } else {
      ipcRenderer.send(this._ipcChannel, level, message, ...args);
    }
  }
}

/**
 * 转换可序列化的日志记录器
 *
 * @param {Logger} renderLogger 日志记录器实例
 * @returns {Logger} 转换后的实例
 */
const buildLogger = (renderLogger: Logger): Logger => ({
  trace: (message: any, ...args: any[]) => renderLogger.trace(message, ...args),
  debug: (message: any, ...args: any[]) => renderLogger.debug(message, ...args),
  info: (message: any, ...args: any[]) => renderLogger.info(message, ...args),
  warn: (message: any, ...args: any[]) => renderLogger.warn(message, ...args),
  error: (message: any, ...args: any[]) => renderLogger.error(message, ...args),
  fatal: (message: any, ...args: any[]) => renderLogger.fatal(message, ...args),
} as Logger);

/**
 * 获取日志记录器
 *
 * @param {LoggerChannel} loggerChannel 日志通道
 * @param {string} pluginId 插件Id
 * @returns {Logger} 日志记录器
 */
export const getLogger = (loggerChannel: LoggerChannel, pluginId?: string): Logger => {
  return buildLogger(RenderLogger.getInstance(loggerChannel, pluginId));
};
