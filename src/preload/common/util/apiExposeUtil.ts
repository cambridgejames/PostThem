import { contextBridge } from "electron";
import { Logger } from "@sdk/index";
import { RenderLogger } from "@preload/common/util/loggerUtil";
import { LoggerChannel } from "@common/model/ipcChannelModels";

const LOGGER: Logger = RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);

const exposedRenderApis: Set<string> = new Set();

/**
 * 将指定的Api暴露给渲染进程
 *
 * @param apiName Api名称
 * @param api Api
 */
export const exposeApiForRender = <T>(apiName: string, api: T): void => {
  if (process.contextIsolated) {
    if (exposedRenderApis.has(apiName)) {
      LOGGER.warn(`Skip to expose api "${apiName}" to render, api already existed.`);
      return;
    }
    contextBridge.exposeInMainWorld(apiName, api);
    exposedRenderApis.add(apiName);
  } else {
    if (Object.keys(window).includes(apiName)) {
      LOGGER.warn(`Skip to expose api "${apiName}" to render, api already existed.`);
      return;
    }
    window[apiName] = api;
  }
  LOGGER.debug(`Exposed api "${apiName}" to render.`);
};

/**
 * 将指定的Api暴露给preload
 *
 * @param apiName Api名称
 * @param api Api
 */
export const exposeApiForPreload = <T>(apiName: string, api: T): void => {
  if (Object.keys(window).includes(apiName)) {
    LOGGER.warn(`Skip to expose api "${apiName}" to preload, api already existed.`);
    return;
  }
  window[apiName] = api;
  LOGGER.debug(`Exposed api "${apiName}" to preload.`);
};
