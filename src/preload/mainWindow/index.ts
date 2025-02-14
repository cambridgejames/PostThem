import * as ApiExposeUtil from "@preload/common/util/apiExposeUtil";
import { utils } from "@preload/mainWindow/util";
import { plugins } from "@preload/mainWindow/plugin";
import { getLogger } from "@preload/common/util/loggerUtil";
import { LoggerChannel } from "@common/model/ipcChannelModels";

// 向全部Web页面暴露Api
ApiExposeUtil.exposeApiForWeb("util", utils);
ApiExposeUtil.exposeApiForWeb("plugins", plugins);
ApiExposeUtil.exposeApiForWeb("logger", getLogger(LoggerChannel.LOGGER_LOG_MESSAGE_WEB));

// 将SDK定义的Api暴露给插件的preload脚本
ApiExposeUtil.exposeApiForPreload("sdk", {
  aspect: plugins.AspectUtil,
});
ApiExposeUtil.exposeApiForPreload("logger", getLogger(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD));
