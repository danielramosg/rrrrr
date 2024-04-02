import hotkeys from 'hotkeys-js';
import { strict as assert } from 'assert';
import { createApp, watchEffect } from 'vue';
import { createPinia } from 'pinia';

import './side-effects';

import { useAppStore } from './stores/app';
import { useModelStore } from './stores/model';
import App from '../vue/components/App.vue';

import { ConfigLoader } from './config/config-loader';
import { type Parameters } from './circular-economy-model';
import { documentReady } from './util/document-ready';
import { ScaleToFitParent } from './util/scale-to-fit';
import { guardedQuerySelector } from './util/guarded-query-selectors';
import { Game } from './game';
import { ControlPanel } from './control-panel';
import { setupMarkerPanel } from './marker';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  SLOT_DEFINITIONS,
  CONFIG_URLS,
  CONFIG_INJECTION_KEY,
} from './builtin-config';

// eslint-disable-next-line no-lone-blocks
{
  // This is for setting global Vue.js option that should actually be set by the bundler, but aren't.
  /* eslint-disable */
  // @ts-ignore
  globalThis.__VUE_OPTIONS_API__ = true;
  // @ts-ignore
  globalThis.__VUE_PROD_DEVTOOLS__ = true;
  // @ts-ignore
  globalThis.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = true;
}

type CircularEconomyApi = {
  app: InstanceType<typeof App>;
  game: Game;
};

function configureHotkeys(game: Game) {
  hotkeys('space', () => {
    game.runner.togglePlayPause();
    return false;
  });
}

async function init(): Promise<CircularEconomyApi> {
  const configLoaderResult = await ConfigLoader.safeLoad(...CONFIG_URLS);
  if (!configLoaderResult.ok) {
    const {
      config,
      error: { errors, explanation },
    } = configLoaderResult.error;
    console.error('Invalid configuration:', config);
    console.error(explanation);
    console.error(
      'Issues reported by the configuration validator:',
      ...(errors ?? []),
    );
    throw new Error('Error loading configuration. See console for details.');
  }
  const config = configLoaderResult.data;
  console.log(config);

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--app-width', `${BOARD_WIDTH}`);
  rootStyle.setProperty('--app-height', `${BOARD_HEIGHT}`);

  const fixedSizeContainer = guardedQuerySelector(
    HTMLDivElement,
    '#fixed-size-container',
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const scaleToFitParent = new ScaleToFitParent(fixedSizeContainer, {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
  });

  const pinia = createPinia();

  const app = createApp(App);
  app.provide(CONFIG_INJECTION_KEY, config);
  app.use(pinia);
  const appComponent = app.mount(fixedSizeContainer) as InstanceType<
    typeof App
  >;

  const appStore = useAppStore();
  const modelStore = useModelStore();

  const modelVisualizationContainer = guardedQuerySelector(
    HTMLDivElement,
    '#model-viz-container',
  );

  const game = await Game.create(modelVisualizationContainer, config);

  game.runner.on('tick', () => {
    const { record } = game.modelSimulator;
    modelStore.$patch({ record });
  });

  watchEffect(() => {
    if (appStore.isPlaying) game.runner.play();
    else game.runner.pause();
  });

  game.runner.tick();

  const backgroundElement = document.createElement('img');
  backgroundElement.src = config.general.backgroundImage;

  const illustrationPanelElement = guardedQuerySelector(
    HTMLElement,
    '#illustration-panel',
  );
  illustrationPanelElement.appendChild(backgroundElement);

  const slotTracker = setupMarkerPanel();
  slotTracker.slotActivate$.subscribe(({ slotId }) => {
    const slot = SLOT_DEFINITIONS.find((sd) => sd.id === slotId);
    assert(typeof slot !== 'undefined');
    controlPanel.activateParameterTransform(slot.transformId);
  });
  slotTracker.slotDeactivate$.subscribe(({ slotId }) => {
    const slot = SLOT_DEFINITIONS.find((sd) => sd.id === slotId);
    assert(typeof slot !== 'undefined');
    controlPanel.deactivateParameterTransform(slot.transformId);
  });

  configureHotkeys(game);

  const circularEconomyApi: CircularEconomyApi = {
    app: appComponent,
    game,
  };

  return circularEconomyApi;
}

declare global {
  interface Window {
    circularEconomy: Promise<CircularEconomyApi>;
  }
}

window.circularEconomy = documentReady().then(init);
