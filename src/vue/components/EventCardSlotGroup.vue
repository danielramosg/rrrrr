<script setup lang="ts">
import type { DeepReadonly } from 'ts-essentials';

import { strict as assert } from 'assert';
import { computed, ref, watch } from 'vue';

import type { EventCardSlotGroupConfig } from '../../ts/config/config-schema';

import { useSlotGroupsStore } from '../../ts/stores/slot-groups';
import MarkerSlot from './MarkerSlot.vue';
import EventCardCycler from './EventCardCycler.vue';

const props = defineProps<{
  slotGroupConfig: DeepReadonly<EventCardSlotGroupConfig>;
}>();
const { slotGroupConfig } = props;
const { markerSlot: markerSlotConfig } = slotGroupConfig;

const { slotGroups } = useSlotGroupsStore();
const slotGroup = slotGroups.find(({ id }) => id === slotGroupConfig.id);
assert(typeof slotGroup !== 'undefined');

const isActive = ref(false);

watch(isActive, (newIsActive, prevIsActive) => {});
</script>

<template>
  <div :data-slot-group-id="slotGroupConfig.id">
    <MarkerSlot
      :slot-group-id="slotGroupConfig.id"
      :slot-config="markerSlotConfig"
      @activate="isActive = true"
      @deactivate="isActive = false"
    />
    <EventCardCycler :slot-group-config="slotGroupConfig" :enabled="isActive" />
  </div>
</template>

<style scoped lang="scss"></style>
