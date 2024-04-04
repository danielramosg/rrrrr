<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { onKeyStroke } from '@vueuse/core';

import ScoreItem from './ScoreItem.vue';
import ControlPanel from './ControlPanel.vue';

import { useAppStore } from '../../ts/stores/app';
import { useModelStore } from '../../ts/stores/model';
import { Scores } from '../../ts/scores';
import { ignorePromise } from '../../ts/util/ignore-promise';

const appStore = useAppStore();
const modelStore = useModelStore();

watch(
  () => appStore.isFullscreen,
  (isFullscreen) => {
    console.log('Fullscreen toogled');
    ignorePromise(
      isFullscreen
        ? document.documentElement.requestFullscreen()
        : document.exitFullscreen(),
    );
  },
);

const enableControlPanel = ref(false);

const toggleControlPanel = () => {
  enableControlPanel.value = !enableControlPanel.value;
};

onKeyStroke('c', toggleControlPanel);

const circularityScore = computed(() => Scores.circularity(modelStore.record));
const userSatisfactionScore = computed(() =>
  Scores.userSatifaction(modelStore.record),
);

/*
// TODO: Sync button state and fullscreen state
if (!document.fullscreenEnabled)
  fullscreenToggleCheckboxBox.disabled = true;
fullscreenToggleCheckboxBox.addEventListener('input', () =>
    ignorePromise(
        fullscreenToggleCheckboxBox.checked
            ? document.documentElement.requestFullscreen()
            : document.exitFullscreen(),
    ),
);
*/
</script>

<template>
  <div class="fill">
    <div id="illustration-panel" class="illustration-panel fill"></div>
    <div ref="" class="viz-panel fill">
      <div id="model-viz-container" class="model-viz-container"></div>
      <ScoreItem
        title="Circularity"
        :value="circularityScore"
        class="score circularity-index"
      />
      <ScoreItem
        title="User Satisfaction"
        :value="userSatisfactionScore"
        class="score user-satisfaction"
      />
    </div>
    <div id="slot-panel" class="slot-panel fill"></div>
  </div>
  <ControlPanel
    @keydown="$event.stopPropagation()"
    :disabled="!enableControlPanel"
  />
</template>

<style lang="scss" scoped>
.illustration-panel {
  background-color: white;
}

.viz-panel {
  & > #model-viz-container {
    width: calc(1px * var(--svg-width));
    transform: scale(var(--svg-scale-factor));
    transform-origin: top left;
  }
}

.score {
  font-size: 64px;
  position: absolute;
  padding: 0.5ex;
}

.circularity-index {
  top: 0;
  left: 0;
}

.user-satisfaction {
  bottom: 0;
  right: 0;
}
</style>
