<template id="app">
  <title-menu-content class="title-menu" />
  <router-view />
</template>

<script setup lang="ts">
import TitleMenuContent from "@content/components/system/TitleMenuContent.vue";
import { defineComponent } from "vue";

defineComponent({
  components: {
    TitleMenuContent,
  },
});
</script>

<style>
#app {
  background-color: var(--pt-color-theme-background);

  .title-menu {
    background-color: var(--pt-color-theme-title);
  }
}
</style>
