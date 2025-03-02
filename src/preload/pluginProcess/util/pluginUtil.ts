import { CommonChannel, LoggerChannel } from "@common/model/ipcChannelModels";
import { readDir, readFile } from "@common/util/fileUtil";
import { AnyFunction, AsyncFunction, IpcReturnMessage } from "@interface/common";
import { PluginManifest, ScannedPlugin } from "@interface/manifest";
import { ForwardedRenderApi } from "@preload/common/forwardedRenderApi";
import { callRender } from "@preload/common/util/ipcRenderUtil";
import { RenderLogger } from "@preload/common/util/loggerUtil";
import { checkAndParseManifest, ManifestCheckResult } from "@preload/pluginProcess/plugin/manifestChecker";
import { PluginManager } from "@preload/pluginProcess/plugin/pluginManager";
import { createAspectProxy } from "@preload/pluginProcess/util/aspectUtil";
import { Logger } from "@sdk/index";
import { ipcRenderer } from "electron/renderer";

import * as path from "node:path";

const PLUGIN_MANIFEST_FILE_NAME: string = "manifest.json";
const PLUGIN_REQUIRED_FILES: string[] = [
  PLUGIN_MANIFEST_FILE_NAME,
];
const PLUGIN_MANAGER: PluginManager = PluginManager.getInstance();
const LOGGER: Logger = RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);

/**
 * 扫描并加载插件
 */
export const loadPlugins = async (): Promise<void> => {
  LOGGER.info("Start load plugins.");
  const pluginDirs: string[] = await readDir(PLUGIN_MANAGER.getPluginRoot());
  const scannedPlugins: ScannedPlugin[] = [];
  for (const pluginDir of pluginDirs) {
    const pluginManifest: PluginManifest | null = await checkAndLoadPluginManifest(pluginDir);
    if (pluginManifest) {
      scannedPlugins.push({ pluginDir, pluginManifest });
    }
  }
  LOGGER.info(`Scan plugins finished, ${scannedPlugins.length} plugins found.`);
  const webviewPlugins: ScannedPlugin[] = scannedPlugins
    .filter(plugin => Object.keys(plugin.pluginManifest.entry.webview).length > 0);
  const contextPathMap = await ipcRenderer.invoke(CommonChannel.COMMON_PLUGIN_WEB_ENTRY_REGISTER, ...webviewPlugins);
  const successCount: number = scannedPlugins.reduce((count, plugin) => {
    return PLUGIN_MANAGER.register(plugin.pluginManifest, plugin.pluginDir, contextPathMap[plugin.pluginManifest.uniqueId])
      ? count + 1 : count;
  }, 0);
  LOGGER.info(`Plugins loading completed, ${successCount} plugins registered.`);
};

/**
 * 校验并加载manifest.json配置信息
 *
 * @param pluginDirName 插件根目录
 */
const checkAndLoadPluginManifest = async (pluginDirName: string): Promise<PluginManifest | null> => {
  const pathToPluginDir = path.join(PLUGIN_MANAGER.getPluginRoot(), pluginDirName);
  const currentPluginFiles: string[] = await readDir(pathToPluginDir);
  for (const requiredPluginFile of PLUGIN_REQUIRED_FILES) {
    if (!currentPluginFiles.includes(requiredPluginFile)) {
      return null;
    }
  }
  const manifestContent = JSON.parse(await readFile(path.join(PLUGIN_MANAGER.getPluginRoot(), pluginDirName, PLUGIN_MANIFEST_FILE_NAME)));
  const manifestCheckResult: ManifestCheckResult = await checkAndParseManifest(manifestContent, pathToPluginDir);
  if (!manifestCheckResult.result) {
    LOGGER.info(`Check plugin '${pluginDirName}', failed: ${manifestCheckResult.message}`);
    return null;
  }
  const manifest: PluginManifest = manifestCheckResult.data as PluginManifest;
  LOGGER.info(`Check plugin: '${manifest.name}', succeeded.`);
  return manifest;
};

/**
 * 主渲染进程代理方法执行监听函数
 *
 * @template T 目标函数类型
 * @param {string} aspectName 切面名称
 * @param {string} traceId 请求Id
 * @param {Parameters<T>} args 参数
 * @returns {ReturnType<T>} 返回值
 */
export const callAspectProxy = async <T extends AnyFunction>(aspectName: string, traceId: string, ...args: Parameters<T>): ReturnType<AsyncFunction<T>> => {
  return createAspectProxy((...args: Parameters<T>): ReturnType<AsyncFunction<T>> => {
    const result: IpcReturnMessage<ReturnType<T>> = callRender(ForwardedRenderApi.MAIN_WINDOW_PLUGIN_PROXY_TARGET_PROCEED, aspectName, traceId, ...args);
    if (!result.status) {
      const throwable = new Error(result.message);
      if (result.error) {
        throwable.cause = result.error;
      }
      LOGGER.error(`Call proxy ${aspectName} failed: ${result.message}.\n`, throwable);
      throw throwable;
    }
    return result.data!;
  }, aspectName)(...args);
};
