<script setup lang="ts">
import type { DeepReadonly } from 'ts-essentials';

import type { CardSlotConfig, CardConfig } from '../../ts/config/config-schema';

import GameCard from './GameCard.vue';

const props = defineProps<{
  readonly cardSlotConfig: DeepReadonly<CardSlotConfig>;
  cardConfig: DeepReadonly<CardConfig> | null;
}>();
</script>

<template>
  <div
    :style="{
      '--card-x': cardSlotConfig.x,
      '--card-y': cardSlotConfig.y,
      '--card-angle': cardSlotConfig.angle,
    }"
    class="card-slot"
  >
    <template v-if="cardConfig !== null">
      <GameCard
        :url="cardConfig.url"
        :label="cardConfig.parameterTransformId"
        :active="true"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.card-slot {
  position: absolute;
  width: 236px;
  height: 325px;
  outline: 2px dotted gray;
  transform-origin: top left;
  --card-x-px: calc(1px * var(--card-x));
  --card-y-px: calc(1px * var(--card-y));
  transform: translateX(var(--card-x-px)) translateY(var(--card-y-px))
    rotate(calc(1deg * var(--card-angle)));
}
</style>
