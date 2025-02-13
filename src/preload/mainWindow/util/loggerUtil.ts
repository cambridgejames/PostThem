import { ipcRenderer } from "electron/renderer";
import { LoggerLevel } from "@interface/common";
import { LoggerChannel } from "@common/util/ipcUtil";
import { Logger } from "@sdk/index";

/**
 * 渲染进程Logger类
 */
export class RenderLogger implements Logger {
  private static INSTANCE_MAP: Map<LoggerChannel, RenderLogger> = new Map();

  private readonly _ipcChannel: LoggerChannel;

  private constructor(channel: LoggerChannel) {
    this._ipcChannel = channel;
  }

  /**
   * 获取渲染进程Logger实例
   *
   * @param {LoggerChannel} channel 日志通道
   * @return {Logger} 渲染进程Logger实例
   */
  public static getInstance(channel: LoggerChannel): Logger {
    if (!this.INSTANCE_MAP.has(channel)) {
      this.INSTANCE_MAP.set(channel, new RenderLogger(channel));
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
    ipcRenderer.send(this._ipcChannel, level, message, ...args);
  }
}

/**
 * 获取日志记录器
 *
 * @param {LoggerChannel} loggerChannel 日志通道
 * @returns {Logger} 日志记录器
 */
export const getLogger = (loggerChannel: LoggerChannel): Logger => {
  const instance: Logger = RenderLogger.getInstance(loggerChannel);
  return {
    trace: (message: any, ...args: any[]) => instance.trace(message, ...args),
    debug: (message: any, ...args: any[]) => instance.debug(message, ...args),
    info: (message: any, ...args: any[]) => instance.info(message, ...args),
    warn: (message: any, ...args: any[]) => instance.warn(message, ...args),
    error: (message: any, ...args: any[]) => instance.error(message, ...args),
    fatal: (message: any, ...args: any[]) => instance.fatal(message, ...args),
  };
};
