import { CommonChannel, LoggerChannel } from "@common/model/ipcChannelModels";
import { RenderLogger } from "@preload/common/util/loggerUtil";
import { Logger } from "@sdk/index";
import { ipcRenderer } from "electron/renderer";

const LOGGER: Logger = RenderLogger.getInstance(LoggerChannel.LOGGER_LOG_MESSAGE_PRELOAD);

const RETRY_TIMEOUT: number = 1000;
const RETRY_MAX_TIME: number = 5;

const PORT_CACHE = {
  port: -1,
};

/**
 * 获取Http服务器的端口号
 *
 * @returns {Promise<number>} 端口号
 */
export const getHttpPort = async (): Promise<number> => {
  if (PORT_CACHE.port >= 0) {
    return PORT_CACHE.port;
  }
  for (let attempt: number = 0; attempt < RETRY_MAX_TIME; attempt++) {
    const port: number = await ipcRenderer.invoke(CommonChannel.COMMON_HTTP_SERVER_PORT_GETTER);
    if (port >= 0) {
      PORT_CACHE.port = port;
      return port;
    }
    LOGGER.info(`Get http port failed. Retrying... (retry ${attempt + 1}/${RETRY_MAX_TIME})`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_TIMEOUT));
  }
  LOGGER.error(`Get http port failed. Max retry count (${RETRY_MAX_TIME}) reached.`);
  return PORT_CACHE.port;
};
