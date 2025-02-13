import { registerOnRender } from "@common/util/ipcUtil";

registerOnRender("pluginWindow.testFunction.join", (...args: string[]) => {
  return args.join(", ");
});
