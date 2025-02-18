import { AspectUtilsType, Logger } from "./index";

declare global {
  interface Window {
    log: {
      getLogger: () => Logger;
    };
    sdk: {
      aspect: AspectUtilsType;
    };
  }
}
