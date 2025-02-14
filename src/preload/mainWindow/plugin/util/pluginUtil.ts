import { Logger } from "@sdk/index";
import { RenderLogger } from "@preload/common/util/loggerUtil";
import { LoggerChannel, RenderName } from "@common/model/ipcChannelModels";
import { callRender } from "@preload/common/util/ipcRenderUtil";
import { ForwardedRenderApi } from "@preload/common/forwardedRenderApi";

const LOGGER: Logger = RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);

type LoadPlugins = () => Promise<void>;

/**
 * 扫描并加载插件
 */
export const loadPlugins: LoadPlugins = async (): Promise<void> => {
  LOGGER.info("Start load plugins.");
  callRender(RenderName.PLUGIN, ForwardedRenderApi.PLUGIN_WINDOW_LOAD_ALL_PLUGINS);
  LOGGER.info("Plugins loading completed.");
};

/**
 * 插件工具类
 */
export interface PluginUtilType {
  loadPlugins: LoadPlugins;
}

export const PluginUtil: PluginUtilType = {
  loadPlugins,
};

