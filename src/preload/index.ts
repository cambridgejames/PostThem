import * as ApiExposeUtil from "@preload/api/apiExposeUtil";

import { utils } from "@preload/util";
import { plugins } from "@preload/plugin";

ApiExposeUtil.exposeApiForRender("util", utils);
ApiExposeUtil.exposeApiForRender("plugins", plugins);

const sdkApi = {
  aspect: plugins.AspectUtil,
};

ApiExposeUtil.exposeApiForPreload("sdk", sdkApi);
