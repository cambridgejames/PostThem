import { ipcRenderer } from "electron/renderer";
import { IpcError, IpcReturnMessage } from "@interface/common";
import { IpcForwardChannel, IpcReturnMessageCode, RenderName } from "@common/model/ipcChannelModels";

/**
 * 调用其他渲染进程中的函数
 *
 * @param {RenderName} renderName 渲染进程的名称
 * @param {string} functionName 被调函数名称
 * @param {any[]} args 参数
 * @returns {any} 返回值
 */
export const callRender = (renderName: RenderName, functionName: string, ...args: any[]): any => {
  return ipcRenderer.sendSync(IpcForwardChannel.RENDER_TO_RENDER_CHANNEL, renderName, functionName, ...args);
};

/**
 * 注册渲染进程调用监听函数
 *
 * @template T 处理函数的类型
 * @param {string} functionName 被调函数名称
 * @param {T} listener 处理函数
 */
export const registerOnRender = <T extends (...args: any[]) => any>(functionName: string, listener: T): void => {
  ipcRenderer.sendSync(IpcForwardChannel.RENDER_TO_RENDER_REGISTER_CHANNEL, functionName);
  ipcRenderer.on(`${IpcForwardChannel.RENDER_TO_RENDER_CHANNEL}_${functionName}`, (_, ...args: any[]) => {
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
    ipcRenderer.send(`${IpcForwardChannel.RENDER_TO_RENDER_RETURN_CHANNEL}_${functionName}`, result);
  });
};
