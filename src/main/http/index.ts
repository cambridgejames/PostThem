import { LoggerManager } from "@main/logger/loggerManager";
import { Logger } from "@sdk/index";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { getPortPromise } from "portfinder";

const LOGGER: Logger = LoggerManager.getInstance().getNormalLogger("root");
const PORT_GETTER_MINIMUM_PORT: number = 30000;

const serverOptions = async (request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(404);
  return response.end(`Resource "${request.url}" not found`);
};

/**
 * 初始化Http服务器
 *
 * @returns {Promise<void>} 初始化结果
 */
export const setupServer = async (): Promise<void> => {
  getPortPromise({ port: PORT_GETTER_MINIMUM_PORT }).then(port => {
    LOGGER.info(`Plugin server starting at ${port}.`);
    const server = createServer(serverOptions);
    server.listen(port, () => LOGGER.info(`Plugin server started on port ${port}.`));
  });
};
