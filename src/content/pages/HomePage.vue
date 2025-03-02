<template>
  <div class="home-page-content">
    <div class="hello-str-content">{{ helloStr }}</div>
    <plugin-webview v-if="!isEmpty(mainTipsPluginId)" class="main-tip-content" :plugin-id="mainTipsPluginId"
                    contribution-point="postThem.webview.homePage.mainTips" :entry-file="entryFile" />
  </div>
</template>

<script setup lang="ts">
import PluginWebview from "@content/components/webview/PluginWebview.vue";
import { onMounted, ref } from "vue";

const helloStr = ref<string>();
const mainTipsPluginId = ref<string>("");
const entryFile = ref<string>("");

const sayHello = window.utils.PluginUtil.createAspectProxy((value: string): string => {
  return `Hello, ${value}!`;
}, "postThem.aspect.homePage.sayHello");
const isEmpty = window.utils.StringUtil.isEmpty;

onMounted(async () => {
  helloStr.value = await sayHello("world");
  const mainTipEntry = await window.utils.PluginUtil.getWebviewEntry("postThem.webview.homePage.mainTips");
  const mainTipEntries = Object.entries<string>(mainTipEntry);
  const [pluginId, webEntry] = mainTipEntries.length > 0 ? mainTipEntries[0] : ["", "/index.html"];
  mainTipsPluginId.value = pluginId;
  entryFile.value = webEntry;
});
</script>

<style scoped>
.home-page-content {
  width: 100%;
  height: 100%;
  padding: var(--pt-article-padding);

  .hello-str-content {
    width: 100%;
    height: 50px;
    font-size: 30px;
    line-height: 50px;
    font-weight: bold;
  }

  .main-tip-content {
    display: block;
    margin-top: var(--pt-article-padding);
    width: 100%;
    height: calc(100% - var(--pt-article-padding) - 50px);
    overflow: hidden;
  }
}
</style>
