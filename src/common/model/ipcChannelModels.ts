/**
 * 日志记录Ipc调用通道
 */
export enum LoggerChannel {
  LOGGER_LOG_MESSAGE_PRELOAD = "log_message_preload",
  LOGGER_LOG_MESSAGE_WEB = "log_message_web",
  LOGGER_LOG_MESSAGE_PLUGIN = "log_message_plugin",
  LOGGER_LOG_MESSAGE_PLUGIN_WEB = "log_message_plugin_web",
  LOGGER_LOG_MESSAGE_DEFAULT = "log_message_default",
}

/**
 * 跨渲染进程Ipc调用通道
 */
export enum IpcForwardChannel {
  RENDER_TO_RENDER_REGISTER_CHANNEL = "render_to_render_register",
  RENDER_TO_RENDER_CHANNEL = "render_to_render",
  RENDER_TO_RENDER_ASYNC_CHANNEL = "render_to_render_async",
  RENDER_TO_RENDER_RETURN_CHANNEL = "render_to_render_return",
}

/**
 * 公共Ipc调用通道
 */
export enum CommonChannel {
  COMMON_HTTP_SERVER_PORT_GETTER = "http_server_port_getter",
  COMMON_PLUGIN_WEB_ENTRY_REGISTER = "plugin_web_entry_register",
}

/**
 * 跨渲染进程调用结果返回码
 */
export enum IpcReturnMessageCode {
  SUCCESS = "ipc.render2render.success",
  BROWSER_WINDOW_NOT_FOUND = "ipc.render2render.windowNotFound",
  API_REGISTER_FAILED = "ipc.render2render.registerFailed",
  API_NOT_FOUND = "ipc.render2render.apiNotFound",
  TARGET_API_CAUSED_EXCEPTION = "ipc.render2render.targetApiCausedException",
}
