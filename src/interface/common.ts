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

export interface HTMLWebviewElement extends HTMLElement {
  src: string;
  nodeintegration?: boolean;
  nodeintegrationinsubframes?: boolean;
  plugins?: boolean;
  preload?: string;
  httprefeerrer?: string;
  useragent?: string;
  disablewebsecurity?: boolean;
  partition?: string;
  allowpopups?: boolean;
  webpreferences?: string;
  enableblinkfeatures?: string;
  disableblinkfeatures?: string;
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
