import * as ApiExposeUtil from "@preload/mainWindow/api/apiExposeUtil";
import { utils } from "@preload/mainWindow/util";
import { plugins } from "@preload/mainWindow/plugin";
import { getLogger } from "@preload/mainWindow/util/loggerUtil";
import { LoggerChannel } from "@common/ipc/ipcChannel";

import { ipcRenderer } from "electron/renderer";
console.log(ipcRenderer.sendSync("TestPluginRender", "plugin", 5, 6, 7, 8));


// 向全部Web页面暴露Api
ApiExposeUtil.exposeApiForRender("util", utils);
ApiExposeUtil.exposeApiForRender("plugins", plugins);
ApiExposeUtil.exposeApiForRender("logger", getLogger(LoggerChannel.LOGGER_LOG_MESSAGE_WEB));

// 将SDK定义的Api暴露给插件的preload脚本
ApiExposeUtil.exposeApiForPreload("sdk", {
  aspect: plugins.AspectUtil,
});
ApiExposeUtil.exposeApiForPreload("logger", getLogger(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD));
