import { ipcMain } from "electron/main";
import { Logger } from "log4js";
import { LoggerChannel } from "@common/ipc/ipcChannel";
import { LoggerLevel } from "@interface/common";
import { LoggerManager } from "@main/logger/loggerManager";

const LOGGER_PRELOAD: Logger = LoggerManager.getInstance().getNormalLogger("render-preload");
const LOGGER_WEB: Logger = LoggerManager.getInstance().getNormalLogger("render-web");

/**
 * 初始化渲染进程日志写入消息监听方法
 */
export const setupRenderLogging = (): void => {
  ipcMain.removeAllListeners(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);
  ipcMain.on(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD, (_, level: LoggerLevel, message: any, ...args: any[]): void => {
    LOGGER_PRELOAD[level](message, ...args);
  });
  ipcMain.on(LoggerChannel.LOGGER_LOG_MESSAGE_WEB, (_, level: LoggerLevel, message: any, ...args: any[]): void => {
    LOGGER_WEB[level](message, ...args);
  });
};
