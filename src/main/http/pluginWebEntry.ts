import { CommonChannel } from "@common/model/ipcChannelModels";
import { ScannedPlugin } from "@interface/manifest";
import { HttpRequest, registerContextPath } from "@main/http/httpUtil";
import { LoggerManager } from "@main/logger/loggerManager";

import { ipcMain } from "electron/main";
import { session } from "electron";
import { Logger } from "log4js";
import { ServerResponse } from "node:http";

const LOGGER: Logger = LoggerManager.getInstance().getNormalLogger("root");

/**
 * 处理Http请求
 *
 * @param {ScannedPlugin} scannedPlugin 插件详细信息
 * @param {HttpRequest} request Http请求
 * @param {ServerResponse} response Http返回值
 */
const solveRequest = (scannedPlugin: ScannedPlugin, request: HttpRequest, response: ServerResponse): void => {
  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(`{manifest:${JSON.stringify(scannedPlugin)},request:${JSON.stringify(request)}}`, "utf-8");
};

/**
 * 注册插件页面处理函数
 *
 * @param {ScannedPlugin} scannedPlugins 插件详细信息
 * @returns {object} 插件Id -> 上下文路径
 */
const registerPluginWebEntry = (...scannedPlugins: Array<ScannedPlugin>): object => {
  const contextPathMap = scannedPlugins
    .filter(scannedPlugin => Object.keys(scannedPlugin.pluginManifest.entry.webview).length > 0)
    .reduce((result, scannedPlugin) => {
      const contextPath = registerContextPath((request, response) => solveRequest(scannedPlugin, request, response));
      const currentWebview = session.fromPartition(`persist:PLUGIN_${scannedPlugin.pluginManifest.uniqueId}`);
      currentWebview.webRequest.onBeforeRequest({ urls: ["*://*/*"]}, (details, callback) => {
        if (details.url.startsWith("http://localhost") || details.url.startsWith("https://localhost")) {
          const newUrl = details.url.replace(/(\/[^/]+)/, `/${contextPath}$1`);
          return callback({ redirectURL: newUrl });
        }
        callback({});
      });
      return { ...result, [scannedPlugin.pluginManifest.uniqueId]: contextPath };
    }, {});
  LOGGER.info(`[Plugin Web Entry] Registered context path: ${JSON.stringify(contextPathMap)}`);
  return contextPathMap;
};

/**
 * 初始化插件页面处理函数
 */
export const setupPluginWebEntry = () => {
  ipcMain.removeListener(CommonChannel.COMMON_PLUGIN_WEB_ENTRY_REGISTER, registerPluginWebEntry);
  ipcMain.handle(CommonChannel.COMMON_PLUGIN_WEB_ENTRY_REGISTER, (_, ...args) => registerPluginWebEntry(...args));
};
