<template>
  <div ref="webviewContainer" style="width: 100%; height: 50%; display: flex; flex-direction: row;" />
  <router-view style="width: 100%; height: 50%;" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ConfigureType, HTMLWebviewElement, WebviewConfigureItem } from "@interface/common";

const route = useRoute();

const webviewContainer = ref<HTMLElement>();
const webviewConfigure = ref<Array<WebviewConfigureItem>>([]);

// 读取用户配置
window.util.SettingsUtils.getConfigure("$.data", ConfigureType.WEBVIEW).then((data: Array<WebviewConfigureItem>) => {
  webviewConfigure.value = data;
  console.log(webviewConfigure.value);
});

onMounted(() => {
  console.log(route.path);
  const webviewPreferences: Array<String> = [
    "testWebview-01",
    "testWebview-02",
  ];
  for (const webview of webviewPreferences) {
    const webviewElement: HTMLWebviewElement = document.createElement("webview");
    webviewElement.id = `webview_${webview}`;
    webviewElement.style.width = "100%";
    webviewElement.src = "https://www.baidu.com";
    webviewElement.partition = `persist:${webview}`;
    webviewContainer.value?.appendChild(webviewElement);
  }
});
</script>

<style scoped>

</style>
