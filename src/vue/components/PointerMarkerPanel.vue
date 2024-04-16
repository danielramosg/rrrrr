<script setup lang="ts">
import type { Writable } from 'ts-essentials';

import { strict as assert } from 'assert';
import { ref } from 'vue';
import { useArrayFilter } from '@vueuse/core';

import type { Marker } from '../../ts/stores/marker';

import { POINTER_MARKER_COORDINATES } from '../../ts/builtin-config';
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

const singlePixelDiv = ref<HTMLDivElement | null>(null);

const offsets = new Map<string, { x: number; y: number }>();

const onPointerDown = (event: PointerEvent, m: Marker) => {
  const { target } = event;
  assert(target instanceof HTMLElement);

  target.setPointerCapture(event.pointerId);

  assert(singlePixelDiv.value !== null);
  const containerRect = singlePixelDiv.value.getBoundingClientRect();
  const scaleX = containerRect.width;
  const scaleY = containerRect.height;

  const offset = {
    x: event.clientX / scaleX - m.x,
    y: event.clientY / scaleY - m.y,
  };
  offsets.set(m.id, offset);
};

const onPointerMove = (event: PointerEvent, m: Marker) => {
  const { target } = event;
  assert(target instanceof HTMLElement);

  if (!target.hasPointerCapture(event.pointerId)) return;

  assert(singlePixelDiv.value !== null);
  const containerRect = singlePixelDiv.value.getBoundingClientRect();
  const scaleX = containerRect.width;
  const scaleY = containerRect.height;

  const offset = offsets.get(m.id);
  assert(typeof offset !== 'undefined');

  // eslint-disable-next-line no-param-reassign
  const x = event.clientX / scaleX - offset.x;
  const y = event.clientY / scaleY - offset.y;
  moveMarker({ id: m.id, x, y });
};

const onPointerUpOrCancel = (event: PointerEvent, _: Marker) => {
  const { target } = event;
  assert(target !== null && target instanceof HTMLElement);

  target.releasePointerCapture(event.pointerId);
};
</script>

<template>
  <div class="abs-top-left">
    <div ref="singlePixelDiv" class="single-pixel abs-top-left"></div>
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
.single-pixel {
  width: 1px;
  height: 1px;
}

.marker-underlay {
  cursor: pointer;
}
</style>
