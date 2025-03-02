<template>
  <webview v-if="httpPort !== -1" ref="webview" :key="props.pluginId" class="plugin-webview-container"
           :src="`http://localhost:${httpPort}/${props.contributionPoint}${props.entryFile}`"
           :preload="`file://${preloadPath}`" :partition="`persist:PLUGIN_${props.pluginId}`" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = defineProps({
  pluginId: {
    type: String,
    required: true,
  },
  contributionPoint: {
    type: String,
    required: true,
  },
  entryFile: {
    type: String,
    required: true,
  },
});

const httpPort = ref<number>(-1);
const preloadPath: string = window.utils.PathUtil.getPreloadDir("entryProcess.js");

onMounted(async () => {
  httpPort.value = await window.utils.HttpUtil.getHttpPort();
});
</script>

<style scoped lang="scss">
.plugin-webview-container {
  width: 100%;
  height: 100%;
}
</style>
