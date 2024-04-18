import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useOptionStore } from './options';

export const useAppStore = defineStore('app', () => {
  const { autoStart, developerMode } = useOptionStore();

  const isPlaying = ref(autoStart);
  const isFullscreen = ref(false);
  const isDeveloperModeActive = ref(developerMode);

  const scale = ref(1);

  return { isPlaying, isFullscreen, isDeveloperModeActive, scale };
});
