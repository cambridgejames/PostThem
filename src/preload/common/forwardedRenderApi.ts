/**
 * 跨渲染进程Api定义
 */
export enum ForwardedRenderApi {
  MAIN_WINDOW_PLUGIN_PROXY_TARGET_PROCEED = "webProcess.aspectUtil.proxyTargetProceed",
  PLUGIN_WINDOW_LOAD_ALL_PLUGINS = "pluginProcess.pluginUtil.loadAllPlugins",
  PLUGIN_WINDOW_CALL_ASPECT_PROXY = "pluginProcess.aspectUtil.callAspectProxy",
}
