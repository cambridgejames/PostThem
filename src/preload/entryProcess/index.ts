import { contextBridge } from "electron";

const sendMessageToWebProcess = (channel: string, message: any): void => {
  window.postMessage({ channel, message }, "*");
};

const LOGGER_LOG_MESSAGE_PLUGIN_WEB: string = "log_message_plugin_web";
const VALID_LOGGER_LEVEL: Array<string> = ["trace", "debug", "info", "warn", "error", "fatal"];

const sendLoggerMessage = (level: string, message: string, ...args: any[]): void => {
  if (VALID_LOGGER_LEVEL.includes(level)) {
    sendMessageToWebProcess(LOGGER_LOG_MESSAGE_PLUGIN_WEB, [level, message, ...args]);
  }
  sendLoggerMessage("warn", `Logger skipped: Level ${level} is not supported.`);
};

contextBridge.exposeInMainWorld("log", {
  getLogger: () => ({
    trace: (message: any, ...args: any[]): void => sendLoggerMessage("trace", message, ...args),
    debug: (message: any, ...args: any[]): void => sendLoggerMessage("debug", message, ...args),
    info: (message: any, ...args: any[]): void => sendLoggerMessage("info", message, ...args),
    warn: (message: any, ...args: any[]): void => sendLoggerMessage("warn", message, ...args),
    error: (message: any, ...args: any[]): void => sendLoggerMessage("error", message, ...args),
    fatal: (message: any, ...args: any[]): void => sendLoggerMessage("fatal", message, ...args),
  }),
});
