<script setup lang="ts">
import type { DeepReadonly } from 'ts-essentials';

import { strict as assert } from 'assert';
import { ref, watchEffect } from 'vue';

import type { ActionCardSlotGroupConfig } from '../../ts/config/config-schema';

import { useSlotGroupsStore } from '../../ts/stores/slot-groups';
import MarkerSlot from './MarkerSlot.vue';
import CardSlot from './CardSlot.vue';

const props = defineProps<{
  slotGroupConfig: DeepReadonly<ActionCardSlotGroupConfig>;
}>();
const { slotGroupConfig } = props;

const { slotGroups } = useSlotGroupsStore();
const slotGroup = slotGroups.find(({ id }) => id === slotGroupConfig.id);
assert(typeof slotGroup !== 'undefined');

const numActive = ref(0);

watchEffect(() => {
  slotGroup.parameterTransforms.forEach((pt, index) => {
    const active = numActive.value > index;
    if (pt.active !== active) {
      // eslint-disable-next-line no-param-reassign
      pt.active = active;
    }
  });
});
</script>

<template>
  <div :data-slot-group-id="slotGroupConfig.id">
    <template v-for="slotConfig in slotGroupConfig.slots" :key="slotConfig.id">
      <MarkerSlot
        :slot-group-id="slotGroupConfig.id"
        :slot-config="slotConfig.markerSlot"
      />
      <CardSlot :card-slot-config="slotConfig.cardSlot" :card-config="null" />
    </template>
  </div>
</template>

<style scoped lang="scss"></style>
