<template>
  <div ref="titleMenuContent" class="title-menu-content">
    <div class="title-icon" />
    <div ref="titleMenuLeft" class="title-menu non-selectable" />
    <div class="title-draggable">
      PostThem - A very nice and useful alternative to "Postman" for everyone
    </div>
    <div ref="titleMenuRight" class="title-menu" />
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
$title-menu-height: var(--pt-header-height);
$title-icon-height: var(--pt-header-icon-size);

.title-menu-content {
  width: 100%;
  height: $title-menu-height;
  min-height: $title-menu-height;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  .title-icon {
    width: $title-menu-height;
    flex-shrink: 0;
    background-image: url("@content/assets/img/icon.png");
    background-position: center;
    background-size: $title-icon-height;
    background-repeat: no-repeat;
  }

  .title-menu {
    width: max-content;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
  }

  .title-draggable {
    width: 100%;
    -webkit-app-region: drag;
    user-select: none;
    text-align: center;
    line-height: $title-menu-height;
  }
}
</style>
