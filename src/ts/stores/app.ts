import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useOptionStore } from './options';

export const useAppStore = defineStore('app', () => {
  const { autoStart, developerMode } = useOptionStore();

  const isPlaying = ref(autoStart);
  const isFullscreen = ref(false);
  const isDeveloperModeActive = ref(developerMode);

  return { isPlaying, isFullscreen, isDeveloperModeActive };
});
