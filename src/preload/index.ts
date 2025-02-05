import * as ApiExposeUtil from "@preload/api/apiExposeUtil";

import { utils } from "@preload/util";
import { plugins } from "@preload/plugin";

// 向全部Web页面暴露Api
ApiExposeUtil.exposeApiForRender("util", utils);
ApiExposeUtil.exposeApiForRender("plugins", plugins);

// 将SDK定义的Api暴露给插件的preload脚本
ApiExposeUtil.exposeApiForPreload("sdk", {
  aspect: plugins.AspectUtil,
});
