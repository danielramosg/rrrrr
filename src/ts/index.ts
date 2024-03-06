import './side-effects';

import { loadConfig } from './config';
import { Parameters, Record } from './circular-economy-model';
import { documentReady } from './util/document-ready';
import { guardedQuerySelector } from './util/guarded-query-selectors';
import { Game } from './game';
import { Scores } from './scores';
import { ControlPanel } from './control-panel';

type CircularEconomyApi = {
  game: Game;
  controlPanel: ControlPanel;
};

async function init(): Promise<CircularEconomyApi> {
  const config = await loadConfig();
  console.log(config);

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

  const circularEconomyApi: CircularEconomyApi = {
    game,
    controlPanel,
  };

  return circularEconomyApi;
}

declare global {
  interface Window {
    circularEconomy: Promise<CircularEconomyApi>;
  }
}

window.circularEconomy = documentReady().then(init);
