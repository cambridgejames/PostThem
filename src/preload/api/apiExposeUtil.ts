import { contextBridge } from "electron";

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
      console.warn(`Skip to expose api "${apiName}" to render, api already existed.`);
      return;
    }
    contextBridge.exposeInMainWorld(apiName, api);
    exposedRenderApis.add(apiName);
  } else {
    if (Object.keys(window).includes(apiName)) {
      console.warn(`Skip to expose api "${apiName}" to render, api already existed.`);
      return;
    }
    window[apiName] = api;
  }
};

/**
 * 将指定的Api暴露给preload
 *
 * @param apiName Api名称
 * @param api Api
 */
export const exposeApiForPreload = <T>(apiName: string, api: T): void => {
  if (Object.keys(window).includes(apiName)) {
    console.warn(`Skip to expose api "${apiName}" to preload, api already existed.`);
    return;
  }
  window[apiName] = api;
};
