<script setup lang="ts">
import type { DeepReadonly } from 'ts-essentials';

import type { CardSlotConfig, CardConfig } from '../../ts/config/config-schema';

import GameCard from './GameCard.vue';

const props = defineProps<{
  readonly cardSlotConfig: DeepReadonly<CardSlotConfig>;
  cardConfig: DeepReadonly<CardConfig> | null;
  active: boolean;
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
    <div class="label">{{ cardSlotConfig.id }}</div>
    <template v-if="cardConfig !== null">
      <GameCard
        :url="cardConfig.url"
        :label="cardConfig.parameterTransformId"
        :active="props.active"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.card-slot {
  position: absolute;
  width: 236px;
  height: 325px;
  background-color: rgba(255, 255, 255, 0.5);
  outline: 2px dotted gray;
  transform-origin: top left;
  --card-x-px: calc(1px * var(--card-x));
  --card-y-px: calc(1px * var(--card-y));
  transform: translateX(var(--card-x-px)) translateY(var(--card-y-px))
    rotate(calc(1deg * var(--card-angle)));

  & > .label {
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
