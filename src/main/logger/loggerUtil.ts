import { ipcMain } from "electron/main";
import { Logger } from "log4js";
import { IpcChannel } from "@common/ipc/ipcChannel";
import { LoggerManager } from "@main/logger/loggerManager";

const LOGGER_PRELOAD: Logger = LoggerManager.getInstance().getNormalLogger("render-preload");
const LOGGER_WEB: Logger = LoggerManager.getInstance().getNormalLogger("render-web");

type Level = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

/**
 * 初始化渲染进程日志写入消息监听方法
 */
export const setupRenderLogging = (): void => {
  ipcMain.removeAllListeners(IpcChannel.LOGGER_LOG_MESSAGE_PRELOAD);
  ipcMain.on(IpcChannel.LOGGER_LOG_MESSAGE_PRELOAD, (_, level: Level, message: any, ...args: any[]): void => {
    LOGGER_PRELOAD[level].call(this, message, ...args);
  });
  ipcMain.on(IpcChannel.LOGGER_LOG_MESSAGE_WEB, (_, level: Level, message: any, ...args: any[]): void => {
    LOGGER_WEB[level].call(this, message, ...args);
  });
};
