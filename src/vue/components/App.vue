<script setup lang="ts">
import { strict as assert } from 'assert';
import { ref, computed, watch } from 'vue';
import { onKeyStroke } from '@vueuse/core';

import ModalConfirmDialog from './ModalConfirmDialog.vue';
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

const isControlPanelVisible = ref(false);

onKeyStroke(
  'c',
  () => {
    isControlPanelVisible.value = !isControlPanelVisible.value;
  },
  { target: document },
);

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

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const modalConfirmDialog = ref<InstanceType<typeof ModalConfirmDialog> | null>(
  null,
);

const openConfirmDialog = async (
  message: string,
  title?: string,
): Promise<boolean> => {
  assert(modalConfirmDialog.value !== null);
  return await modalConfirmDialog.value.open(message, title);
};

defineExpose<{ openConfirmDialog: typeof openConfirmDialog }>({
  openConfirmDialog,
});
</script>

<template>
  <div id="top-level-container" class="top-level-container">
    <div id="illustration-panel"></div>
    <div id="viz-panel">
      <div id="model-viz-container"></div>
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
    <div id="slot-panel" class="slot-panel"></div>
    <ControlPanel
      :style="{ display: isControlPanelVisible ? 'block' : 'none' }"
    />
  </div>
  <ModalConfirmDialog
    ref="modalConfirmDialog"
    title="my title"
    message="my message"
  >
  </ModalConfirmDialog>
</template>

<style lang="scss" scoped>
top-level-container > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
