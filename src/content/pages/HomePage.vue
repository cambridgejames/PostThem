<template>
  {{ sayHelloProxy("world") }}
</template>

<script setup lang="ts">
const sayHello = (value: string): string => {
  return `Hello, ${value}!`;
};
const sayHelloProxy = window.plugins.AspectUtil.createAspectProxy(sayHello, "postThem.homePage.sayHello");
</script>

<style scoped>

</style>
