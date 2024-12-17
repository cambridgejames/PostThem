<template>
  <div class="webview-container">
    <webview v-show="isLoadFinish" ref="webview" :key="props.configure.id" class="webview"
             :src="props.configure.src" :partition="`persist:${props.configure.id}`"/>
    <div v-show="!isLoadFinish" class="loading">loading</div>
  </div>
  <div>{{ $route.fullPath }}</div>
</template>

<script setup lang="ts">
import { PropType, onMounted, ref } from "vue";
import { HTMLWebviewElement, WebviewConfigureItem } from "@interface/common";

const props = defineProps({
  configure: {
    type: Object as PropType<WebviewConfigureItem>,
    required: true,
  }
});

const webview = ref<HTMLWebviewElement>();
const isLoadFinish = ref<boolean>(false);

onMounted(() => {
  webview.value?.addEventListener("did-finish-load", () => {
    console.log("did-finish-load", props.configure.id);
    isLoadFinish.value = true
  });
});

</script>

<style scoped lang="scss">
.webview-container {
  width: 100%;
  height: calc(100% - 100px);

  .webview-slot-container, .webview, .loading {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .loading {
    background-color: #eee;
    text-align: center;
    vertical-align: middle;
  }
}
</style>
