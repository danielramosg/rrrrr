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

const {
  config: {
    general: { assetBaseDir },
  },
} = useConfigStore();
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

const assetBaseUrl = new URL(`${assetBaseDir}/`, window.location.href);
const POSITIONAL_ASSET_REGEX = /_x([0-9]+)_y([0-9]+)\.[a-zA-Z0-9]+$/;
const compiledEvents = events.map(({ condition, url }) => {
  const resolvedUrl = new URL(url, assetBaseUrl);
  const matches = resolvedUrl.href.match(POSITIONAL_ASSET_REGEX);
  assert(matches !== null && matches.length === 3);
  const x = Number.parseInt(matches[1], 10);
  const y = Number.parseInt(matches[2], 10);
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
