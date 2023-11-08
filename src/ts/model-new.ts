// TODO: Build generic model type that takes modelIds as generic parameter
// TODO: Separate the definition of the concrete model from the generic model
// TODO: Maybe even create a class for it (?? maybe not, because .. state management again)

import { FlowEvaluator, step } from './box-model/box-model';
import { IntegrationEngineOutputArray } from './box-model/types';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
type Ids<T extends ReadonlyArray<string>> = T;
type TupleToUnion<T extends ReadonlyArray<string>> = Writeable<T>[number];
type TupleToObject<T extends ReadonlyArray<string>> = {
  [P in TupleToUnion<T>]: number;
};
type TupleToNumberArray<T extends ReadonlyArray<string>> = {
  -readonly [P in keyof T]: number;
};
type ConvertObjectToArrayFunction<T extends ReadonlyArray<string>> = (
  object: TupleToObject<T>,
) => TupleToNumberArray<T>;
type ConvertArrayToObjectFunction<T extends ReadonlyArray<string>> = (
  array: TupleToNumberArray<T>,
) => TupleToObject<T>;
type COTAF<T extends ReadonlyArray<string>> = ConvertObjectToArrayFunction<T>;
type CATOF<T extends ReadonlyArray<string>> = ConvertArrayToObjectFunction<T>;

const stockIds = [
  'manufacturer',
  'firstHand',
  'secondHand',
  'hibernating',
  'broken',
  'landfill',
] as const;

const parameterIds = [
  'firstHandPreference',
  'globalDemand',
  'abandonRate',
  'breakRate',
  'repairRate',
  'reuseRate',
  'refurbishRate',
  'recycleRate',
] as const;

const flowIds = [
  'abandonFirstHand',
  'abandonSecondHand',
  'breakFirstHand',
  'breakSecondHand',
  'disposeBroken',
  'disposeHibernating',
  'naturalResources',
  'recycle',
  'refurbish',
  'repair',
  'reuse',
  'selling',
] as const;

const variableIds = [
  'firstHandDemand',
  'secondHandDemand',
  'numberOfItems',
] as const;

type StockIds = Ids<typeof stockIds>;
type StockId = TupleToUnion<StockIds>;
type Stocks = TupleToObject<StockIds>;
type StockArray = TupleToNumberArray<StockIds>;

type ParameterIds = Ids<typeof parameterIds>;
type ParameterId = TupleToUnion<ParameterIds>;
type Parameters = TupleToObject<ParameterIds>;

type VariableIds = Ids<typeof variableIds>;
type VariableId = TupleToUnion<VariableIds>;
type Variables = TupleToObject<VariableIds>;

type FlowIds = Ids<typeof flowIds>;
type FlowId = TupleToUnion<FlowIds>;
type Flows = TupleToObject<FlowIds>;

type ModelIds = Readonly<{
  stocks: StockIds;
  parameters: ParameterIds;
  flows: FlowIds;
  variables: VariableIds;
}>;

const modelIds: ModelIds = {
  stocks: stockIds,
  parameters: parameterIds,
  flows: flowIds,
  variables: variableIds,
} as const;

type Record = {
  t: number;
  stocks: Stocks;
  parameters: Parameters;
  variables: Variables;
  flows: Flows;
};

function createCOTAF<T extends ReadonlyArray<string>>(
  ids: T,
): (object: TupleToObject<T>) => TupleToNumberArray<T> {
  return (object) =>
    ids.map(
      (id: keyof TupleToObject<T>) => object[id],
    ) as TupleToNumberArray<T>;
}

function createCATOF<T extends ReadonlyArray<string>>(
  ids: T,
): (array: TupleToNumberArray<T>) => TupleToObject<T> {
  return (array) =>
    Object.fromEntries(
      ids.map((id, index) => [id, array[index]]),
    ) as TupleToObject<T>;
}

const stocksToStockArray: COTAF<StockIds> = createCOTAF(stockIds);
const stockArrayToStocks: CATOF<StockIds> = createCATOF(stockIds);

function evaluateModel(
  stocks: Stocks,
  parameters: Parameters,
  t: number,
): Record {
  const { firstHand, secondHand, hibernating, broken } = stocks;
  const {
    firstHandPreference,
    globalDemand,
    abandonRate,
    breakRate,
    repairRate,
    reuseRate,
    refurbishRate,
    recycleRate,
  } = parameters;

  const abandonFirstHand = abandonRate * firstHand;
  const abandonSecondHand = abandonRate * secondHand;
  const breakFirstHand = breakRate * firstHand;
  const breakSecondHand = breakRate * secondHand;
  const disposeBroken = 0.4 * broken;
  const disposeHibernating = 0.4 * hibernating;
  const naturalResources = 0.0;
  const recycle = recycleRate * broken;
  const refurbish = refurbishRate * hibernating;
  const firstHandDemand = globalDemand * firstHandPreference;
  const secondHandDemand = globalDemand - firstHandDemand;
  const numberOfItems = firstHand + secondHand;
  const repair = Math.min(secondHandDemand - secondHand, broken) * repairRate;
  const reuse =
    Math.min(secondHandDemand - secondHand, hibernating) * reuseRate;
  const selling = firstHandDemand - firstHand;

  const variables = { firstHandDemand, secondHandDemand, numberOfItems };
  const flows = {
    abandonFirstHand,
    abandonSecondHand,
    breakFirstHand,
    breakSecondHand,
    disposeBroken,
    disposeHibernating,
    naturalResources,
    recycle,
    refurbish,
    repair,
    reuse,
    selling,
  };

  return { t, stocks, parameters, variables, flows };
}

export function accumulateFlowsPerStock(flows: Flows): Stocks {
  const {
    abandonFirstHand,
    abandonSecondHand,
    breakFirstHand,
    breakSecondHand,
    disposeBroken,
    disposeHibernating,
    naturalResources,
    recycle,
    refurbish,
    repair,
    reuse,
    selling,
  } = flows;
  const flowPerStock: Stocks = {
    manufacturer: naturalResources + recycle - selling,
    firstHand: selling + refurbish - (abandonFirstHand + breakFirstHand),
    secondHand: repair + reuse - (abandonSecondHand + breakSecondHand),
    hibernating:
      abandonFirstHand + abandonSecondHand - (disposeHibernating + refurbish),
    broken: breakFirstHand + breakSecondHand - (disposeBroken + repair),
    landfill: disposeHibernating + disposeBroken,
  };
  return flowPerStock;
}

function createFlowEvaluator(
  parameters: Parameters,
): FlowEvaluator<StockArray> {
  function evaluateFlowPerStock(
    stocksArray: StockArray,
    t: number,
  ): IntegrationEngineOutputArray<StockArray> {
    const stocks = stockArrayToStocks(stocksArray);
    const { flows } = evaluateModel(stocks, parameters, t);
    const flowPerStock = accumulateFlowsPerStock(flows);
    return stocksToStockArray(flowPerStock);
  }
  return evaluateFlowPerStock;
}

function stepModel(
  stocks: Stocks,
  t: number,
  h: number,
  flowEvaluator: FlowEvaluator<StockArray>,
): Stocks {
  const stocksArray = stocksToStockArray(stocks);
  const newStocksArray = step<StockArray>(stocksArray, t, h, flowEvaluator);
  return stockArrayToStocks(newStocksArray);
}

const initialStocks: Readonly<Stocks> = {
  manufacturer: 0,
  firstHand: 0,
  secondHand: 0,
  hibernating: 0,
  broken: 0,
  landfill: 0,
};
const defaultParameters: Readonly<Parameters> = {
  firstHandPreference: 0.52,
  globalDemand: 1000000,
  abandonRate: 0.0,
  breakRate: 0.25,
  repairRate: 1.0,
  reuseRate: 1.0,
  refurbishRate: 1.0,
  recycleRate: 0.0,
};

export type {
  ModelIds,
  StockId,
  StockIds,
  Stocks,
  StockArray,
  ParameterId,
  ParameterIds,
  Parameters,
  VariableId,
  VariableIds,
  Variables,
  FlowId,
  FlowIds,
  Flows,
  Record,
};
export {
  modelIds,
  stocksToStockArray,
  stockArrayToStocks,
  evaluateModel,
  stepModel,
  createFlowEvaluator,
  defaultParameters,
  initialStocks,
};
