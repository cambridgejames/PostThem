import { ipcRenderer } from "electron/renderer";
import { IpcError, IpcReturnMessage } from "@interface/common";

export enum LoggerChannel {
  LOGGER_LOG_MESSAGE_PRELOAD = "log_message_preload",
  LOGGER_LOG_MESSAGE_WEB = "log_message_web",
  LOGGER_LOG_MESSAGE_PLUGIN = "log_message_plugin",
}

export enum CommonChannel {
  RENDER_TO_RENDER_REGISTER_CHANNEL = "render_to_render_register",
  RENDER_TO_RENDER_CHANNEL = "render_to_render",
  RENDER_TO_RENDER_RETURN_CHANNEL = "render_to_render_return",
}

/**
 * 渲染进程的名称
 */
export enum RenderName {
  MAIN = "main",
  PLUGIN = "plugin",
}

export enum IpcReturnMessageCode {
  SUCCESS = "success",
  BROWSER_WINDOW_NOT_FOUND = "ipc.render2render.windowNotFound",
  API_REGISTER_FAILED = "ipc.render2render.registerFailed",
  API_NOT_FOUND = "ipc.render2render.apiNotFound",
  TARGET_API_CAUSED_EXCEPTION = "ipc.render2render.targetApiCausedException",
}

/**
 * 调用其他渲染进程中的函数
 *
 * @param {RenderName} renderName 渲染进程的名称
 * @param {string} functionName 被调函数名称
 * @param {any[]} args 参数
 * @returns {any} 返回值
 */
export const callRender = (renderName: RenderName, functionName: string, ...args: any[]): any => {
  return ipcRenderer.sendSync(CommonChannel.RENDER_TO_RENDER_CHANNEL, renderName, functionName, ...args);
};

/**
 * 注册渲染进程调用监听函数
 *
 * @template T 处理函数的类型
 * @param {string} functionName 被调函数名称
 * @param {T} listener 处理函数
 */
export const registerOnRender = <T extends (...args: any[]) => any>(functionName: string, listener: T): void => {
  ipcRenderer.sendSync(CommonChannel.RENDER_TO_RENDER_REGISTER_CHANNEL, functionName);
  ipcRenderer.on(`${CommonChannel.RENDER_TO_RENDER_CHANNEL}_${functionName}`, (_, ...args: any[]) => {
    let result: IpcReturnMessage<ReturnType<T>>;
    try {
      result = {
        status: true,
        message: IpcReturnMessageCode.SUCCESS,
        data: listener(...args),
      } as IpcReturnMessage<ReturnType<T>>;
    } catch (exception) {
      result = {
        status: false,
        message: IpcReturnMessageCode.TARGET_API_CAUSED_EXCEPTION,
        data: new IpcError(exception),
      } as IpcReturnMessage<ReturnType<T>>;
    }
    ipcRenderer.send(`${CommonChannel.RENDER_TO_RENDER_RETURN_CHANNEL}_${functionName}`, result);
  });
};
