import { ipcRenderer } from "electron/renderer";
import { IpcError, IpcReturnMessage } from "@interface/common";
import { IpcForwardChannel, IpcReturnMessageCode, LoggerChannel } from "@common/model/ipcChannelModels";
import { Logger } from "@sdk/index";
import { getLogger } from "@preload/common/util/loggerUtil";
import { ForwardedRenderApi } from "@preload/common/forwardedRenderApi";

const LOGGER: Logger = getLogger(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);

/**
 * 调用其他渲染进程中的函数
 *
 * @template T 返回值数据类型
 * @param {ForwardedRenderApi} functionName 被调函数名称
 * @param {any[]} args 参数
 * @returns {IpcReturnMessage<T>} 返回值
 */
export const callRender = <T>(functionName: ForwardedRenderApi, ...args: any[]): IpcReturnMessage<T> => {
  return ipcRenderer.sendSync(IpcForwardChannel.RENDER_TO_RENDER_CHANNEL, functionName, ...args);
};

/**
 * 注册渲染进程调用监听函数
 *
 * @template T 处理函数的类型
 * @param {ForwardedRenderApi} functionName 被调函数名称
 * @param {T} listener 处理函数
 * @returns {boolean} 注册结果
 */
export const registerOnRender = <T extends (...args: any[]) => any>(functionName: ForwardedRenderApi, listener: T): boolean => {
  const registerResult: IpcReturnMessage<boolean> = ipcRenderer.sendSync(IpcForwardChannel.RENDER_TO_RENDER_REGISTER_CHANNEL, functionName);
  if (!registerResult || !registerResult.status) {
    LOGGER.error(`Register function "${functionName}" failed: ${registerResult?.message}`);
    return false;
  }
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
        error: new IpcError(exception instanceof Error ? exception : new Error(exception)),
      } as IpcReturnMessage<ReturnType<T>>;
    }
    ipcRenderer.send(`${IpcForwardChannel.RENDER_TO_RENDER_RETURN_CHANNEL}_${functionName}`, result);
  });
  return true;
};
