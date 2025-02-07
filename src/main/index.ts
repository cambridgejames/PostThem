import { app, shell, BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { LoggerManager } from "@main/logger/loggerManager";
import { setupRenderLogging } from "@main/logger/loggerUtil";

import * as path from "node:path";

const LOGGER = LoggerManager.getInstance().getNormalLogger("root");
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
    preload: path.join(__dirname, "../preload/index.js"),
  },
};

LOGGER.info("Application main thread started.");

const createWindow = (): void => {
  const mainWindow: BrowserWindow = new BrowserWindow(mainWindowOption);
  mainWindow.on("ready-to-show", mainWindow.show);
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
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window); // 设置默认快捷键
  });
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    LOGGER.info("Application stopped.");
    app.quit();
  }
});
