import { ElectronAPI } from "@electron-toolkit/preload";
import { utils } from "@preload/mainWindow/util";
import { Plugins } from "@preload/mainWindow/plugin";
import { Logger } from "@sdk/index";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    util: typeof utils;
    plugins: Plugins
    logger: Logger;
  }
}
