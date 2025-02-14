/**
 * 跨渲染进程Api定义
 */
export enum ForwardedRenderApi {
  MAIN_WINDOW_PLUGIN_PROXY_TARGET_PROCEED = "mainWindow.aspectUtil.proxyTargetProceed",
  PLUGIN_WINDOW_LOAD_ALL_PLUGINS = "pluginWindow.pluginUtil.loadAllPlugins",
  PLUGIN_WINDOW_CREATE_ASPECT_PROXY = "pluginWindow.aspectUtil.createAspectProxy",
}
