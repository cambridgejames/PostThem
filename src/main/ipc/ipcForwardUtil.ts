import { IpcForwardChannel, IpcReturnMessageCode } from "@common/model/ipcChannelModels";
import { IpcReturnMessage } from "@interface/common";
import { IpcForwardManager } from "@main/ipc/ipcForwardManager";
import { LoggerManager } from "@main/logger/loggerManager";
import { BrowserWindow, IpcMainEvent, WebContents } from "electron";
import { ipcMain } from "electron/main";

const LOGGER = LoggerManager.getInstance().getNormalLogger("root");

const IPC_RENDER_MANAGER: IpcForwardManager = IpcForwardManager.getInstance();
const RENDER_WEB_CONTENTS_CACHE: Map<number, WebContents> = new Map();

/**
 * 获取窗口名称并更新缓存
 *
 * @param {Electron.CrossProcessExports.IpcMainEvent} event Ipc通信事件
 * @returns {number} 窗口名称
 */
const getRenderNameByEvent = (event: IpcMainEvent): number => {
  const currentWindow: BrowserWindow | null = BrowserWindow.fromWebContents(event.sender);
  if (!currentWindow) {
    return -1;
  }
  const renderName: number = currentWindow.id;
  RENDER_WEB_CONTENTS_CACHE.set(renderName, event.sender); // 更新窗口缓存
  return renderName;
};

/**
 * 注册渲染进程的Api
 *
 * @param {Electron.CrossProcessExports.IpcMainEvent} event Ipc通信事件
 * @param {string} functionName Api名称
 */
const registerRenderFunctionSync = (event: IpcMainEvent, functionName: string): void => {
  const renderName: number = getRenderNameByEvent(event);
  if (renderName < 0) {
    LOGGER.error(`Register function "${functionName}" failed: browser window not found.`);
    event.returnValue = {
      status: false,
      message: IpcReturnMessageCode.BROWSER_WINDOW_NOT_FOUND,
    } as IpcReturnMessage<boolean>;
    return;
  }
  const registerResult: boolean = IPC_RENDER_MANAGER.registerRenderFunction(renderName, functionName);
  event.returnValue = {
    status: registerResult,
    message: registerResult ? IpcReturnMessageCode.SUCCESS : IpcReturnMessageCode.API_REGISTER_FAILED,
    data: registerResult || undefined,
  } as IpcReturnMessage<boolean>;
};

/**
 * 调用指定渲染进程的Api
 *
 * @param {Electron.CrossProcessExports.IpcMainEvent} event Ipc通信事件
 * @param {string} functionName Api名称
 * @param {any[]} args 参数
 */
const callRenderFunctionSync = (event: IpcMainEvent, functionName: string, ...args: any[]): void => {
  const renderName: any = IPC_RENDER_MANAGER.getRenderName(functionName);
  if (!renderName) {
    LOGGER.error(`Call function "${functionName}" failed: target api not found.`);
    event.returnValue = {
      status: false,
      message: IpcReturnMessageCode.API_NOT_FOUND,
    } as IpcReturnMessage<boolean>;
    return;
  }
  const targetWebContents: WebContents | undefined = RENDER_WEB_CONTENTS_CACHE.get(renderName);
  if (!targetWebContents) {
    LOGGER.error(`Call function "${functionName}" in "${renderName}" failed: browser window not found.`);
    event.returnValue = {
      status: false,
      message: IpcReturnMessageCode.BROWSER_WINDOW_NOT_FOUND,
    } as IpcReturnMessage<boolean>;
    return;
  }
  ipcMain.once(`${IpcForwardChannel.RENDER_TO_RENDER_RETURN_CHANNEL}_${functionName}`, (_, returnValue) => {
    LOGGER.trace(`Call function "${functionName}" in "${renderName}" succeeded: received return value from target window.`);
    event.returnValue = returnValue;
  });
  targetWebContents.send(`${IpcForwardChannel.RENDER_TO_RENDER_CHANNEL}_${functionName}`, ...args);
  LOGGER.trace(`Call function "${functionName}" in "${renderName}" succeeded: send message to target window.`);
};

/**
 * 初始化主进程转发跨渲染进程Api调用消息监听方法
 */
export const setupRender2RenderIpc = (): void => {
  IPC_RENDER_MANAGER.clearRegisteredFunctions();
  ipcMain.removeListener(IpcForwardChannel.RENDER_TO_RENDER_REGISTER_CHANNEL, registerRenderFunctionSync);
  ipcMain.on(IpcForwardChannel.RENDER_TO_RENDER_REGISTER_CHANNEL, registerRenderFunctionSync);
  ipcMain.removeListener(IpcForwardChannel.RENDER_TO_RENDER_CHANNEL, callRenderFunctionSync);
  ipcMain.on(IpcForwardChannel.RENDER_TO_RENDER_CHANNEL, callRenderFunctionSync);
  ipcMain.on("aaa", (event: IpcMainEvent) => { console.log(1234); event.returnValue = "test"; });
};
