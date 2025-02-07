import { AspectUtilsType, Logger } from "./index";

declare global {
  interface Window {
    sdk: {
      aspect: AspectUtilsType;
    };
    logger: Logger;
  }
}
