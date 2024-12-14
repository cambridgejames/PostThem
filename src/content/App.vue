<template>
  <div ref="webviewContainer" style="width: 100%; height: 100%; display: flex; flex-direction: row;" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const webviewContainer = ref<HTMLElement>(null);

onMounted(() => {
  console.log(webviewContainer.value);
  const webviewPreferences: Array<String> = [
    "testWebview-01",
    "testWebview-02",
  ];
  for (const webview of webviewPreferences) {
    const webviewElement = document.createElement("webview");
    webviewElement.id = `webview_${webview}`;
    webviewElement.style.width = "100%";
    webviewElement.src = "https://www.baidu.com";
    webviewElement.partition = `persist:${webview}`;
    webviewContainer.value?.appendChild(webviewElement);
  }
});
</script>
