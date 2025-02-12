import { ipcRenderer } from "electron/renderer";

ipcRenderer.on("TestPluginRender", (_, ...args) => {
  ipcRenderer.send("TestPluginRender_return", args.join(", "));
});
