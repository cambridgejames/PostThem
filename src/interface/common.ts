export interface HTMLWebviewElement extends HTMLElement {
  src: string;
  nodeintegration?: boolean;
  plugins?: boolean;
  preload?: string;
  autoSize?: boolean;
  httprefeerrer?: string;
  useragent?: string;
  disablewebsecurity?: boolean;
  partition?: string;
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
  src: string;
}

export interface WebviewConfigure extends Configure<Array<WebviewConfigureItem>> {
}
