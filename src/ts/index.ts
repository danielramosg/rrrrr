import { strict as assert } from 'assert';
import Chart from 'chart.js/auto';
import Sortable from 'sortablejs';

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
import { guardedQuerySelector } from './util/guarded-query-selectors';
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

async function init(): Promise<CircularEconomyApi> {
  const model = new CircularEconomyModel();
  const modelSimulator = new ModelSimulator(
    model,
    // FIXME: It should be possible to pass CircularEconomyModel.initialStocks directly, but TypeScript does not complain.
    { ...CircularEconomyModel.initialStocks },
    // FIXME: It should be possible to pass CircularEconomyModel.defaultParameters directly, but TypeScript does not complain.
    { ...CircularEconomyModel.defaultParameters },
    0.0,
    0.01,
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
    const parameters = { ...CircularEconomyModel.defaultParameters };
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

  Sortable.create(availableParameterTransformsContainer, {
    group: {
      name: 'sharedParameterTransforms',
      pull: 'clone',
      put: false, // Do not allow items to be put into this list
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
      if (availableParameterTransforms.has(id))
        throw new Error(`Parameter transform with id '${id}' already exists`);
      availableParameterTransforms.set(
        id,
        new ScriptedParameterTransform<ParameterIds>(
          'none',
          model.parameterIds,
          script,
        ),
      );
      const dummyElement = document.createElement('div');
      dummyElement.innerHTML = `<div class="parameter-transform" data-id="${id}">${id}</div>`;
      const parameterTransformElement = dummyElement.firstChild;
      assert(parameterTransformElement !== null);
      availableParameterTransformsContainer.append(parameterTransformElement);
    },
    destroy: (id: string) => {
      availableParameterTransforms.delete(id);
    },
  };

  guardedQuerySelector(
    document,
    '#add-parameter-transform',
    HTMLElement,
  ).addEventListener('click', () => {
    const idElement = guardedQuerySelector(
      document,
      '#parameter-transform-id',
      HTMLInputElement,
    );
    const id = idElement.value;
    const scriptElement = guardedQuerySelector(
      document,
      '#parameter-transform-script',
      HTMLTextAreaElement,
    );
    const script = scriptElement.value;
    parameterTransforms.create(id, script);
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
  document.body.prepend(visualization.element);

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
      2,
    )}%`;

    const userSatisfactionTarget =
      phonesInUse < phoneGoal
        ? phonesInUse / phoneGoal
        : phoneGoal / phonesInUse;
    userSatisfaction +=
      (userSatisfactionTarget - userSatisfaction) * smoothingFactor;
    userSatisfactionElement.innerText = `${(userSatisfaction * 100).toFixed(
      2,
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

    visualization.update(deltaMs, record);
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
