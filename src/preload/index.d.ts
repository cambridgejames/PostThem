import { ElectronAPI } from "@electron-toolkit/preload";
import { utils } from "@preload/util";
import { Plugins } from "@preload/plugin";
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
