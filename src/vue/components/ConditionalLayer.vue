<script setup lang="ts">
import type { DeepReadonly } from 'ts-essentials';

import { computed } from 'vue';

import type { ConditionalLayerConfig } from '../../ts/config/config-schema-types';

import { useConfigStore } from '../../ts/stores/config';
import { useModelStore } from '../../ts/stores/model';
import { CircularEconomyModel } from '../../ts/circular-economy-model';

const props = defineProps<{
  layerConfig: DeepReadonly<ConditionalLayerConfig>;
}>();

const { extractAssetPosition, toAssetUrl } = useConfigStore();
const { record } = useModelStore();

type Condition = (r: typeof record) => boolean;

const conditionParameters = `{ ${CircularEconomyModel.elementIds.join(', ')} }`;
function compile(condition: string): (r: typeof record) => boolean {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function(
    conditionParameters,
    `return (${condition}) === true;`,
  ) as Condition;
}

function compileLayer({ condition, url }: ConditionalLayerConfig): {
  checkCondition: Condition;
  condition: string;
  url: URL;
  x: number;
  y: number;
} {
  const resolvedUrl = toAssetUrl(url);
  const { x, y } = extractAssetPosition(resolvedUrl);
  const checkCondition = compile(condition);
  return {
    checkCondition,
    condition,
    url: resolvedUrl,
    x,
    y,
  };
}

const compiledLayer = computed(() => compileLayer(props.layerConfig));
</script>

<template>
  <img
    :src="compiledLayer.url.href"
    v-if="compiledLayer.checkCondition(record)"
    class="positioned-layer"
    :style="{
      '--layer-x': compiledLayer.x,
      '--layer-y': compiledLayer.y,
    }"
  />
</template>

<style scoped lang="scss">
.positioned-layer {
  position: absolute;
  top: calc(1px * var(--layer-y));
  left: calc(1px * var(--layer-x));
}
</style>
