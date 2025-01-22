<template>
  {{ sayHelloProxy("world") }}
</template>

<script setup lang="ts">
const sayHello = (value: string): string => {
  return `Hello, ${value}!`;
};
const sayHelloProxy = window.plugins.AspectUtil.createProxy(sayHello, "postThem.homePage.sayHello");
</script>

<style scoped>

</style>
