import { strict as assert } from 'assert';
import { BoxModelEngine, Record } from '@imaginary-maths/box-model';
import Chart from 'chart.js/auto';
import {
  stepModel,
  createFlowEvaluator,
  initialStocks,
  defaultParameters,
  evaluateModel,
  StockArray as NewStockArray,
  stocksToStockArray,
  accumulateFlowsPerStock,
} from './model-new';

import model from './model';

const modelSource = document.getElementById(
  'model-source',
) as HTMLTextAreaElement;
assert(modelSource !== null, 'model-source element not found');
modelSource.value = JSON.stringify(
  model,
  (key, value) => (typeof value === 'function' ? value.toString() : value),
  '  ',
);

const boxModelEngine = new BoxModelEngine(model);
const mapStockIdToIdx = BoxModelEngine.createIdToIdxMap(model.stocks);
console.log(mapStockIdToIdx);
let stocks = new Array<number>(model.stocks.length).fill(0.0);

let t = 0.0;
const h = 1.0;

const record = boxModelEngine.evaluateGraph(stocks, t);
let { flows } = record;

function toChartRecord(record: Record) {
  return ['stocks', 'flows', 'variables', 'parameters']
    .map((key) =>
      record[key].map((value, index) => ({ id: model[key][index].id, value })),
    )
    .reduce((cur, acc) => [...cur, ...acc], []);
}
const initialChartRecord = toChartRecord(record);
console.log(initialChartRecord);

function toNewChartRecord(record: ReturnType<typeof evaluateModel>) {
  return ['stocks', 'flows', 'variables', 'parameters']
    .map((key) =>
      Object.entries(record[key]).map(([id, value]) => ({ id, value })),
    )
    .reduce((cur, acc) => [...cur, ...acc], []);
}

const chart = new Chart(document.getElementById('chart'), {
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

function stepSimulationOld() {
  const record = boxModelEngine.stepExt(stocks, flows, t, 0.01 * h);
  /*
  const chartRecord = toChartRecord(record);
  // console.log(chartRecord);
  chart.data.datasets[0].data = chartRecord.map((row) => row.value);

  chart.update();
*/
  t = record.t;
  stocks = record.stocks;
  flows = record.flows;
}

let myT = 0.0;
let myStocks = { ...initialStocks };
const myParameters = { ...defaultParameters };
const evaluateFlowPerStock = createFlowEvaluator(myParameters);
let myArrayFlowPerStock = evaluateFlowPerStock(
  stocksToStockArray(myStocks),
  myT,
);

function stepSimulationNew() {
  const evaluateFlowPerStockWithCache = (
    theStocks: NewStockArray,
    theT: number,
  ) =>
    t === myT ? myArrayFlowPerStock : evaluateFlowPerStock(theStocks, theT);
  myStocks = stepModel(myStocks, myT, 0.01 * h, evaluateFlowPerStockWithCache);
  myT += 0.01 * h;
  const theRecord = evaluateModel(myStocks, myParameters, myT);
  myArrayFlowPerStock = stocksToStockArray(
    accumulateFlowsPerStock(theRecord.flows),
  );
  /*
  const chartRecord = toChartRecord(record);
  // console.log(chartRecord);
  chart.data.datasets[0].data = chartRecord.map((row) => row.value);

  chart.update();
*/
}

function benchmarkOld(rounds: number) {
  const start = performance.now();
  for (let i = 0; i < rounds; i += 1) stepSimulationOld();
  const end = performance.now();
  const seconds = (end - start) / 1000;
  return seconds;
}

function benchmarkNew(rounds: number) {
  const start = performance.now();
  for (let i = 0; i < rounds; i += 1) stepSimulationNew();
  const end = performance.now();
  const seconds = (end - start) / 1000;
  return seconds;
}

function benchmark() {
  const rounds = 1000000;
  const secondsOld = benchmarkOld(rounds);
  console.log(`${secondsOld}s for ${rounds} rounds`);
  const secondsNew = benchmarkNew(rounds);
  console.log(`${secondsNew}s for ${rounds} rounds`);
  console.log(`New is ${secondsOld / secondsNew} times faster`);
}

// setTimeout(benchmark, 2000);

function stepSimulation() {
  myStocks = stepModel(myStocks, myT, 0.01 * h, evaluateFlowPerStock);
  const record = evaluateModel(myStocks, myParameters, myT);
  myT = record.t;
  const chartRecord = toNewChartRecord(record);
  // console.log(chartRecord);
  chart.data.datasets[0].data = chartRecord.map((row) => row.value);

  chart.update();
}
function loopSimulation() {
  stepSimulation();
  requestAnimationFrame(loopSimulation);
}

// loopSimulation();
