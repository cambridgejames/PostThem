import { LoggerChannel } from "@common/model/ipcChannelModels";
import { isEmpty } from "@common/util/stringUtil";
import { RenderLogger } from "@preload/common/util/loggerUtil";
import { PluginManager } from "@preload/pluginProcess/plugin/pluginManager";
import { Logger } from "@sdk/index";

const PLUGIN_MANAGER: PluginManager = PluginManager.getInstance();
const LOGGER: Logger = RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);
const LOGGER_DEFAULT: Logger = RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_DEFAULT);

/**
 * 获取插件的日志记录器
 *
 * @returns {Logger}
 */
const getLogger = (): Logger => {
  const pluginId: string | undefined = PLUGIN_MANAGER.findByCallStack()?.manifest?.uniqueId;
  if (isEmpty(pluginId)) {
    LOGGER.error("Get logger for plugin failed.\n", new Error("Get logger for plugin failed."));
    return LOGGER_DEFAULT;
  }
  return RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_PLUGIN, pluginId);
};

export const loggerUtil = {
  getLogger,
};
