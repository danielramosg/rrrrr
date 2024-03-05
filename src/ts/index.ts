import './side-effects';

import { strict as assert } from 'assert';
import Sortable from 'sortablejs';

import { Modal } from 'bootstrap';
import loadConfig from './config';
import type { ParameterTransformsConfig } from './config';
import type { ParameterIds } from './circular-economy-model';
import { Parameters, Record } from './circular-economy-model';
import { documentReady } from './util/document-ready';
import {
  guardedQuerySelector,
  guardedQuerySelectorAll,
} from './util/guarded-query-selectors';
import ScriptedParameterTransform from './parameter-transform/scripted-parameter-transform';
import { Game } from './game';
import { Chart } from './chart';
import { Scores } from './scores';

type ScriptCircularEconomyParameterTransform =
  ScriptedParameterTransform<ParameterIds>;

type CircularEconomyApi = {
  game: Game;
  parameterTransforms: {
    create: (id: string, script: string) => void;
    destroy: (id: string) => void;
  };
};

async function init(): Promise<CircularEconomyApi> {
  const config = await loadConfig();
  console.log(config);

  const modelVisualizationContainer = guardedQuerySelector(
    document,
    '#model-viz-container',
    HTMLDivElement,
  );

  const game = await Game.create(modelVisualizationContainer, config);
  const initialParameters = { ...config.model.initialParameters };

  const confirm = (() => {
    const modalDialogElement = guardedQuerySelector(
      document,
      '#modal',
      HTMLElement,
    );
    const modalDialogTitleElement = guardedQuerySelector(
      modalDialogElement,
      '.modal-title',
      HTMLElement,
    );
    const modalDialogBodyElement = guardedQuerySelector(
      modalDialogElement,
      '.modal-body',
      HTMLElement,
    );
    const modelDialogCloseButton = guardedQuerySelector(
      modalDialogElement,
      '.modal-header button.btn-close',
      HTMLButtonElement,
    );
    const modelDialogOkButton = guardedQuerySelector(
      modalDialogElement,
      '.modal-footer button.btn-primary',
      HTMLButtonElement,
    );
    const modelDialogCancelButton = guardedQuerySelector(
      modalDialogElement,
      '.modal-footer button.btn-secondary',
      HTMLButtonElement,
    );
    const modalDialog = new Modal(modalDialogElement, { backdrop: 'static' });
    let wasModalDialogDismissed = false;
    let lastResolver: (result: boolean) => void = () => {};
    modelDialogCloseButton.addEventListener('click', () => {
      wasModalDialogDismissed = true;
    });
    modelDialogOkButton.addEventListener('click', () => {
      wasModalDialogDismissed = false;
    });
    modelDialogCancelButton.addEventListener('click', () => {
      wasModalDialogDismissed = true;
    });
    modalDialogElement.addEventListener('hidden.bs.modal', () => {
      lastResolver(!wasModalDialogDismissed);
    });

    const titleText = 'Confirmation required';
    return async function confirmDialog(
      text: string,
      title: string = titleText,
    ): Promise<boolean> {
      modalDialogTitleElement.textContent = title;
      modalDialogBodyElement.textContent = text;
      modalDialog.show();
      return new Promise<boolean>((resolve) => {
        lastResolver = resolve;
      });
    };
  })();

  const availableParameterTransformsContainer = guardedQuerySelector(
    document,
    '#parameter-transforms .available',
    HTMLElement,
  );
  const activeParameterTransformsContainer = guardedQuerySelector(
    document,
    '#parameter-transforms .active',
    HTMLElement,
  );

  const availableParameterTransforms = new Map<
    string,
    ScriptCircularEconomyParameterTransform
  >();

  function getDistinctParameters(
    p1: Parameters,
    p2: Parameters,
  ): Partial<Parameters> {
    const result: Partial<Parameters> = {};
    game.modelSimulator.model.parameterIds.forEach((id) => {
      if (p1[id] !== p2[id]) {
        result[id] = p2[id];
      }
    });
    return result;
  }

  function updateParameters() {
    const parameters = { ...initialParameters };
    [...activeParameterTransformsContainer.children].forEach((e) => {
      assert(e instanceof HTMLElement);
      const id = e.getAttribute('data-id');
      assert(id !== null);
      const parameterTransform = availableParameterTransforms.get(id);
      assert(parameterTransform !== undefined);
      const backupParameters = { ...parameters };
      parameterTransform.applyTo(parameters);
      const distinctParameters = getDistinctParameters(
        backupParameters,
        parameters,
      );
      e.title = `${parameterTransform.script}\n\n${JSON.stringify(
        distinctParameters,
        null,
        2,
      )}\n\n${JSON.stringify(parameters, null, 2)}`;
    });
    Object.assign(game.modelSimulator.parameters, parameters);
  }

  const idElement = guardedQuerySelector(
    document,
    '#parameter-transform-id',
    HTMLInputElement,
  );
  const scriptElement = guardedQuerySelector(
    document,
    '#parameter-transform-script',
    HTMLTextAreaElement,
  );

  Sortable.create(availableParameterTransformsContainer, {
    group: {
      name: 'sharedParameterTransforms',
      pull: 'clone',
      put: false, // Do not allow items to be put into this list
    },
    onClone: (evt) => {
      const cloneElement = evt.clone;
      const { id } = cloneElement.dataset;
      assert(id !== undefined);
      cloneElement.addEventListener('click', () => {
        const parameterTransform = availableParameterTransforms.get(id);
        assert(parameterTransform !== undefined);
        idElement.value = id;
        scriptElement.value = parameterTransform.script;
      });
    },
  });
  Sortable.create(activeParameterTransformsContainer, {
    group: { name: 'sharedParameterTransforms' },
    removeOnSpill: true,
    onEnd: updateParameters,
    onAdd: updateParameters,
  });

  const parameterTransforms = {
    create: (id: string, script: string) => {
      const exists = availableParameterTransforms.has(id);
      availableParameterTransforms.set(
        id,
        new ScriptedParameterTransform<ParameterIds>(
          'none',
          game.modelSimulator.model.parameterIds,
          script,
        ),
      );
      if (exists) {
        updateParameters();
      } else {
        const parameterTransformElement = document.createElement('div');
        parameterTransformElement.classList.add('parameter-transform');
        parameterTransformElement.setAttribute('data-id', id);
        parameterTransformElement.innerText = id;
        parameterTransformElement.addEventListener('click', () => {
          const parameterTransform = availableParameterTransforms.get(id);
          assert(parameterTransform !== undefined);
          idElement.value = id;
          scriptElement.value = parameterTransform.script;
        });
        availableParameterTransformsContainer.append(parameterTransformElement);
      }
    },
    destroy: (id: string) => {
      availableParameterTransforms.delete(id);
      guardedQuerySelector(
        availableParameterTransformsContainer,
        `[data-id="${id}"]`,
        HTMLElement,
      ).remove();
      guardedQuerySelectorAll(
        activeParameterTransformsContainer,
        `[data-id="${id}"]`,
        HTMLElement,
      ).forEach((element) => element.remove());
      updateParameters();
    },
    clear: () => {
      availableParameterTransforms.clear();
      availableParameterTransformsContainer.innerHTML = '';
      activeParameterTransformsContainer.innerHTML = '';
      updateParameters();
    },
  };

  guardedQuerySelector(
    document,
    '#clear-all-active-parameter-transforms-button',
    HTMLElement,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  ).addEventListener('click', async () => {
    const message =
      'Do you really want to clear all active parameter transformations?';
    if (await confirm(message)) {
      activeParameterTransformsContainer.innerHTML = '';
      updateParameters();
    }
  });

  guardedQuerySelector(
    document,
    '#add-parameter-transform',
    HTMLElement,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  ).addEventListener('click', async () => {
    const id = idElement.value;
    const script = scriptElement.value;
    const exists = availableParameterTransforms.has(id);
    let confirmed = true;
    if (exists) {
      const message = `Do you really want to update the definition of the parameter transformation "${id}"? This will also update all active instances of this parameter transformation.`;
      confirmed = await confirm(message);
    }
    if (confirmed) parameterTransforms.create(id, script);
  });

  guardedQuerySelector(
    document,
    '#delete-parameter-transform',
    HTMLElement,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  ).addEventListener('click', async () => {
    const id = idElement.value;
    const message = `Do you really want to delete the parameter transformation "${id}"? This will also delete all active instances of this parameter transformation.`;
    if (await confirm(message)) {
      parameterTransforms.destroy(id);
    }
  });

  config.parameterTransformsGroups
    .flatMap(({ transforms }) => transforms)
    .forEach(({ id, script }) => parameterTransforms.create(id, script));

  const importExportElement = guardedQuerySelector(
    document,
    '#import-export',
    HTMLTextAreaElement,
  );
  const exportButton = guardedQuerySelector(
    document,
    '#export-button',
    HTMLInputElement,
  );

  const importButton = guardedQuerySelector(
    document,
    '#import-button',
    HTMLInputElement,
  );
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  importButton.addEventListener('click', async () => {
    const text = importExportElement.value;
    const data = JSON.parse(text) as ParameterTransformsConfig; // TODO: Validate input
    const message =
      'Are you sure you want to import the parameter transformations? This will clear all existing parameter transformations.';
    if (await confirm(message)) {
      parameterTransforms.clear();
      data.forEach(({ id, script }) => parameterTransforms.create(id, script));
    }
  });

  exportButton.addEventListener('click', () => {
    const data = [...availableParameterTransforms.entries()].map(
      ([id, parameterTransform]) => ({ id, script: parameterTransform.script }),
    );
    importExportElement.value = JSON.stringify(data, null, 2);
  });

  const sliderContainer = guardedQuerySelector(
    document,
    '#sliders',
    HTMLElement,
  );

  game.modelSimulator.model.parameterIds
    .filter((id) => id !== 'numberOfUsers')
    .forEach((id) => {
      const sliderElementLabel = document.createElement('div');
      const sliderElement = document.createElement('input');
      sliderElement.type = 'range';
      sliderElement.min = '0';
      sliderElement.max = '4';
      sliderElement.step = '0.001';
      sliderElement.value = `${initialParameters[id]}`;

      function updateSliderValue() {
        initialParameters[id] = Number.parseFloat(sliderElement.value);
        sliderElementLabel.innerText = `${id} = ${initialParameters[id]}`;
        updateParameters();
      }
      updateSliderValue();

      sliderElement.addEventListener('input', updateSliderValue);

      const sliderWrapperElement = document.createElement('div');
      sliderWrapperElement.append(sliderElementLabel, sliderElement);

      sliderContainer.append(sliderWrapperElement);
    });

  let circularityIndex = 0;
  const circularityIndexElement = guardedQuerySelector(
    document,
    '#circularity-index',
    HTMLElement,
  );

  let userSatisfaction = 0;
  const userSatisfactionElement = guardedQuerySelector(
    document,
    '#user-satisfaction',
    HTMLElement,
  );

  const chartCanvas = guardedQuerySelector(
    document,
    '#chart',
    HTMLCanvasElement,
  );
  const chart = new Chart(chartCanvas, game.modelSimulator.record);

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

  game.runner.on('tick', () => {
    const { record } = game.modelSimulator;
    updateIndices(record);
    chart.update(record);
  });

  // TODO: Sync button state and fullscreen state
  const fullscreenToggleCheckboxBox = guardedQuerySelector(
    document,
    '#btn-toggle-fullscreen',
    HTMLInputElement,
  );
  if (!document.fullscreenEnabled) fullscreenToggleCheckboxBox.disabled = true;
  fullscreenToggleCheckboxBox.addEventListener('input', () => {
    if (fullscreenToggleCheckboxBox.checked) {
      void document.documentElement.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  });

  const runCheckBox = guardedQuerySelector(
    document,
    '#btn-run',
    HTMLInputElement,
  );

  runCheckBox.addEventListener('input', () => {
    const shouldPlay = runCheckBox.checked;
    if (shouldPlay) {
      game.runner.play();
    } else {
      game.runner.pause();
    }
  });

  game.runner.tick();

  const circularEconomyApi: CircularEconomyApi = {
    game,
    parameterTransforms,
  };

  return circularEconomyApi;
}

declare global {
  interface Window {
    circularEconomy: Promise<CircularEconomyApi>;
  }
}

window.circularEconomy = documentReady().then(init);
