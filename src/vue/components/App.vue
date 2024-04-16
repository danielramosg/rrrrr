<script setup lang="ts">
import { strict as assert } from 'assert';
import { ref, watch, watchEffect, onMounted } from 'vue';
import { onKeyStroke } from '@vueuse/core';

import PointerMarkerPanel from './PointerMarkerPanel.vue';
import TuioMarkerPanel from './TuioMarkerPanel.vue';
import ScoreTable from './ScoreTable.vue';
import ControlPanel from './ControlPanel.vue';
import ConditionalLayer from './ConditionalLayer.vue';
import BasicSlotGroup from './BasicSlotGroup.vue';
import ActionCardSlotGroup from './ActionCardSlotGroup.vue';
import EventCardSlotGroup from './EventCardSlotGroup.vue';
import ModelVisualization from './ModelVisualization.vue';

import { HOTKEYS } from '../../ts/builtin-config';
import { useOptionStore } from '../../ts/stores/options';
import { useConfigStore } from '../../ts/stores/config';
import { useAppStore } from '../../ts/stores/app';
import { useModelStore } from '../../ts/stores/model';
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

const modelVisualizations = ref<Array<typeof ModelVisualization>>([]);
onMounted(() => {
  const tick = (deltaMs: DOMHighResTimeStamp) => {
    const { t: lastT } = modelSimulator.record;
    modelSimulator.tick(deltaMs);
    const { t: currentT } = modelSimulator.record;
    const deltaT = currentT - lastT;

    const { record } = modelSimulator;
    modelStore.$patch({ record });
    modelVisualizations.value.forEach((mv) =>
      mv.update(deltaMs, deltaT, modelSimulator.record),
    );
  };
  runner.on('tick', tick);
});
</script>

<template>
  <div class="fill">
    <div id="layer-panel" class="layer-panel fill">
      <template v-for="layerConfig in config.layers">
        <ModelVisualization
          v-if="layerConfig === 'modelVisualization'"
          ref="modelVisualizations"
          class="model-visualization"
        />
        <ConditionalLayer
          v-if="layerConfig !== 'modelVisualization'"
          :layer-config="layerConfig"
        />
      </template>
      <ScoreTable class="score-top-left" />
      <ScoreTable class="score-bottom-right" />
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
.layer-panel {
  background-color: white;
}

.model-visualization {
  width: calc(1px * var(--svg-width));
  transform: scale(var(--svg-scale-factor));
  transform-origin: top left;
}

.slot-panel {
  touch-action: none;
}

.pointer-events-fallthrough {
  pointer-events: none;
}

.score {
  position: absolute;
}

.score-top-left {
  @extend .score;
  top: 0;
  left: 0;
  transform-origin: center;
  transform: rotate(180deg);
}

.score-bottom-right {
  @extend .score;
  bottom: 0;
  right: 0;
}
</style>
