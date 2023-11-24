import { strict as assert } from 'assert';
import Chart from 'chart.js/auto';
import { animationFrame } from './util/animation-frame';
import CircularEconomyModel, {
  Record,
  StockArray,
} from './circular-economy-model';

const modelSource = document.getElementById(
  'model-source',
) as HTMLTextAreaElement;
assert(modelSource !== null, 'model-source element not found');

// FIXME
modelSource.value =
  'Model source code can not be extracted from the compiled bundle. Sorry';

const model = new CircularEconomyModel();

function toChartRecord(record: Record) {
  return CircularEconomyModel.elementIds
    .map((key) =>
      Object.entries(record[key]).map(([id, value]) => ({ id, value })),
    )
    .reduce((cur, acc) => [...cur, ...acc], []);
}

const parameters = { ...CircularEconomyModel.defaultParameters };
let record = model.evaluate(
  CircularEconomyModel.initialStocks,
  CircularEconomyModel.defaultParameters,
  0,
);
const evaluateFlowPerStock = model.createFlowEvaluator(parameters);
const flowPerStockCache = {
  t: record.t,
  value: model.stocksToStockArray(model.accumulateFlowsPerStock(record.flows)),
};

const initialChartRecord = toChartRecord(record);

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

const h = 0.01;
function stepSimulation() {
  const evaluateFlowPerStockWithCache = (stocks: StockArray, t: number) =>
    t === flowPerStockCache.t
      ? flowPerStockCache.value
      : evaluateFlowPerStock(stocks, t);
  const stocks = model.step(
    record.stocks,
    record.t,
    h,
    evaluateFlowPerStockWithCache,
  );
  record = model.evaluate(stocks, parameters, record.t + h);
  flowPerStockCache.t = record.t;
  flowPerStockCache.value = model.stocksToStockArray(
    model.accumulateFlowsPerStock(record.flows),
  );

  const chartRecord = toChartRecord(record);
  // console.log(chartRecord);
  chart.data.datasets[0].data = chartRecord.map((row) => row.value);

  chart.update();
}

let running = false;
const runCheckBox = document.getElementById('run') as HTMLInputElement;
assert(runCheckBox !== null, 'run checkbox not found');

async function loopSimulation() {
  running = true;
  while (runCheckBox.checked) {
    stepSimulation();
    // eslint-disable-next-line no-await-in-loop
    await animationFrame();
  }
  running = false;
}

runCheckBox.addEventListener('input', () => {
  if (!running)
    loopSimulation().catch((err) => {
      throw err;
    });
});
