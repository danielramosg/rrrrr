import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useOptionStore } from './options';

export const useAppStore = defineStore('app', () => {
  const { autoStart } = useOptionStore();

  const isPlaying = ref(autoStart);
  const isFullscreen = ref(false);

  return { isPlaying, isFullscreen };
});
