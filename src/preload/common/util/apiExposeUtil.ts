import { contextBridge } from "electron";
import { Logger } from "@sdk/index";
import { RenderLogger } from "@preload/common/util/loggerUtil";
import { LoggerChannel } from "@common/model/ipcChannelModels";
import { registerOnRender } from "@preload/common/util/ipcRenderUtil";
import { ForwardedRenderApi } from "@preload/common/forwardedRenderApi";

const LOGGER: Logger = RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);

const exposedRenderApis: Set<string> = new Set();

/**
 * 将指定的Api暴露给所有渲染进程
 *
 * @template T Api类型
 * @param {ForwardedRenderApi} apiName Api名称
 * @param {T} api Api
 */
export const exposeApiForRender = <T extends (...args: any[]) => any>(apiName: ForwardedRenderApi, api: T): void => {
  if (registerOnRender(apiName, api)) {
    LOGGER.debug(`Exposed api "${apiName}" to render.`);
  } else {
    LOGGER.warn(`Skip to expose api "${apiName}" to render, api expose failed.`);
  }
};

/**
 * 将指定的Api暴露给渲染进程
 *
 * @template T Api类型
 * @param {string} apiName Api名称
 * @param {T} api Api
 */
export const exposeApiForWeb = <T>(apiName: string, api: T): void => {
  if (process.contextIsolated) {
    if (exposedRenderApis.has(apiName)) {
      LOGGER.warn(`Skip to expose api "${apiName}" to web, api already existed.`);
      return;
    }
    contextBridge.exposeInMainWorld(apiName, api);
    exposedRenderApis.add(apiName);
  } else {
    if (Object.keys(window).includes(apiName)) {
      LOGGER.warn(`Skip to expose api "${apiName}" to web, api already existed.`);
      return;
    }
    window[apiName] = api;
  }
  LOGGER.debug(`Exposed api "${apiName}" to web.`);
};

/**
 * 将指定的Api暴露给preload脚本本身
 *
 * @template T Api类型
 * @param {string} apiName Api名称
 * @param {T} api Api
 */
export const exposeApiForPreload = <T>(apiName: string, api: T): void => {
  if (Object.keys(window).includes(apiName)) {
    LOGGER.warn(`Skip to expose api "${apiName}" to preload, api already existed.`);
    return;
  }
  window[apiName] = api;
  LOGGER.debug(`Exposed api "${apiName}" to preload.`);
};
