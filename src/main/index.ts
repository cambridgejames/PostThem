import { LoggerManager } from "@main/logger/loggerManager";
import { setupRender2RenderIpc } from "@main/ipc/ipcForwardUtil";
import { setupRenderLogging } from "@main/logger/loggerUtil";
import icon from "../../resources/icon.png?asset";

import { app, shell, BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import * as path from "node:path";

const LOGGER = LoggerManager.getInstance().getNormalLogger("root");
const HIDDEN_WINDOWS: Map<string, BrowserWindow> = new Map();

const mainWindowOption: BrowserWindowConstructorOptions = {
  width: 1600,
  height: 900,
  show: false,
  autoHideMenuBar: true,
  title: "PostThem",
  titleBarStyle: "hidden",
  titleBarOverlay: {
    height: 40,
  },
  icon,
  webPreferences: {
    webviewTag: true,
    sandbox: false,
    preload: path.join(__dirname, "../preload/mainWindow.js"),
  },
};
const pluginWindowOption: BrowserWindowConstructorOptions = {
  title: "PostThem.plugin",
  show: false,
  webPreferences: {
    sandbox: false,
    preload: path.join(__dirname, "../preload/pluginWindow.js"),
  },
};

LOGGER.info("Application main thread started.");

const createHiddenWindow = (hiddenWindowOption: BrowserWindowConstructorOptions): void => {
  const hiddenWindow: BrowserWindow = new BrowserWindow(hiddenWindowOption);
  HIDDEN_WINDOWS.set(hiddenWindowOption.title!, hiddenWindow);
  hiddenWindow.loadURL(`data:text/html,
  <html lang="zh-CN">
    <head>
      <meta charset="UTF-8" />
      <title>${hiddenWindowOption.title}</title>
      <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
      <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
      />
    </head>
    <body/>
  </html>`).then(() => {});
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    hiddenWindow.webContents.openDevTools();
  }
};

const createWindow = (): void => {
  const mainWindow: BrowserWindow = new BrowserWindow(mainWindowOption);
  mainWindow.on("ready-to-show", mainWindow.show);
  mainWindow.on("closed", () => HIDDEN_WINDOWS.forEach(item => item.destroy()));
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).then(() => {});
    return { action: "deny" }; // 禁止Electron新建窗口
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]).then(() => {});
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../content/index.html")).then(() => {});
  }
};

app.whenReady().then(() => {
  electronApp.setAppUserModelId("powerinv.postThem.client");
  setupRenderLogging();
  setupRender2RenderIpc();
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window); // 设置默认快捷键
  });
  createHiddenWindow(pluginWindowOption);
  createWindow();
});

app.on("window-all-closed", () => {
  LOGGER.info("Application stopped.");
  app.quit();
});
