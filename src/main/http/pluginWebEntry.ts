import { CommonChannel } from "@common/model/ipcChannelModels";
import * as FileUtil from "@common/util/fileUtil";
import { isEmpty } from "@common/util/stringUtil";
import { ScannedPlugin } from "@interface/manifest";
import { HttpRequest, registerContextPath } from "@main/http/httpUtil";
import { LoggerManager } from "@main/logger/loggerManager";

import { ipcMain } from "electron/main";
import { session } from "electron";
import { Logger } from "log4js";
import * as fs from "node:fs";
import { ServerResponse } from "node:http";
import * as path from "node:path";

const LOGGER: Logger = LoggerManager.getInstance().getNormalLogger("root");
const PLUGIN_DIR_NAME: string = "plugins";

/**
 * 处理Http请求
 *
 * @param {ScannedPlugin} scannedPlugin 插件详细信息
 * @param {HttpRequest} request Http请求
 * @param {ServerResponse} response Http返回值
 */
const solveRequest = (scannedPlugin: ScannedPlugin, request: HttpRequest, response: ServerResponse): void => {
  const contributionPoint = Object.keys(scannedPlugin.pluginManifest.entry.webview)
    .find(contributionPoint => request.path.startsWith(`/${contributionPoint}`));
  if (isEmpty(contributionPoint)) {
    LOGGER.warn(`[PLUGIN WEB ENTRY] Resource "${request.path}" 403 permission denied.`);
    response.writeHead(403, { "Content-Type": "application/json" });
    response.end(`{manifest:${JSON.stringify(scannedPlugin)},request:${JSON.stringify(request)}}`, "utf-8");
    return;
  }
  const requestResourceName: string = request.path.substring(`/${contributionPoint}`.length);
  const resourceFileName: string = isEmpty(requestResourceName) ? "index.html" : requestResourceName;
  const relativeResourceFile: string = path.join(PLUGIN_DIR_NAME, scannedPlugin.pluginDir, resourceFileName);
  const absoluteResourceFile: string = path.resolve(FileUtil.getConfigPath(relativeResourceFile));
  fs.access(absoluteResourceFile, fs.constants.F_OK, (error) => {
    if (error) {
      LOGGER.warn(`[PLUGIN WEB ENTRY] Resource "${request.path}" 404 not found.`);
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(`{manifest:${JSON.stringify(scannedPlugin)},request:${JSON.stringify(request)}}`, "utf-8");
      return;
    }
    fs.createReadStream(absoluteResourceFile).pipe(response);
  });
};

/**
 * 注册资源重定向函数
 *
 * @param {ScannedPlugin} scannedPlugin 插件详细信息
 * @param {string} contextPath Http上下文路径
 */
const registerResourceRedirection = (scannedPlugin: ScannedPlugin, contextPath: string): void => {
  Object.keys(scannedPlugin.pluginManifest.entry.webview).forEach(contributionPoint => {
    const sessionId: string = `persist:PLUGIN_${scannedPlugin.pluginManifest.uniqueId}#${contributionPoint}`;
    session.fromPartition(sessionId).webRequest.onBeforeRequest({ urls: ["*://*/*"]}, (details, callback) => {
      if (!details.url.includes(contextPath) && (details.url.startsWith("http://localhost") || details.url.startsWith("https://localhost"))) {
        const newUrl = details.url.replace(/(https?:\/\/[^/]+)(\/.*)/, `$1/${contextPath}/${contributionPoint}$2`);
        return callback({ redirectURL: newUrl });
      }
      callback({});
    });
  });
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
      registerResourceRedirection(scannedPlugin, contextPath);
      return { ...result, [scannedPlugin.pluginManifest.uniqueId]: contextPath };
    }, {});
  LOGGER.info(`[PLUGIN WEB ENTRY] Registered context path: ${JSON.stringify(contextPathMap)}`);
  return contextPathMap;
};

/**
 * 初始化插件页面处理函数
 */
export const setupPluginWebEntry = () => {
  ipcMain.removeListener(CommonChannel.COMMON_PLUGIN_WEB_ENTRY_REGISTER, registerPluginWebEntry);
  ipcMain.handle(CommonChannel.COMMON_PLUGIN_WEB_ENTRY_REGISTER, (_, ...args) => registerPluginWebEntry(...args));
};
