import { ForwardedRenderApi } from "@preload/common/forwardedRenderApi";
import { exposeApiForPreload, exposeApiForRender } from "@preload/common/util/apiExposeUtil";

import { aspectUtil } from "@preload/pluginProcess/util/aspectUtil";
import { loggerUtil } from "@preload/pluginProcess/util/loggerUtil";
import { callAspectProxy, getWebviewEntry, loadPlugins } from "@preload/pluginProcess/util/pluginUtil";

exposeApiForRender(ForwardedRenderApi.PLUGIN_WINDOW_LOAD_ALL_PLUGINS, loadPlugins);
exposeApiForRender(ForwardedRenderApi.PLUGIN_WINDOW_GET_WEBVIEW_ENTRY, getWebviewEntry);
exposeApiForRender(ForwardedRenderApi.PLUGIN_WINDOW_CALL_ASPECT_PROXY, callAspectProxy);

exposeApiForPreload("log", loggerUtil);
exposeApiForPreload("sdk", {
  aspect: aspectUtil,
});
