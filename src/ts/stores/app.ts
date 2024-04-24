import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useOptionStore } from './options';

export const useAppStore = defineStore('app', () => {
  const optionStore = useOptionStore();

  const isPlaying = ref(optionStore.autoStart);
  const isFullscreen = ref(false);
  const isDeveloperModeActive = ref(optionStore.developerMode);
  const highlightDerivatives = ref(optionStore.highlightDerivatives);
  const showMarkerSlotLabels = ref(optionStore.markerSlotLabels);

  const scale = ref(1);

  return {
    isPlaying,
    isFullscreen,
    isDeveloperModeActive,
    highlightDerivatives,
    showMarkerSlotLabels,
    scale,
  };
});
