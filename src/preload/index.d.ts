import { ElectronAPI } from "@electron-toolkit/preload";
import { utils } from "@preload/util";
import { Plugins } from "@preload/plugin";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    util: typeof utils;
    plugins: Plugins
  }
}
