import { strict as assert } from 'assert';
import Chart from 'chart.js/auto';
import Sortable from 'sortablejs';

import loadConfig from './config';
import type { ParameterTransformsConfig } from './config';
import { animationFrame } from './util/animation-frame';
import type {
  StockIds,
  FlowIds,
  VariableIds,
  ParameterIds,
} from './circular-economy-model';
import CircularEconomyModel, {
  Parameters,
  Record,
} from './circular-economy-model';
import ModelSimulator from './model-simulator';
import Visualization from './visualization';
import { documentReady } from './util/document-ready';
import {
  guardedQuerySelector,
  guardedQuerySelectorAll,
} from './util/guarded-query-selectors';
import ScriptedParameterTransform from './parameter-transform/scripted-parameter-transform';

type CircularEconomyModelSimulator = ModelSimulator<
  StockIds,
  FlowIds,
  VariableIds,
  ParameterIds
>;

type ScriptCircularEconomyParameterTransform =
  ScriptedParameterTransform<ParameterIds>;

type CircularEconomyApi = {
  model: CircularEconomyModel;
  modelSimulator: CircularEconomyModelSimulator;
  parameterTransforms: {
    create: (id: string, script: string) => void;
    destroy: (id: string) => void;
  };
};

const initialParameters = {
  abandonExcessRate: 0.5,
  abandonRate: 0.02,
  acquireRate: 1.0,
  breakRate: 0.01,
  capacityAdjustmentRate: 0.05,
  disposeIncentive: 1.5,
  disposeRate: 0.5,
  landfillIncentive: 1.0,
  landfillRate: 1.0,
  naturalResourcesIncentive: 1.5,
  newPhoneProductionRate: 1.0,
  newlyProducedPhoneIncentive: 2,
  numberOfUsers: 1000000,
  phonesPerUserGoal: 1.2,
  recycleRate: 1.0,
  recyclingIncentive: 0.25,
  refurbishmentIncentive: 0.25,
  refurbishmentRate: 1.0,
  repairIncentive: 0.5,
  repairRate: 1.0,
  reuseIncentive: 0.25,
};

async function init(): Promise<CircularEconomyApi> {
  const config = await loadConfig();
  console.log(config);

  const model = new CircularEconomyModel();
  const modelSimulator = new ModelSimulator(
    model,
    // FIXME: It should be possible to pass CircularEconomyModel.initialStocks directly, but TypeScript does not complain.
    { ...CircularEconomyModel.initialStocks },
    { ...initialParameters },
    0.0,
    0.1,
  );

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
    model.parameterIds.forEach((id) => {
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
    Object.assign(modelSimulator.parameters, parameters);
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
    onSort: () => updateParameters(),
    onSpill: (event) => {
      event.item.remove();
      updateParameters();
    },
  });

  const parameterTransforms = {
    create: (id: string, script: string) => {
      const exists = availableParameterTransforms.has(id);
      availableParameterTransforms.set(
        id,
        new ScriptedParameterTransform<ParameterIds>(
          'none',
          model.parameterIds,
          script,
        ),
      );
      const message = `Do you really want to update the definition of the parameter transformation "${id}"? This will also update all active instances of this parameter transformation.`;
      if (exists) {
        if (window.confirm(message)) {
          updateParameters();
        }
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
    '#add-parameter-transform',
    HTMLElement,
  ).addEventListener('click', () => {
    const id = idElement.value;
    const script = scriptElement.value;
    parameterTransforms.create(id, script);
  });

  guardedQuerySelector(
    document,
    '#delete-parameter-transform',
    HTMLElement,
  ).addEventListener('click', () => {
    const id = idElement.value;
    const message = `Do you really want to delete the parameter transformation "${id}"? This will also delete all active instances of this parameter transformation.`;
    if (window.confirm(message)) {
      parameterTransforms.destroy(id);
    }
  });

  config.parameterTransforms.forEach(({ id, script }) =>
    parameterTransforms.create(id, script),
  );

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
  importButton.addEventListener('click', () => {
    const text = importExportElement.value;
    const data = JSON.parse(text) as ParameterTransformsConfig; // TODO: Validate input
    const message =
      'Are you sure you want to import the parameter transformations? This will clear all existing parameter transformations.';
    if (window.confirm(message)) {
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

  model.parameterIds
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

  const visualization = await Visualization.create(model);

  const modelVisualizationContainer = guardedQuerySelector(
    document,
    '#model-viz-container',
    HTMLElement,
  );
  modelVisualizationContainer.append(visualization.element);

  function toChartRecord(record: Record) {
    return CircularEconomyModel.elementIds
      .map((key) =>
        Object.entries(record[key]).map(([id, value]) => ({ id, value })),
      )
      .reduce((cur, acc) => [...cur, ...acc], []);
  }

  const initialChartRecord = toChartRecord(modelSimulator.record);

  const chartCanvas = document.getElementById('chart') as HTMLCanvasElement;
  assert(chartCanvas !== null, 'chart element not found');
  const chart = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: initialChartRecord.map((row) => row.id),
      datasets: [
        {
          label: 'Values',
          data: initialChartRecord.map((row) => row.value),
        },
      ],
    },
    options: { animation: false },
  });

  function updateIndices(record: Record) {
    const smoothingFactor = 0.5;

    const { phonesInUse } = record.stocks;
    const {
      produceFromNaturalResources,
      acquireNewlyProduced,
      acquireUsed,
      acquireRepaired,
      acquireRefurbished,
      disposeHibernating,
      disposeBroken,
      landfill,
    } = record.flows;
    const { phoneGoal } = record.variables;

    const naturalResourcesShare = Math.min(
      1.0,
      produceFromNaturalResources /
        (acquireNewlyProduced +
          acquireUsed +
          acquireRepaired +
          acquireRefurbished),
    );
    const landfillShare = Math.min(
      1.0,
      landfill / (disposeHibernating + disposeBroken),
    );
    const circularityIndexTarget = Math.min(
      1.0 - naturalResourcesShare,
      1.0 - landfillShare,
    );

    circularityIndex +=
      (circularityIndexTarget - circularityIndex) * smoothingFactor;
    circularityIndexElement.innerText = `${(circularityIndex * 100).toFixed(
      1,
    )}%`;

    const userSatisfactionTarget =
      phonesInUse < phoneGoal
        ? phonesInUse / phoneGoal
        : phoneGoal / phonesInUse;
    userSatisfaction +=
      (userSatisfactionTarget - userSatisfaction) * smoothingFactor;
    userSatisfactionElement.innerText = `${(userSatisfaction * 100).toFixed(
      1,
    )}%`;
  }

  function stepSimulation(deltaMs: number) {
    // TODO: pass deltaMs to modelSimulator.step()
    const record = modelSimulator.step();

    updateIndices(record);

    const chartRecord = toChartRecord(record);
    // console.log(chartRecord);
    chart.data.datasets[0].data = chartRecord.map((row) => row.value);

    chart.update();

    visualization.update(deltaMs, modelSimulator.h, record);
  }

  let running = false;
  const runCheckBox = document.getElementById('run') as HTMLInputElement;
  assert(runCheckBox !== null, 'run checkbox not found');

  async function loopSimulation() {
    running = true;
    let lastTimeMs: DOMHighResTimeStamp | null = null;

    while (runCheckBox.checked) {
      // eslint-disable-next-line no-await-in-loop
      const currentTimeMs = await animationFrame();
      const deltaMs = lastTimeMs === null ? 0 : currentTimeMs - lastTimeMs;
      stepSimulation(deltaMs);
      lastTimeMs = currentTimeMs;
    }
    running = false;
  }

  runCheckBox.addEventListener('input', () => {
    if (!running)
      loopSimulation().catch((err) => {
        throw err;
      });
  });

  stepSimulation(0);

  const circularEconomyApi: CircularEconomyApi = {
    model,
    modelSimulator,
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
