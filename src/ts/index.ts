import { strict as assert } from 'assert';
import Chart from 'chart.js/auto';
import { animationFrame } from './util/animation-frame';
import type {
  StockIds,
  FlowIds,
  VariableIds,
  ParameterIds,
} from './circular-economy-model';
import CircularEconomyModel, { Record } from './circular-economy-model';
import ModelSimulator from './model-simulator';
import Visualization from './visualization';
import { documentReady } from './util/document-ready';

type CircularEconomyModelSimulator = ModelSimulator<
  StockIds,
  FlowIds,
  VariableIds,
  ParameterIds
>;

declare global {
  interface Window {
    modelSimulator: Promise<CircularEconomyModelSimulator>;
  }
}

let modelSimulatorResolver: (value: CircularEconomyModelSimulator) => void;
window.modelSimulator = new Promise<CircularEconomyModelSimulator>(
  (resolve) => {
    modelSimulatorResolver = resolve;
  },
);

async function init() {
  const model = new CircularEconomyModel();
  const modelSimulator = new ModelSimulator(
    model,
    CircularEconomyModel.initialStocks,
    CircularEconomyModel.defaultParameters,
    0.0,
    0.01,
  );

  modelSimulatorResolver(modelSimulator);

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

  function stepSimulation(deltaMs: number) {
    const record = modelSimulator.step();
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
}

documentReady()
  .then(init)
  .catch((err) => console.error('Initialization failed', err));
