<template>

</template>

<script setup lang="ts">
import { onMounted } from "vue";

const sayHello = (value: string): string => {
  return `Hello, ${value}`;
};
const sayHelloProxy = window.plugins.AspectUtil.createProxy(sayHello, "123456");

onMounted(() => {
  console.log(sayHelloProxy("111"));
  window.plugins.PluginUtil.loadPlugins();
});
</script>

<style scoped>

</style>
