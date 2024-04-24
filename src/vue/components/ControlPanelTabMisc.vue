<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';

import { HOTKEYS } from '../../ts/builtin-config';
import { useAppStore } from '../../ts/stores/app';

const togglePlayingBtnId = `btn-toggle-playing-${uuidv4()}`;
const toggleFullscreenBtnId = `btn-toggle-playing-${uuidv4()}`;
const toggleDeveloperModeBtnId = `btn-toggle-playing-${uuidv4()}`;
const toggleHighlightDerivativesBtnId = `btn-toggle-playing-${uuidv4()}`;
const toggleMarkerSlotLabelsBtnId = `btn-toggle-marker-slot-labels-${uuidv4()}`;

const appStore = useAppStore();

const togglePlaying = () => appStore.$patch({ isPlaying: !appStore.isPlaying });

const toggleFullscreen = () =>
  appStore.$patch({ isFullscreen: !appStore.isFullscreen });

const toggleDeveloperMode = () =>
  appStore.$patch({ isDeveloperModeActive: !appStore.isDeveloperModeActive });

const toggleHighlightDerivatives = () =>
  appStore.$patch({
    highlightDerivatives: !appStore.highlightDerivatives,
  });

const toggleMarkerSlotLabels = () =>
  appStore.$patch({
    showMarkerSlotLabels: !appStore.showMarkerSlotLabels,
  });
</script>

<template>
  <input
    type="checkbox"
    class="btn-check"
    :id="togglePlayingBtnId"
    :class="() => (appStore.isFullscreen ? 'active' : '')"
    autocomplete="off"
    @click="togglePlaying"
  />
  <label class="btn btn-primary" :for="togglePlayingBtnId"
    >Run ({{ HOTKEYS.run.label }})</label
  >
  <input
    type="checkbox"
    class="btn-check"
    :id="toggleFullscreenBtnId"
    :class="() => (appStore.isFullscreen ? 'active' : '')"
    autocomplete="off"
  />
  <label
    class="btn btn-primary"
    :for="toggleFullscreenBtnId"
    @click="toggleFullscreen"
    >Fullscreen ({{ HOTKEYS.fullscreen.label }})</label
  >
  <input
    type="checkbox"
    class="btn-check"
    :id="toggleDeveloperModeBtnId"
    :class="() => (appStore.isDeveloperModeActive ? 'active' : '')"
    autocomplete="off"
  />
  <label
    class="btn btn-primary"
    :for="toggleDeveloperModeBtnId"
    @click="toggleDeveloperMode"
    >Developer mode ({{ HOTKEYS.developerMode.label }})</label
  >
  <input
    type="checkbox"
    class="btn-check"
    :id="toggleHighlightDerivativesBtnId"
    :class="() => (appStore.highlightDerivatives ? 'active' : '')"
    autocomplete="off"
  />
  <label
    class="btn btn-primary"
    :for="toggleHighlightDerivativesBtnId"
    @click="toggleHighlightDerivatives"
    >Highlight derivatives ({{ HOTKEYS.highlightDerivatives.label }})</label
  >
  <input
    type="checkbox"
    class="btn-check"
    :id="toggleMarkerSlotLabelsBtnId"
    :class="() => (appStore.showMarkerSlotLabels ? 'active' : '')"
    autocomplete="off"
  />
  <label
    class="btn btn-primary"
    :for="toggleMarkerSlotLabelsBtnId"
    @click="toggleMarkerSlotLabels"
    >Show marker slot labels</label
  >
</template>
