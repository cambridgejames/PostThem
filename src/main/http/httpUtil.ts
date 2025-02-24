import { formatException } from "@common/util/exceptionUtil";
import { isEmpty } from "@common/util/stringUtil";
import { LoggerManager } from "@main/logger/loggerManager";
import { Logger } from "@sdk/index";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { getPortPromise } from "portfinder";

const LOGGER: Logger = LoggerManager.getInstance().getNormalLogger("root");
const PORT_GETTER_MINIMUM_PORT: number = 30000;

interface HttpRequest {
  path: string;
  fullPath: string;
  method: string;
  headers: {
    [key: string]: string | string[];
  };
  params: {
    [key: string]: string | string[];
  };
  body?: string;
}
export type HttpCallback = (request: HttpRequest, response: ServerResponse) => void;

/**
 * Http服务器上下文路径管理器
 */
class ContextPathManager {
  private static INSTANCE: ContextPathManager;
  private readonly HTTP_CALLBACK_MAP: Map<string, HttpCallback> = new Map();

  private constructor() {}

  /**
   * 获取Http服务器上下文路径管理器实例
   *
   * @return {ContextPathManager} Http服务器上下文路径管理器实例
   */
  public static getInstance(): ContextPathManager {
    if (!this.INSTANCE) {
      this.INSTANCE = new ContextPathManager();
    }
    return this.INSTANCE;
  }

  /**
   * 注册Http上下文路径
   *
   * @param {HttpCallback} callback 访问该路径时的回调函数
   * @returns {string} Http上下文路径
   */
  public registerContextPath(callback: HttpCallback): string {
    const contextPath: string = crypto.randomUUID();
    this.HTTP_CALLBACK_MAP.set(contextPath, callback);
    return contextPath;
  }

  /**
   * 校验Http上下文路径是否合法
   *
   * @param {string} contextPath Http上下文路径
   * @returns {boolean} 校验结果
   */
  public validateContextPath(contextPath: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(contextPath)
      && this.HTTP_CALLBACK_MAP.has(contextPath.toLowerCase());
  }

  /**
   * 根据Http上下文路径获取回调函数
   *
   * @param {string} contextPath Http上下文路径
   * @returns {HttpCallback | undefined} 访问该路径时的回调函数
   */
  public getCallback(contextPath: string): HttpCallback | undefined {
    if (!this.validateContextPath(contextPath)) {
      return undefined;
    }
    return this.HTTP_CALLBACK_MAP.get(contextPath.toLowerCase());
  }
}

/**
 * Http请求处理函数
 *
 * @param {IncomingMessage} request Http请求
 * @param {ServerResponse} response Http返回值
 * @returns {Promise<void>}
 */
const httpRequestListener = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  const httpRequest: HttpRequest = await parseHttpRequest(request);
  const contextPath = parseContextPath(httpRequest);
  if (contextPath) {
    const httpCallback: HttpCallback | undefined = ContextPathManager.getInstance().getCallback(contextPath);
    if (httpCallback) {
      setTimeout(() => {
        try {
          httpCallback(httpRequest, response);
        } catch (exception) {
          LOGGER.error(`[HTTP SERVER] Exception caused when resolving context path "${contextPath}".\n`, formatException(exception));
          if (!response.writableEnded) {
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end(`Exception caused when resolving context path "${contextPath}".`, "utf-8");
          }
        }
      }, 1);
      return;
    }
  }
  LOGGER.warn(`[HTTP SERVER] Resource "${httpRequest.path}" not found.`);
  response.writeHead(404, { "Content-Type": "text/plain" });
  response.end(`Resource "${httpRequest.path}" not found.`, "utf-8");
};

/**
 * 转换请求报文
 *
 * @param {IncomingMessage} request Http请求
 * @returns {HttpRequest} Http请求报文
 */
const parseHttpRequest = async (request: IncomingMessage): Promise<HttpRequest> => {
  let bodyStr: string | undefined = undefined;
  request.on("data", chunk => bodyStr = isEmpty(bodyStr) ? chunk.toString() : (bodyStr + chunk.toString()));
  const urlObj: URL = new URL(`http://${request.headers.host || "localhost"}${request.url!}`);
  const searchParams = {};
  urlObj.searchParams.forEach((value: string, key: string) => searchParams[key] = value);
  return new Promise<HttpRequest>(resolve => request.on("end", () => resolve({
    path: urlObj.pathname,
    fullPath: request.url!,
    method: request.method!,
    headers: request.headers,
    params: searchParams,
    body: bodyStr,
  } as HttpRequest)));
};

/**
 * 获取Http上下文路径
 *
 * @param {HttpRequest} httpRequest Http请求报文
 * @returns {string | undefined} Http上下文路径
 */
const parseContextPath = (httpRequest: HttpRequest): string | undefined => {
  const pathList: string[] = httpRequest.path.split("/").filter((value: string) => !isEmpty(value));
  if (pathList.length === 0 || !ContextPathManager.getInstance().validateContextPath(pathList[0])) {
    return undefined;
  }
  httpRequest.path = "/" + pathList.slice(1).join("/");
  return pathList[0];
};

/**
 * 注册Http上下文路径
 *
 * @param {HttpCallback} callback 访问该路径时的回调函数
 * @returns {string} Http上下文路径
 */
export const registerContextPath = (callback: HttpCallback): string => {
  return ContextPathManager.getInstance().registerContextPath(callback);
};

/**
 * 初始化Http服务器
 *
 * @param {() => {}} callback 初始化完成后的回调函数
 * @returns {Promise<void>} 初始化结果
 */
export const setupServer = async (callback?: () => {}): Promise<void> => {
  getPortPromise({ port: PORT_GETTER_MINIMUM_PORT }).then(port => {
    LOGGER.info(`[HTTP SERVER] Http server starting at ${port}.`);
    createServer(httpRequestListener).listen(port, () => {
      LOGGER.info(`[HTTP SERVER] Http server started on port ${port}, Calling back.`);
      try {
        callback?.();
        LOGGER.info(`[HTTP SERVER] Http server on port ${port} finished to call back.`);
      } catch (exception) {
        LOGGER.error(`[HTTP SERVER] Http server on port ${port} caused exception when call back.\n`, formatException(exception));
      }
    });
  });
};
