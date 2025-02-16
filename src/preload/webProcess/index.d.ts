import { Utils } from "@preload/webProcess/util";
import { Logger } from "@sdk/index";

declare global {
  interface Window {
    utils: Utils;
    logger: Logger;
  }
}
