<template>
  {{ helloStr }}
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const helloStr = ref<string>();

const sayHello = window.utils.PluginUtil.createAspectProxy((value: string): string => {
  return `Hello, ${value}!`;
}, "postThem.homePage.sayHello");

onMounted(async () => {
  helloStr.value = await sayHello("world");
});
</script>

<style scoped>

</style>
