import { exposeApiForWeb } from "@preload/common/util/apiExposeUtil";
import { utils } from "@preload/webProcess/util";
import { getLogger } from "@preload/common/util/loggerUtil";
import { LoggerChannel } from "@common/model/ipcChannelModels";

// 向全部Web页面暴露Api
exposeApiForWeb("utils", utils);
exposeApiForWeb("logger", getLogger(LoggerChannel.LOGGER_LOG_MESSAGE_WEB));
