<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: number;
}>();

const formattedValue = computed(() => `${(props.value * 100).toFixed(1)}%`);
</script>

<template>
  <div id="user-satisfaction-container" class="score">
    <span>{{ title }}</span
    >:&nbsp;
    <span>{{ formattedValue }}</span>
  </div>
</template>
