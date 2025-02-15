import { Utils } from "@preload/mainWindow/util";
import { Logger } from "@sdk/index";

declare global {
  interface Window {
    utils: Utils;
    logger: Logger;
  }
}
