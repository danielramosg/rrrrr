<script setup lang="ts">
import { ref } from 'vue';

import ControlPanelTabInitialParameters from './ControlPanelTabInitialParameters.vue';
import ControlPanelTabParameterTransforms from './ControlPanelTabParameterTransforms.vue';
import ControlPanelTabCharts from './ControlPanelTabCharts.vue';
import ControlPanelTabImportExport from './ControlPanelTabImportExport.vue';
import ControlPanelTabMisc from './ControlPanelTabMisc.vue';

const props = defineProps({ disabled: Boolean });

const diagramsTabDisabled = ref(true);
</script>

<template>
  <div class="control-panel" :class="{ hidden: props.disabled }">
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
          aria-selected="false"
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
          aria-selected="false"
          v-on="{
            'hidden.bs.tab': () => (diagramsTabDisabled = true),
            'show.bs.tab': () => (diagramsTabDisabled = false),
          }"
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
          aria-selected="false"
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
        <ControlPanelTabInitialParameters />
      </div>
      <div
        class="tab-pane show active"
        id="nav-parameter-transforms"
        role="tabpanel"
        aria-labelledby="nav-parameter-transforms-tab"
        tabindex="0"
      >
        <ControlPanelTabParameterTransforms />
      </div>
      <div
        class="tab-pane show"
        id="nav-diagrams"
        role="tabpanel"
        aria-labelledby="nav-diagrams-tab"
        tabindex="0"
      >
        <ControlPanelTabCharts
          :disabled="props.disabled || diagramsTabDisabled"
        />
      </div>
      <div
        class="tab-pane show"
        id="nav-import-export"
        role="tabpanel"
        aria-labelledby="nav-import-export-tab"
        tabindex="0"
      >
        <ControlPanelTabImportExport />
      </div>
      <div
        class="tab-pane show"
        id="nav-misc"
        role="tabpanel"
        aria-labelledby="nav-misc-tab"
        tabindex="0"
      >
        <ControlPanelTabMisc />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-panel {
  // this node is designed for 1920x1080 and than scaled up 2x
  position: absolute;
  top: 0;
  right: 0;
  width: calc(1px * var(--app-width) / 4);
  height: 50%;
  box-sizing: border-box;
  border-left: solid 1px;
  background-color: white;
  transform-origin: top right;
  transform: scale(2);

  & nav {
    padding-top: 1ex;

    & button[disabled] {
      text-decoration: line-through;
    }
  }

  & .tab-pane {
    padding: 1em;
  }
}
</style>
