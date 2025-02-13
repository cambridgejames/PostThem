import * as ApiExposeUtil from "@preload/mainWindow/api/apiExposeUtil";
import { utils } from "@preload/mainWindow/util";
import { plugins } from "@preload/mainWindow/plugin";
import { getLogger } from "@preload/mainWindow/util/loggerUtil";
import { callRender, LoggerChannel, RenderName } from "@common/util/ipcUtil";
import { IpcReturnMessage } from "@interface/common";

const data: IpcReturnMessage<string> = callRender(RenderName.PLUGIN, "pluginWindow.testFunction.join", 5, 6, 7, 8);
console.log(data.data);


// 向全部Web页面暴露Api
ApiExposeUtil.exposeApiForRender("util", utils);
ApiExposeUtil.exposeApiForRender("plugins", plugins);
ApiExposeUtil.exposeApiForRender("logger", getLogger(LoggerChannel.LOGGER_LOG_MESSAGE_WEB));

// 将SDK定义的Api暴露给插件的preload脚本
ApiExposeUtil.exposeApiForPreload("sdk", {
  aspect: plugins.AspectUtil,
});
ApiExposeUtil.exposeApiForPreload("logger", getLogger(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD));
