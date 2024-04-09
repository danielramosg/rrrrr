<script setup lang="ts">
import { computed } from 'vue';

import { useConfigStore } from '../../ts/stores/config';

const props = defineProps<{
  readonly url: string;
  readonly label: string;
  active: boolean;
}>();

const { toAssetUrl, extractAssetPosition } = useConfigStore();

const assetUrl = computed(() => toAssetUrl(props.url));
const position = computed(() => extractAssetPosition(assetUrl.value));
</script>

<template>
  <div
    class="action-card"
    :class="{ active: props.active }"
    :style="{
      '--card-x': position.x,
      '--card-y': position.y,
    }"
  >
    <img
      :src="assetUrl.href"
      :alt="label"
      class="image"
    /><!-- TODO: overlay label on top of image -->
    <div class="label">{{ label }}</div>
  </div>
</template>

<style scoped lang="scss">
.action-card {
  position: absolute;
  left: calc(1px * var(--card-x));
  top: calc(1px * var(--card-y));

  &:not(.active) {
    filter: blur(2px);
  }

  .image {
    position: relative;
  }

  .label {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center center;
    font-family: sans-serif;
    font-size: x-large;
    text-align: center;
  }
}
</style>
