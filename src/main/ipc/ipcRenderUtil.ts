import { CommonChannel, IpcReturnMessageCode, RenderName } from "@common/util/ipcUtil";
import { IpcReturnMessage } from "@interface/common";
import { IpcRenderManager } from "@main/ipc/ipcRenderManager";
import { LoggerManager } from "@main/logger/loggerManager";
import { BrowserWindow, IpcMainEvent, WebContents } from "electron";
import { ipcMain } from "electron/main";

const LOGGER = LoggerManager.getInstance().getNormalLogger("root");

const IPC_RENDER_MANAGER: IpcRenderManager = IpcRenderManager.getInstance();
const RENDER_WEB_CONTENTS_CACHE: Map<RenderName, WebContents> = new Map();

/**
 * 注册渲染进程的Api
 *
 * @param {Electron.CrossProcessExports.IpcMainEvent} event Ipc通信事件
 * @param {string} functionName Api名称
 */
const registerRenderFunctionSync = (event: IpcMainEvent, functionName: string): void => {
  const currentWindow: BrowserWindow | null = BrowserWindow.fromWebContents(event.sender);
  if (!currentWindow) {
    LOGGER.error(`Register function "${functionName}" failed: browser window not found.`);
    event.returnValue = {
      status: false,
      message: IpcReturnMessageCode.BROWSER_WINDOW_NOT_FOUND,
    } as IpcReturnMessage<boolean>;
    return;
  }
  const renderName: RenderName = currentWindow.getTitle() as RenderName;
  RENDER_WEB_CONTENTS_CACHE.set(renderName, event.sender); // 更新窗口缓存
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
 * @param {RenderName} renderName 渲染进程名称
 * @param {string} functionName Api名称
 * @param {any[]} args 参数
 */
const callRenderFunctionSync = (event: IpcMainEvent, renderName: RenderName, functionName: string, ...args: any[]): void => {
  if (!IPC_RENDER_MANAGER.checkRenderFunction(renderName, functionName)) {
    LOGGER.error(`Call function "${functionName}" in "${renderName}" failed: target api not found.`);
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
  ipcMain.once(`${CommonChannel.RENDER_TO_RENDER_RETURN_CHANNEL}_${functionName}`, (_, returnValue) => {
    LOGGER.trace(`Call function "${functionName}" in "${renderName}" succeeded: received return value from target window.`);
    event.returnValue = returnValue;
  });
  targetWebContents.send(`${CommonChannel.RENDER_TO_RENDER_CHANNEL}_${functionName}`, ...args);
  LOGGER.trace(`Call function "${functionName}" in "${renderName}" succeeded: send message to target window.`);
};

/**
 * 初始化主进程转发跨渲染进程Api调用消息监听方法
 */
export const setupRender2RenderIpc = (): void => {
  ipcMain.removeListener(CommonChannel.RENDER_TO_RENDER_REGISTER_CHANNEL, registerRenderFunctionSync);
  ipcMain.on(CommonChannel.RENDER_TO_RENDER_REGISTER_CHANNEL, registerRenderFunctionSync);
  ipcMain.removeListener(CommonChannel.RENDER_TO_RENDER_CHANNEL, callRenderFunctionSync);
  ipcMain.on(CommonChannel.RENDER_TO_RENDER_CHANNEL, callRenderFunctionSync);
};
