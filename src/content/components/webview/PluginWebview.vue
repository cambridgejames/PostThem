<template>
  <webview ref="webview" :key="props.src" class="plugin-webview-container"
           :src="`https://localhost:${httpPort}/${props.src}`" :preload="`file://${preloadPath}`"
           :partition="`persist:PLUGIN_${props.src}`" />
</template>

<script setup lang="ts">
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const httpPort: number = window.utils.HttpUtil.getHttpPort();
const preloadPath: string = window.utils.PathUtil.getPreloadDir("entryProcess.js");
</script>

<style scoped lang="scss">
.plugin-webview-container {
  width: 100%;
  height: 100%;
}
</style>
