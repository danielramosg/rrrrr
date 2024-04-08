<script setup lang="ts">
import type { DeepReadonly } from 'ts-essentials';

import { ref } from 'vue';

import type { SlotGroupConfig } from '../../ts/config/config-schema';

import SlotGroupElement from './SlotGroupElement.vue';

const props = defineProps<{ slotGroupConfig: DeepReadonly<SlotGroupConfig> }>();

const { slotGroupConfig } = props;

const slotGroupElements = ref<Array<typeof SlotGroupElement>>([]);
</script>

<template>
  <div :data-slot-group-id="slotGroupConfig.id">
    <SlotGroupElement
      ref="slotGroupElements"
      v-for="slotConfig in slotGroupConfig.slots"
      :key="slotConfig.id"
      :slot-group-id="slotGroupConfig.id"
      :slot-config="slotConfig"
    />
  </div>
</template>

<style scoped lang="scss"></style>
