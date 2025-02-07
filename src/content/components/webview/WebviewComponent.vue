<template>
  <webview-default-tab v-if="props.configure === undefined" />
  <webview-tab v-else :configure="props.configure" />
</template>

<script setup lang="ts">
import { defineComponent, onMounted, PropType, watch } from "vue";
import { WebviewConfigureItem } from "@interface/common";

import WebviewDefaultTab from "@content/components/webview/WebviewDefaultTab.vue";
import WebviewTab from "@content/components/webview/WebviewTab.vue";

defineComponent({
  components: {
    WebviewDefaultTab,
    WebviewTab,
  },
});

const props = defineProps({
  configure: {
    type: Object as PropType<WebviewConfigureItem>,
    required: false,
    default: null,
  },
});

const uuid: string = crypto.randomUUID() + `_${props.configure ? "webview_" + props.configure.name : "default"}`;

onMounted(() => {
  window.logger.debug("WebviewComponent mounted.", uuid);
});

watch(() => props.configure, () => {
  window.logger.debug("WebviewComponent configure changed.", uuid, props.configure);
});
</script>

<style scoped>
</style>
