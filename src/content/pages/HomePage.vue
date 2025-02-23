<template>
  {{ helloStr }}
  <webview ref="webview" key="props.configure.id" style="width: 300px; height: 300px;" src="https://bilibili.com"
           :preload="`file://${preloadPath}`" partition="persist:props.configure.id" />
</template>

<script setup lang="ts">
import { HTMLWebviewElement } from "@interface/common";
import { onMounted, ref } from "vue";

const preloadPath: string = window.utils.PathUtil.getPreloadDir("entryProcess.js");

const helloStr = ref<string>();

const webview = ref<HTMLWebviewElement>();

const sayHello = window.utils.PluginUtil.createAspectProxy((value: string): string => {
  return `Hello, ${value}!`;
}, "postThem.homePage.sayHello");

onMounted(async () => {
  helloStr.value = await sayHello("world");
  // webview.value!.addEventListener("dom-ready", () => webview.value!.openDevTools());
});
</script>

<style scoped>

</style>
