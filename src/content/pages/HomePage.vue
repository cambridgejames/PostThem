<template>
  {{ sayHelloProxy("world") }}
</template>

<script setup lang="ts">
const sayHello = (value: string): string => {
  return `Hello, ${value}!`;
};
const sayHelloProxy = window.utils.PluginUtil.createAspectProxy(sayHello, "postThem.homePage.sayHello");
</script>

<style scoped>

</style>
