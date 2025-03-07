import { WebviewTag } from "electron";

/**
 * Logger日志等级
 */
export enum LoggerLevel {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

export interface HTMLWebviewElement extends WebviewTag {
}

/**
 * 配置文件类型枚举
 */
export enum ConfigureType {
  SETTINGS,
  WEBVIEW,
}

export interface Configure<T> {
  version: number;
  data: T;
}

export interface WebviewConfigureItem {
  id: string;
  name: string;
  src: string;
}

export interface WebviewConfigure extends Configure<Array<WebviewConfigureItem>> {
}

export type AnyFunction = (...args: any[]) => any;
export type AsyncFunction<T extends AnyFunction> = (...args: Parameters<T>) => Promise<ReturnType<T>>;

/**
 * Ipc通信通用返回消息体
 */
export interface IpcReturnMessage<T> {
  status: boolean;
  message: string;
  data?: T;
  error?: IpcError;
}

/**
 * Ipc通信通用异常返回体
 */
export class IpcError {
  public readonly name: string;
  public readonly message: string;
  public readonly stack: Array<string>;

  public constructor(exception: Error) {
    this.name = exception.name;
    this.message = exception.message;
    this.stack = exception.stack?.split("\n").slice(1).map(item => item.trim()) || [];
  }
}
