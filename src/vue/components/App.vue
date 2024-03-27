<script setup lang="ts">
import { strict as assert } from 'assert';
import { ref, computed } from 'vue';

import ModalConfirmDialog from './ModalConfirmDialog.vue';
import ScoreItem from './ScoreItem.vue';

import { useModelStore } from '../../ts/stores/model';
import { Scores } from '../../ts/scores';

const modelStore = useModelStore();

const circularityScore = computed(() => Scores.circularity(modelStore.record));
const userSatisfactionScore = computed(() =>
  Scores.userSatifaction(modelStore.record),
);

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
    <div id="control-panel" class="hidden">
      <nav>
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
          <button
            class="nav-link"
            id="nav-initial-parameters-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-initial-parameters"
            type="button"
            role="tab"
            aria-controls="nav-initial-parameters"
            aria-selected="true"
          >
            Initial parameters
          </button>
          <button
            class="nav-link active"
            id="nav-parameter-transforms-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-parameter-transforms"
            type="button"
            role="tab"
            aria-controls="nav-parameter-transforms"
            aria-selected="true"
          >
            Parameter transforms
          </button>
          <button
            class="nav-link"
            id="nav-diagrams-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-diagrams"
            type="button"
            role="tab"
            aria-controls="nav-diagrams"
            aria-selected="true"
          >
            Diagrams
          </button>
          <button
            class="nav-link"
            id="nav-import-export-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-import-export"
            type="button"
            role="tab"
            aria-controls="nav-import-export"
            aria-selected="true"
          >
            Import/Export
          </button>
          <button
            class="nav-link"
            id="nav-misc-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-misc"
            type="button"
            role="tab"
            aria-controls="nav-misc"
            aria-selected="true"
          >
            Misc
          </button>
        </div>
      </nav>
      <div class="tab-content" id="nav-tabContent">
        <div
          class="tab-pane show"
          id="nav-initial-parameters"
          role="tabpanel"
          aria-labelledby="nav-initial-parameters-tab"
          tabindex="0"
        >
          <div id="sliders"></div>
        </div>
        <div
          class="tab-pane show active"
          id="nav-parameter-transforms"
          role="tabpanel"
          aria-labelledby="nav-parameter-transforms-tab"
          tabindex="0"
        >
          <div id="parameter-transforms">
            <div>
              Active:
              <div class="active"></div>
              <br />
              <input
                type="button"
                value="Clear all active transforms"
                id="clear-all-active-parameter-transforms-button"
              />
            </div>
            <div>
              Available:
              <div class="available"></div>
            </div>
            <div>
              Id:<br />
              <input type="text" id="parameter-transform-id" /><br />
              Script:<br />
              <textarea
                id="parameter-transform-script"
                rows="5"
                cols="10"
              ></textarea
              ><br />
              <input
                type="button"
                id="add-parameter-transform"
                value="Add/Modify"
              />
              <input
                type="button"
                id="delete-parameter-transform"
                value="Delete"
              />
            </div>
          </div>
        </div>
        <div
          class="tab-pane show"
          id="nav-diagrams"
          role="tabpanel"
          aria-labelledby="nav-diagrams-tab"
          tabindex="0"
        >
          <div style="width: 100%"><canvas id="chart"></canvas></div>
        </div>
        <div
          class="tab-pane show"
          id="nav-import-export"
          role="tabpanel"
          aria-labelledby="nav-import-export-tab"
          tabindex="0"
        >
          <textarea id="import-export" rows="10" cols="80"></textarea>
          <div>
            <input type="button" id="import-button" value="Import" />
            <input type="button" id="export-button" value="Export" />
          </div>
        </div>
        <div
          class="tab-pane show"
          id="nav-misc"
          role="tabpanel"
          aria-labelledby="nav-misc-tab"
          tabindex="0"
        >
          <input
            type="checkbox"
            class="btn-check"
            id="btn-run"
            autocomplete="off"
          />
          <label class="btn btn-primary" for="btn-run">Run</label>
          <input
            type="checkbox"
            class="btn-check"
            id="btn-toggle-fullscreen"
            autocomplete="off"
          />
          <label class="btn btn-primary" for="btn-toggle-fullscreen"
            >Fullscreen</label
          >
        </div>
      </div>
    </div>
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
