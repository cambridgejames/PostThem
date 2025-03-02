<template>
  <div class="webview-page">
    <div ref="webviewIndexContainer" class="webview-index-container">
      <div v-for="(item, index) in webviewConfigure.values()" :key="index"
           class="webview-index non-selectable"
           @click.left.stop="clickIndex(item.id)">
        {{ item.name }}
      </div>
    </div>
    <div class="webview-tab-container">
      <router-view :v-slot="{ WebviewComponent }">
        <keep-alive max="10">
          <component :is="WebviewComponent" :key="currentConfigure?.id" :configure="currentConfigure" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ConfigureType, WebviewConfigureItem } from "@interface/common";

import WebviewComponent from "@content/components/webview/WebviewComponent.vue";

const router = useRouter();

const webviewIndexContainer = ref<HTMLElement>();
const webviewConfigure = reactive<Map<String, WebviewConfigureItem>>(new Map());
const currentConfigure = ref<WebviewConfigureItem>();

// 读取用户配置
window.utils.SettingsUtil.getConfigure("$.data", ConfigureType.WEBVIEW).then((data: Array<WebviewConfigureItem>) => {
  data.forEach(item => webviewConfigure.set(item.id, item));
});

/**
 * 点击左侧目录处理函数
 *
 * @param id 被点击的配置Id
 */
const clickIndex = (id: string) => {
  currentConfigure.value = webviewConfigure.get(id);
  router.push({ name: `WEBVIEW_${id}` });
};
</script>

<style scoped lang="scss">
$index-width: 320px;

.webview-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;

  .webview-index-container {
    width: $index-width;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden auto;

    .webview-index {
      height: 50px;
      line-height: 50px;
      padding: 0 15px;
      cursor: pointer;

      &:hover {
        background-color: var(--pt-color-theme-primary-hover);
      }
    }
  }

  .webview-tab-container {
    width: calc(100% - $index-width);
    height: 100%;
    overflow: hidden;
  }
}
</style>
