import { registerOnRender } from "@preload/common/util/ipcRenderUtil";

registerOnRender("pluginWindow.testFunction.join", (...args: string[]) => {
  return args.join(", ");
});
