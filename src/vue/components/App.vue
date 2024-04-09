<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { onKeyStroke } from '@vueuse/core';

import PointerMarkerPanel from './PointerMarkerPanel.vue';
import TuioMarkerPanel from './TuioMarkerPanel.vue';
import ScoreItem from './ScoreItem.vue';
import ControlPanel from './ControlPanel.vue';
import TriggeredOverlay from './TriggeredOverlay.vue';
import SlotGroup from './SlotGroup.vue';

import { useOptionStore } from '../../ts/stores/options';
import { useConfigStore } from '../../ts/stores/config';
import { useAppStore } from '../../ts/stores/app';
import { useModelStore } from '../../ts/stores/model';
import { Scores } from '../../ts/scores';
import { ignorePromise } from '../../ts/util/ignore-promise';

const options = useOptionStore();
const { config } = useConfigStore();
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
    <div id="illustration-panel" class="illustration-panel fill">
      <TriggeredOverlay
        v-for="triggerConfig in config.triggers"
        :key="triggerConfig.id"
        :trigger-config="triggerConfig"
      >
      </TriggeredOverlay>
    </div>
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
    <div class="slot-panel fill">
      <SlotGroup
        v-for="slotGroupConfig in config.interaction.slotGroups"
        :key="slotGroupConfig.id"
        :slot-group-config="slotGroupConfig"
      ></SlotGroup>
      <PointerMarkerPanel v-if="options.usePointerMarkers"></PointerMarkerPanel>
      <TuioMarkerPanel
        v-if="options.useTuioMarkers"
        class="pointer-events-fallthrough"
      ></TuioMarkerPanel>
    </div>
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

.slot-panel {
  touch-action: none;
}

.pointer-events-fallthrough {
  pointer-events: none;
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
