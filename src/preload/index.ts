import * as ApiExposeUtil from "@preload/api/apiExposeUtil";
import { utils } from "@preload/util";
import { plugins } from "@preload/plugin";
import { getLogger } from "@preload/util/loggerUtil";
import { LoggerChannel } from "@common/ipc/ipcChannel";

// 向全部Web页面暴露Api
ApiExposeUtil.exposeApiForRender("util", utils);
ApiExposeUtil.exposeApiForRender("plugins", plugins);
ApiExposeUtil.exposeApiForRender("logger", getLogger(LoggerChannel.LOGGER_LOG_MESSAGE_WEB));

// 将SDK定义的Api暴露给插件的preload脚本
ApiExposeUtil.exposeApiForPreload("sdk", {
  aspect: plugins.AspectUtil,
});
ApiExposeUtil.exposeApiForPreload("logger", getLogger(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD));
