import { ElectronAPI } from "@electron-toolkit/preload";
import Util from "@preload/util/index";
import { Plugins } from "@preload/plugin";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    util: Util;
    plugins: Plugins
  }
}
