import hotkeys from 'hotkeys-js';
import { strict as assert } from 'assert';
import { createApp } from 'vue';

import './side-effects';

import App from '../vue/App.vue';

import { ConfigLoader } from './config/config-loader';
import { type Parameters, type Record } from './circular-economy-model';
import { documentReady } from './util/document-ready';
import { ScaleToFitParent } from './util/scale-to-fit';
import { guardedQuerySelector } from './util/guarded-query-selectors';
import { Game } from './game';
import { Scores } from './scores';
import { ControlPanel } from './control-panel';
import { setupMarkerPanel } from './marker';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  SLOT_DEFINITIONS,
  CONFIG_URLS,
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
  game: Game;
  controlPanel: ControlPanel;
};

function toggleControlPanel() {
  const controlPanel = guardedQuerySelector(HTMLElement, '#control-panel');
  controlPanel.classList.toggle('hidden');
}

function configureHotkeys(game: Game) {
  hotkeys('c', () => {
    toggleControlPanel();
    return false;
  });
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

  const modelVisualizationContainer = guardedQuerySelector(
    HTMLDivElement,
    '#model-viz-container',
  );

  let circularityIndex = 0;
  const circularityIndexElement = guardedQuerySelector(
    HTMLElement,
    '#circularity-index',
  );

  let userSatisfaction = 0;
  const userSatisfactionElement = guardedQuerySelector(
    HTMLElement,
    '#user-satisfaction',
  );

  function updateIndices(record: Record) {
    const smoothingFactor = 0.5;

    const {
      circularity: circularityTarget,
      userSatisfaction: userSatisfactionTarget,
    } = Scores.all(record);

    circularityIndex +=
      (circularityTarget - circularityIndex) * smoothingFactor;
    circularityIndexElement.innerText = `${(circularityIndex * 100).toFixed(
      1,
    )}%`;

    userSatisfaction +=
      (userSatisfactionTarget - userSatisfaction) * smoothingFactor;
    userSatisfactionElement.innerText = `${(userSatisfaction * 100).toFixed(
      1,
    )}%`;
  }

  const controlPanel = new ControlPanel(config);
  const game = await Game.create(modelVisualizationContainer, config);

  game.runner.on('tick', () => {
    const { record } = game.modelSimulator;
    updateIndices(record);
    controlPanel.update(record);
  });

  controlPanel.events.on('play', game.runner.play.bind(game.runner));
  controlPanel.events.on('pause', game.runner.pause.bind(game.runner));
  controlPanel.events.on('update-parameters', (parameters: Parameters) =>
    Object.assign(game.modelSimulator.parameters, parameters),
  );

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
    game,
    controlPanel,
  };

  const app = createApp(App);
  // app.mount(document.body);

  return circularEconomyApi;
}

declare global {
  interface Window {
    circularEconomy: Promise<CircularEconomyApi>;
  }
}

window.circularEconomy = documentReady().then(init);
