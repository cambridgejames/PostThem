<template id="app">
  <title-menu-content class="pt-title-menu flex-item-frozen-size" />
  <div class="pt-main-layout flex-item-frozen-size">
    <navigate-tab class="pt-main-aside flex-item-frozen-size" :top-btn="topBtnList" :bottom-btn="bottomBtnList" />
    <div class="pt-main-content flex-item-frozen-size">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { topBtnList, bottomBtnList } from "@content/router/NavigateConfigure";

import TitleMenuContent from "@content/components/system/TitleMenuContent.vue";
import NavigateTab from "@content/components/ui/NavigateTab.vue";
</script>

<style lang="scss" scoped>
$title-menu-height: var(--pt-header-height);

#app {
  display: flex;
  flex-direction: column;
  color: var(--pt-color-theme-text-color);
  background-color: var(--pt-color-theme-background);

  .pt-title-menu {
    width: 100vw;
    height: var(--pt-header-height);
    background-color: var(--pt-color-theme-title);
  }

  .pt-main-layout {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: calc(100vh - var(--pt-header-height));
    background-color: var(--pt-color-theme-background-normal);

    .pt-main-aside {
      width: var(--pt-main-asside-width);
      height: 100%;
    }

    .pt-main-content {
      width: calc(100% - var(--pt-main-asside-width));
      height: 100%;
    }
  }
}
</style>
