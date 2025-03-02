import { formatException } from "@common/util/exceptionUtil";
import { ipcRenderer } from "electron/renderer";
import { AnyFunction, AsyncFunction, IpcError, IpcReturnMessage } from "@interface/common";
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
 * 调用其他渲染进程中的函数
 *
 * @template T 返回值数据类型
 * @param {ForwardedRenderApi} functionName 被调函数名称
 * @param {any[]} args 参数
 * @returns {Promise<IpcReturnMessage<T>>} 返回值
 */
export const callRenderAsync = async <T>(functionName: ForwardedRenderApi, ...args: any[]): Promise<IpcReturnMessage<T>> => {
  return ipcRenderer.invoke(IpcForwardChannel.RENDER_TO_RENDER_ASYNC_CHANNEL, functionName, ...args);
};

/**
 * 注册渲染进程调用监听函数
 *
 * @template T 处理函数的类型
 * @param {ForwardedRenderApi} functionName 被调函数名称
 * @param {T} listener 处理函数
 * @returns {boolean} 注册结果
 */
export const registerOnRender = <T extends AnyFunction>(functionName: ForwardedRenderApi, listener: AsyncFunction<T>): boolean => {
  const registerResult: IpcReturnMessage<boolean> = ipcRenderer.sendSync(IpcForwardChannel.RENDER_TO_RENDER_REGISTER_CHANNEL, functionName);
  if (!registerResult || !registerResult.status) {
    LOGGER.error(`Register function "${functionName}" failed: ${registerResult?.message}`);
    return false;
  }
  ipcRenderer.on(`${IpcForwardChannel.RENDER_TO_RENDER_CHANNEL}_${functionName}`, async (_, ...args: any[]) => {
    let result: IpcReturnMessage<ReturnType<T>>;
    try {
      const returnValue: ReturnType<T> = await listener(...args as Parameters<T>);
      result = {
        status: true,
        message: IpcReturnMessageCode.SUCCESS,
        data: returnValue,
      } as IpcReturnMessage<ReturnType<T>>;
    } catch (exception) {
      result = {
        status: false,
        message: IpcReturnMessageCode.TARGET_API_CAUSED_EXCEPTION,
        error: new IpcError(formatException(exception)),
      } as IpcReturnMessage<ReturnType<T>>;
    }
    ipcRenderer.send(`${IpcForwardChannel.RENDER_TO_RENDER_RETURN_CHANNEL}_${functionName}`, result);
  });
  return true;
};
