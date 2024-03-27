<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { toReactive } from '@vueuse/core';

import { useModelStore } from '../../ts/stores/model';
import { parameterIds } from '../../ts/circular-economy-model';

const modelStore = useModelStore();
const initialParameters = toReactive(storeToRefs(modelStore).initialParameters);
</script>

<template>
  <div v-for="parameterId in parameterIds" :key="parameterId">
    <div>{{ parameterId }} = {{ initialParameters[parameterId] }}</div>
    <input
      type="range"
      min="0"
      max="4"
      step="0.001"
      v-model="initialParameters[parameterId]"
    />
  </div>
</template>

<style lang="scss"></style>
