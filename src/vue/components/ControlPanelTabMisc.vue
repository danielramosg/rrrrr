<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';

import { useAppStore } from '../../ts/stores/app';

const togglePlayingBtnId = `btn-toggle-playing-${uuidv4()}`;
const toggleFullscreenBtnId = `btn-toggle-playing-${uuidv4()}`;

const appStore = useAppStore();

const togglePlaying = () => appStore.$patch({ isPlaying: !appStore.isPlaying });

const toggleFullscreen = () =>
  appStore.$patch({ isFullscreen: !appStore.isFullscreen });
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
  <label class="btn btn-primary" :for="togglePlayingBtnId">Run</label>
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
    >Fullscreen</label
  >
</template>
