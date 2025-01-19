<template>
  <component :is="ptIconComponent" :style="`--pt-icon-size: ${props.size}`" class="pt-icon" />
</template>

<script setup lang="ts">
import { PropType } from "vue";
import * as ElementPlusIconVue from "@element-plus/icons-vue";

const props = defineProps({
  name: {
    type: String as PropType<string>,
    require: true,
    default: () => null,
  },
  size: {
    type: String as PropType<string>,
    require: false,
    default: "14px",
  },
});

const ptIconComponent = ElementPlusIconVue[props.name];

</script>

<style lang="scss" scoped>
.pt-icon {
  width: var(--pt-icon-size);
  height: var(--pt-icon-size);
}
</style>
