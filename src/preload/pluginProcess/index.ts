import { registerOnRender } from "@preload/common/util/ipcRenderUtil";
import { ForwardedRenderApi } from "@preload/common/forwardedRenderApi";
import { callAspectProxy, loadPlugins } from "@preload/pluginProcess/util/pluginUtil";
import { exposeApiForPreload } from "@preload/common/util/apiExposeUtil";

import { aspectUtil } from "@preload/pluginProcess/util/aspectUtil";

registerOnRender(ForwardedRenderApi.PLUGIN_WINDOW_LOAD_ALL_PLUGINS, () => {
  loadPlugins().then(() => {});
});
registerOnRender(ForwardedRenderApi.PLUGIN_WINDOW_CALL_ASPECT_PROXY, callAspectProxy);

exposeApiForPreload("sdk", {
  aspect: aspectUtil,
});
