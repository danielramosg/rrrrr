<script setup lang="ts">
import { useConfigStore } from '../../ts/stores/config';

const props = defineProps<{
  readonly url: string;
  readonly label: string;
  active: boolean;
}>();

const { toAssetUrl } = useConfigStore();
</script>

<template>
  <div class="action-card" :class="{ active: props.active }">
    <img
      :src="toAssetUrl(props.url).href"
      :alt="label"
    /><!-- TODO: overlay label on top of image -->
    {{ label }}}
  </div>
</template>

<style scoped lang="scss">
.action-card {
  position: absolute;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);

  &.active {
    border: 2px solid red;
  }
}
</style>
