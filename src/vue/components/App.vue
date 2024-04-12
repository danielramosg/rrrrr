<script setup lang="ts">
import { strict as assert } from 'assert';
import { ref, computed, watch, watchEffect, onMounted } from 'vue';
import { onKeyStroke } from '@vueuse/core';

import PointerMarkerPanel from './PointerMarkerPanel.vue';
import TuioMarkerPanel from './TuioMarkerPanel.vue';
import ScoreItem from './ScoreItem.vue';
import ControlPanel from './ControlPanel.vue';
import TriggeredOverlay from './TriggeredOverlay.vue';
import BasicSlotGroup from './BasicSlotGroup.vue';
import ActionCardSlotGroup from './ActionCardSlotGroup.vue';
import EventCardSlotGroup from './EventCardSlotGroup.vue';
import ModelVisualization from './ModelVisualization.vue';

import { HOTKEYS } from '../../ts/builtin-config';
import { useOptionStore } from '../../ts/stores/options';
import { useConfigStore } from '../../ts/stores/config';
import { useAppStore } from '../../ts/stores/app';
import { useModelStore } from '../../ts/stores/model';
import { Scores } from '../../ts/scores';
import { ignorePromise } from '../../ts/util/ignore-promise';
import { ModelSimulator } from '../../ts/model-simulator';
import {
  CircularEconomyModel,
  type FlowIds,
  type ParameterIds,
  type StockIds,
  type VariableIds,
} from '../../ts/circular-economy-model';
import { Runner } from '../../ts/util/runner';

const options = useOptionStore();
const { config } = useConfigStore();
const appStore = useAppStore();
const modelStore = useModelStore();

const model = new CircularEconomyModel();
const modelSimulator = new ModelSimulator<
  StockIds,
  FlowIds,
  VariableIds,
  ParameterIds
>(
  model,
  { ...config.model.initialStocks },
  { ...config.model.initialParameters },
  0.0,
  config.simulation.deltaPerSecond,
  config.simulation.maxStepSize,
);

const runner = new Runner();

watchEffect(() => {
  if (appStore.isPlaying) runner.play();
  else runner.pause();
});

watchEffect(() => {
  Object.assign(modelSimulator.parameters, {
    ...modelStore.transformedParameters,
  });
  console.log('Update model parameters', modelSimulator.parameters);
});

runner.tick();

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

const toggleDeveloperMode = () => {
  appStore.isDeveloperModeActive = !appStore.isDeveloperModeActive;
};

const togglePlayPause = () => {
  appStore.isPlaying = !appStore.isPlaying;
};

const toggleFullscreen = () => {
  appStore.isFullscreen = !appStore.isFullscreen;
};

onKeyStroke(HOTKEYS.controlPanel.key, toggleControlPanel);
onKeyStroke(HOTKEYS.developerMode.key, toggleDeveloperMode);
onKeyStroke(HOTKEYS.run.key, togglePlayPause);
onKeyStroke(HOTKEYS.fullscreen.key, toggleFullscreen);

watchEffect(() => {
  if (appStore.isPlaying) runner.play();
  else runner.pause();
});

const circularityScore = computed(() => Scores.circularity(modelStore.record));
const userSatisfactionScore = computed(() =>
  Scores.userSatifaction(modelStore.record),
);

const modelVisualization = ref<typeof ModelVisualization | null>(null);
onMounted(() => {
  const tick = (deltaMs: DOMHighResTimeStamp) => {
    const { t: lastT } = modelSimulator.record;
    modelSimulator.tick(deltaMs);
    const { t: currentT } = modelSimulator.record;
    const deltaT = currentT - lastT;

    const { record } = modelSimulator;
    modelStore.$patch({ record });
    assert(modelVisualization.value !== null);
    modelVisualization.value.update(deltaMs, deltaT, modelSimulator.record);
  };
  runner.on('tick', tick);
});
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
      <ModelVisualization ref="modelVisualization" />
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
      <template
        v-for="slotGroupConfig in config.interaction.slotGroups"
        :key="slotGroupConfig.id"
      >
        <BasicSlotGroup
          :slot-group-config="slotGroupConfig"
          v-if="slotGroupConfig.type === 'basic'"
        ></BasicSlotGroup>
        <ActionCardSlotGroup
          :slot-group-config="slotGroupConfig"
          v-if="slotGroupConfig.type === 'action-card'"
        ></ActionCardSlotGroup>
        <EventCardSlotGroup
          :slot-group-config="slotGroupConfig"
          v-if="slotGroupConfig.type === 'event-card'"
        ></EventCardSlotGroup>
      </template>
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
