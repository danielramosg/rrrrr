import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const isPlaying = ref(false);
  const isFullscreen = ref(false);

  return { isPlaying, isFullscreen };
});
