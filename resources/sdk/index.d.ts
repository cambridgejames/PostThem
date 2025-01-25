import { AspectUtilsType } from "./index";

declare global {
  interface Window {
    sdk: {
      aspect: AspectUtilsType;
    }
  }
}
