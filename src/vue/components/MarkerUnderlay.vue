<script setup lang="ts">
import { MARKER_CIRCLE_DIAMETER } from '../../ts/builtin-config';
import { useAppStore } from '../../ts/stores/app';

const appStore = useAppStore();

const props = defineProps<{
  readonly markerId: string;
  x: number;
  y: number;
}>();
</script>

<template>
  <div
    class="marker"
    :style="{
      '--marker-position-x': props.x,
      '--marker-position-y': props.y,
      '--marker-diameter': MARKER_CIRCLE_DIAMETER,
    }"
  >
    <div class="circle"></div>
    <span v-if="appStore.isDeveloperModeActive">{{ props.markerId }}</span>
  </div>
</template>

<style scoped lang="scss">
.marker {
  --blur-radius: 15px;
  --outline-width: 6px;
  position: absolute;
  left: calc(1px * var(--marker-position-x));
  top: calc(1px * var(--marker-position-y));
  width: calc(1px * var(--marker-diameter));
  height: calc(1px * var(--marker-diameter));
  transform-origin: top left;
  transform: translate(-50%, -50%);

  * {
    pointer-events: none;
    user-select: none;
  }

  display: grid;
  place-items: center center;
  font-family: sans-serif;
  font-size: x-large;

  .circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgb(211 211 211 / 50%);
    outline: 6px solid rgb(0 0 0 / 75%);
    filter: blur(var(--blur-radius));

    &.active {
      background-color: rgb(55 175 218 / 50%);
    }
  }
}
</style>
