<script setup lang="ts">
import type { DeepReadonly, Writable } from 'ts-essentials';

import { difference } from 'lodash';
import { ref, computed, watchEffect, watch } from 'vue';
import { useArrayFilter } from '@vueuse/core';

import type { Marker } from '../../ts/stores/marker';
import type { SlotConfig } from '../../ts/config/config-schema';

import { SLOT_CIRCLE_DIAMETER } from '../../ts/builtin-config';
import { useMarkerStore } from '../../ts/stores/marker';
import { useSlotStore } from '../../ts/stores/slot';

import { Circle } from '../../ts/util/geometry/circle';

const props = defineProps<{
  readonly slotGroupId: string;
  readonly slotConfig: DeepReadonly<SlotConfig>;
}>();

const { slotConfig } = props;

const slotGroupId = ref(props.slotGroupId);
const slotId = `${slotGroupId.value}-${slotConfig.id}`;

const markerStore = useMarkerStore();
const { markerPositions } = markerStore;

const slotStore = useSlotStore();

const slotCircle = new Circle(
  slotConfig.x,
  slotConfig.y,
  SLOT_CIRCLE_DIAMETER / 2,
);

let previousContainedMarkers = new Array<Marker>();

const containedMarkers = useArrayFilter(
  markerPositions as Writable<typeof markerPositions>,
  (m) => slotCircle.containsPoint(m),
);

watchEffect(() => {
  const added = difference(containedMarkers.value, previousContainedMarkers);
  const removed = difference(previousContainedMarkers, containedMarkers.value);
  removed.forEach(({ id: markerId }) =>
    slotStore.addActivation({ slotId, markerId }),
  );
  added.forEach(({ id: markerId }) =>
    slotStore.addActivation({ slotId, markerId }),
  );
  previousContainedMarkers = containedMarkers.value;
});

const isActive = computed(() => containedMarkers.value.length > 0);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  activate: [ids: { slotId: string; slotGroupId: string }];
  deactivate: [ids: { slotId: string; slotGroupId: string }];
}>();

watch(
  () => isActive.value,
  (isActiveNow, isActivePrev) => {
    if (isActiveNow && !isActivePrev) {
      emit('activate', { slotId, slotGroupId: slotGroupId.value });
    } else {
      emit('deactivate', { slotId, slotGroupId: slotGroupId.value });
    }
  },
);
</script>

<template>
  <div
    :data-slot-id="slotConfig.id"
    class="slot"
    :class="{ active: isActive }"
    :style="{
      '--slot-x': slotConfig.x,
      '--slot-y': slotConfig.y,
      '--slot-radius': SLOT_CIRCLE_DIAMETER,
    }"
  >
    <div>{{ slotGroupId }}<br />{{ slotConfig.id }}</div>
  </div>
</template>

<style scoped lang="scss">
.slot {
  left: calc(1px * var(--slot-x));
  top: calc(1px * var(--slot-y));
  width: calc(1px * var(--slot-radius));
  height: calc(1px * var(--slot-radius));
  border-radius: 50%;
  position: absolute;
  transform: translate(-50%, -50%);

  border: solid 6px darkred; // TODO: change color to #aaa after finishing port to Vue 3
  background-color: #eee;
  box-sizing: content-box;

  &.active {
    border-color: #37afda;
    background-color: #a1d7ea;
  }

  * {
    pointer-events: none;
    user-select: none;
  }

  display: grid;
  place-items: center center;
  font-family: sans-serif;
  font-size: x-large;
  text-align: center;
}
</style>
