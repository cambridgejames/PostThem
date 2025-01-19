<template>
  <div id="navigate-tab-box" class="navigate-tab-box non-selectable">
    <div class="button-group-top">
      <div v-for="(item, index) in topViewBtn" :key="index" class="button-group-div">
        <div :class="['button-group-btn', { 'selected': item.enable }]" @click.stop="gotoPath(item.url)">
          <pt-icon :name="item.icon" :size="iconSize" />
          <div class="btn-tip-box">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div class="button-group-bottom">
      <div v-for="(item, index) in bottomViewBtn" :key="index" class="button-group-div">
        <div :class="['button-group-btn', { 'selected': item.enable }]" @click.stop="gotoPath(item.url)">
          <pt-icon :name="item.icon" :size="iconSize" />
          <div class="btn-tip-box">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, onMounted, watch } from "vue";
import { Router, useRouter } from "vue-router";
import { NavigateTabItem } from "@interface/components";

import PtIcon from "@content/components/ui/PtIcon.vue";

const props = defineProps({
  topBtn: {
    type: Array as PropType<NavigateTabItem[]>,
    require: false,
    default: [] as NavigateTabItem[],
  },
  bottomBtn: {
    type: Array as PropType<NavigateTabItem[]>,
    require: false,
    default: [] as NavigateTabItem[],
  },
});

const iconSize = "20px";
const router = useRouter();
const topViewBtn = ref<Array<NavigateTabItem>>([]);
const bottomViewBtn = ref<Array<NavigateTabItem>>([]);

const gotoPath = (target: string): void => {
  router.push({ path: target });
};

/**
 * 将侧边栏配置初始化成用于显示的模型
 *
 * @param tabItem 侧边栏配置
 * @returns 展示模型
 */
const initTabItem = (tabItem: NavigateTabItem): NavigateTabItem => {
  const solution = { ...tabItem } as NavigateTabItem;
  solution.enable = false;
  return solution;
};

/**
 * 根据当前Url计算侧边栏按钮的激活状态
 *
 * @param tabItem 侧边栏按钮
 * @param router 路由器
 * @returns 是否激活
 */
const isEnable = (tabItem: NavigateTabItem, router: Router): boolean => {
  const currentPath = router.currentRoute.value.path;
  return tabItem.url?.length > 0 && (currentPath === tabItem.url || currentPath.startsWith(`${tabItem.url}/`));
};

/**
 * 刷新侧边栏按钮的激活状态
 */
const updateEnableSign = (): void => {
  let isFound: boolean = false;
  for (const topViewBtnItem of topViewBtn.value) {
    const currentSign: boolean = !isFound && isEnable(topViewBtnItem, router);
    topViewBtnItem.enable = currentSign;
    isFound = isFound || currentSign;
  }
  for (const bottomViewBtnItem of bottomViewBtn.value) {
    const currentSign: boolean = !isFound && isEnable(bottomViewBtnItem, router);
    bottomViewBtnItem.enable = currentSign;
    isFound = isFound || currentSign;
  }
};

/**
 * 初始化侧边栏按钮列表
 */
const initBtnList = (): void => {
  for (const topBtnItem of props.topBtn) {
    topViewBtn.value.push(initTabItem(topBtnItem));
  }
  for (const bottomBtnItem of props.bottomBtn) {
    bottomViewBtn.value.push(initTabItem(bottomBtnItem));
  }
  updateEnableSign();
};

/**
 * 监听Path变化
 */
watch(() => router.currentRoute.value.path, updateEnableSign, { immediate: true, deep: true });

/**
 * 初始化组件
 */
onMounted(() => {
  initBtnList();
});

</script>

<style scoped lang="scss">
$button-group-btn-padding: 5px;
$button-group-btn-radius: 8px;
$button-group-btn-inner-padding: 5px;
$button-group-btn-tip-outer-padding: 0px;
$button-group-btn-tip-inner-radius: 4px;
$button-group-btn-tip-inner-padding: 8px;

.navigate-tab-box {
  width: var(--pt-main-asside-width);
  height: 100%;
  padding: calc(var(--pt-article-padding) - $button-group-btn-padding) 0;
  display: flex;
  flex-direction: column;
  background-color: var(--pt-color-theme-background);

  %btn-group {
    width: 100%;

    .button-group-div {
      width: 100%;
      height: var(--pt-main-asside-width);
      padding: $button-group-btn-padding;

      .button-group-btn {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: $button-group-btn-radius;
        padding: $button-group-btn-inner-padding;
        cursor: pointer;
        background-color: var(--pt-color-theme-background);

        .btn-tip-box {
          display: none;
          position: absolute;
          height: calc(100% - $button-group-btn-tip-outer-padding * 2);
          width: max-content;
          top: $button-group-btn-tip-outer-padding;
          left: calc(100% + $button-group-btn-inner-padding + $button-group-btn-tip-outer-padding);
          padding: 0 $button-group-btn-tip-inner-padding;
          font-size: var(--pt-size-text-normal);
          line-height: var(--pt-size-text-normal);
          vertical-align: middle;
          text-align: center;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--pt-color-theme-primary-border);
          border-radius: $button-group-btn-tip-inner-radius;
          color: var(--pt-color-theme-icon-fill);
          background-color: var(--pt-color-theme-primary-hover);
          z-index: 200;
        }

        .pt-icon {
          :deep(*) {
            fill: var(--pt-color-theme-icon-fill);
          }
        }

        &:hover {
          background-color: var(--pt-color-theme-primary-hover);
          .btn-tip-box {
            display: flex;
          }
        }

        &.selected {
          background-color: var(--pt-color-theme-primary);

          .pt-icon {
            :deep(*) {
              fill: var(--pt-color-theme-icon-fill-active);
            }
          }
        }
      }
    }
  }

  .button-group-top {
    height: 100%;
    @extend %btn-group;
  }

  .button-group-bottom {
    flex-shrink: 0;
    height: max-content;
    @extend %btn-group;
  }
}
</style>
