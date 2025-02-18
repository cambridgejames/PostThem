import { ipcMain } from "electron/main";
import { Logger } from "log4js";
import { LoggerChannel } from "@common/model/ipcChannelModels";
import { LoggerLevel } from "@interface/common";
import { LoggerManager } from "@main/logger/loggerManager";

import * as StringUtil from "@common/util/stringUtil";

const LOGGER: Logger = LoggerManager.getInstance().getNormalLogger("root");
const LOGGER_PRELOAD: Logger = LoggerManager.getInstance().getNormalLogger("render-preload");
const LOGGER_WEB: Logger = LoggerManager.getInstance().getNormalLogger("render-web");
const LOGGER_PLUGIN_MAP: Map<string, Logger> = new Map();

/**
 * 记录渲染进程中框架本体的Preload脚本日志
 *
 * @param _ 进程通信事件
 * @param {LoggerLevel} level 日志等级
 * @param {any} message 日志内容
 * @param {any[]} args 参数
 */
const logPreload = (_, level: LoggerLevel, message: any, ...args: any[]): void => {
  if (StringUtil.isEmpty(level)) {
    LOGGER.warn("Logging for preload failed: level invalid.");
    return;
  }
  LOGGER_PRELOAD[level](message, ...args);
};

/**
 * 记录渲染进程中框架本体的Web页面日志
 *
 * @param _ 进程通信事件
 * @param {LoggerLevel} level 日志等级
 * @param {any} message 日志内容
 * @param {any[]} args 参数
 */
const logWeb = (_, level: LoggerLevel, message: any, ...args: any[]): void => {
  if (StringUtil.isEmpty(level)) {
    LOGGER.warn("Logging for web failed: level invalid.");
    return;
  }
  LOGGER_WEB[level](message, ...args);
};

/**
 * 记录渲染进程中插件的日志
 *
 * @param _ 进程通信事件
 * @param {string} pluginId 插件Id
 * @param {LoggerLevel} level 日志等级
 * @param {any} message 日志内容
 * @param {any[]} args 参数
 */
const logPlugin = (_, pluginId: string, level: LoggerLevel, message: any, ...args: any[]): void => {
  if (StringUtil.isEmpty(pluginId) || StringUtil.isEmpty(level)) {
    LOGGER.warn(`Logging for plugin "${pluginId}" failed: plugin id or level invalid.`);
    return;
  }
  if (!LOGGER_PLUGIN_MAP.has(pluginId)) {
    LOGGER_PLUGIN_MAP.set(pluginId, LoggerManager.getInstance().getPluginLogger(pluginId));
  }
  LOGGER_PLUGIN_MAP.get(pluginId)![level](message, ...args);
};

/**
 * 初始化渲染进程日志写入消息监听方法
 */
export const setupRenderLogging = (): void => {
  ipcMain.removeListener(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD, logPreload);
  ipcMain.on(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD, logPreload);
  ipcMain.removeListener(LoggerChannel.LOGGER_LOG_MESSAGE_WEB, logWeb);
  ipcMain.on(LoggerChannel.LOGGER_LOG_MESSAGE_WEB, logWeb);
  ipcMain.removeListener(LoggerChannel.LOGGER_LOG_MESSAGE_PLUGIN, logPlugin);
  ipcMain.on(LoggerChannel.LOGGER_LOG_MESSAGE_PLUGIN, logPlugin);
  ipcMain.removeListener(LoggerChannel.LOGGER_LOG_MESSAGE_DEFAULT, logPreload);
  ipcMain.on(LoggerChannel.LOGGER_LOG_MESSAGE_DEFAULT, logPreload);
};
