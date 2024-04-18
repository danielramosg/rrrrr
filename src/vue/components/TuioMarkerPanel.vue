<script setup lang="ts">
import type { Writable } from 'ts-essentials';

import { useArrayFilter } from '@vueuse/core';

import MarkerUnderlay from './MarkerUnderlay.vue';
import { useMarkerStore } from '../../ts/stores/marker';

const { markerPositions } = useMarkerStore();

const tuioMarkers = useArrayFilter(
  markerPositions as Writable<typeof markerPositions>,
  ({ id }) => id.startsWith('tuio-'),
);
</script>

<template>
  <div ref="container" class="abs-top-left">
    <MarkerUnderlay
      v-for="marker in tuioMarkers"
      :key="marker.id"
      :marker-id="marker.id"
      :x="marker.x"
      :y="marker.y"
    />
  </div>
</template>
