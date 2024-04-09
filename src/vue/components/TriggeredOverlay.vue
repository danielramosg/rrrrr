<script setup lang="ts">
import type { DeepReadonly } from 'ts-essentials';

import { strict as assert } from 'assert';
import type { TriggerConfig } from '../../ts/config/config-schema-types';

import { useConfigStore } from '../../ts/stores/config';
import { useModelStore } from '../../ts/stores/model';
import { CircularEconomyModel } from '../../ts/circular-economy-model';

const props = defineProps<{ triggerConfig: DeepReadonly<TriggerConfig> }>();
const { triggerConfig } = props;
const { events } = triggerConfig;

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

const compiledEvents = events.map(({ condition, url }) => {
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
});
</script>

<template>
  <div
    v-for="{ condition, checkCondition, url, x, y } in compiledEvents"
    :key="`(${condition})-(${url})`"
    :style="{
      'backgroundImage': `url(${url.href})`,
      'display': checkCondition(record) ? 'block' : 'none',
      '--overlay-x': x,
      '--overlay-y': y,
    }"
    class="fill overlay-background"
  ></div>
</template>

<style scoped lang="scss">
.overlay-background {
  background-repeat: no-repeat;
  background-position-x: calc(1px * var(--overlay-x));
  background-position-y: calc(1px * var(--overlay-y));
}
</style>
