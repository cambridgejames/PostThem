import { ElectronAPI } from "@electron-toolkit/preload";
import Util from "@preload/util/index";

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown,
    util: Util
  }
}
