<script setup lang="ts">
import type { DeepReadonly } from 'ts-essentials';

import { strict as assert } from 'assert';
import { ref, watchEffect } from 'vue';

import type { BasicSlotGroupConfig } from '../../ts/config/config-schema';

import { useSlotGroupsStore } from '../../ts/stores/slot-groups';
import MarkerSlot from './MarkerSlot.vue';

const props = defineProps<{
  readonly slotGroupConfig: DeepReadonly<BasicSlotGroupConfig>;
}>();
const { slotGroupConfig } = props;

const { slotGroups } = useSlotGroupsStore();
const slotGroup = slotGroups.find(({ id }) => id === slotGroupConfig.id);
assert(typeof slotGroup !== 'undefined');

const numActive = ref(0);

watchEffect(() =>
  slotGroup.parameterTransforms.forEach((pt, index) =>
    pt.setActive(numActive.value > index),
  ),
);
</script>

<template>
  <div :data-slot-group-id="slotGroupConfig.id">
    <MarkerSlot
      v-for="slotConfig in slotGroupConfig.slots"
      :key="slotConfig.id"
      :slot-group-id="slotGroupConfig.id"
      :slot-config="slotConfig"
      @activate="numActive += 1"
      @deactivate="numActive -= 1"
    />
  </div>
</template>

<style scoped lang="scss"></style>
