<script setup lang="ts">
import type { Writable } from 'ts-essentials';

import { strict as assert } from 'assert';
import { ref } from 'vue';
import { useArrayFilter } from '@vueuse/core';

import type { Marker } from '../../ts/stores/marker';

import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  POINTER_MARKER_COORDINATES,
} from '../../ts/builtin-config';
import MarkerUnderlay from './MarkerUnderlay.vue';
import { useMarkerStore } from '../../ts/stores/marker';

const { markerPositions, addMarker, moveMarker } = useMarkerStore();

const pointerMarkers = useArrayFilter(
  markerPositions as Writable<typeof markerPositions>,
  ({ id }) => id.startsWith('pointer-marker-'),
);

POINTER_MARKER_COORDINATES.forEach(({ x, y }, i) =>
  addMarker({ id: `pointer-marker-${i}`, x, y }),
);

const container = ref<HTMLElement | null>(null);

const offsets = new Map<string, { x: number; y: number }>();

const onPointerDown = (event: PointerEvent, m: Marker) => {
  const { target } = event;
  assert(target !== null && target instanceof HTMLElement);

  target.setPointerCapture(event.pointerId);

  assert(container.value !== null);
  const containerRect = container.value.getBoundingClientRect();

  const offset = {
    x: (BOARD_WIDTH * event.clientX) / containerRect.width - m.x,
    y: (BOARD_HEIGHT * event.clientY) / containerRect.height - m.y,
  };
  offsets.set(m.id, offset);
};

const onPointerMove = (event: PointerEvent, m: Marker) => {
  const { target } = event;
  assert(target !== null && target instanceof HTMLElement);

  if (!target.hasPointerCapture(event.pointerId)) return;

  assert(container.value !== null);
  const containerRect = container.value.getBoundingClientRect();

  const offset = offsets.get(m.id);
  assert(typeof offset !== 'undefined');

  // eslint-disable-next-line no-param-reassign
  const x = (BOARD_WIDTH * event.clientX) / containerRect.width - offset.x;
  const y = (BOARD_HEIGHT * event.clientY) / containerRect.height - offset.y;
  moveMarker({ id: m.id, x, y });
};

const onPointerUpOrCancel = (event: PointerEvent, _: Marker) => {
  const { target } = event;
  assert(target !== null && target instanceof HTMLElement);

  target.releasePointerCapture(event.pointerId);
};
</script>

<template>
  <div ref="container" class="fill">
    <MarkerUnderlay
      v-for="marker in pointerMarkers"
      :key="marker.id"
      :marker-id="marker.id"
      :x="marker.x"
      :y="marker.y"
      class="marker-underlay"
      @pointerdown="onPointerDown($event, marker)"
      @pointermove="onPointerMove($event, marker)"
      @pointerup="onPointerUpOrCancel($event, marker)"
      @pointercancel="onPointerUpOrCancel($event, marker)"
    />
  </div>
</template>

<style scoped lang="scss">
.marker-underlay {
  cursor: pointer;
}
</style>
