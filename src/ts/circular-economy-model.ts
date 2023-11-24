import {
  Model,
  ModelElementObject,
  ModelElementId,
  ModelElementArray,
  ModelRecord,
} from './model';

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

type StockIds = typeof stockIds;
type StockId = ModelElementId<StockIds>;
type Stocks = ModelElementObject<StockIds>;
type StockArray = ModelElementArray<StockIds>;

type FlowIds = typeof flowIds;
type FlowId = ModelElementId<FlowIds>;
type Flows = ModelElementObject<FlowIds>;
type FlowArray = ModelElementArray<FlowIds>;

type VariableIds = typeof variableIds;
type VariableId = ModelElementId<VariableIds>;
type Variables = ModelElementObject<VariableIds>;
type VariableArray = ModelElementArray<VariableIds>;

type ParameterIds = typeof parameterIds;
type ParameterId = ModelElementId<ParameterIds>;
type Parameters = ModelElementObject<ParameterIds>;
type ParameterArray = ModelElementArray<ParameterIds>;

type Record = ModelRecord<StockIds, FlowIds, VariableIds, ParameterIds>;

class CircularEconomyModel extends Model<
  StockIds,
  FlowIds,
  VariableIds,
  ParameterIds
> {
  public static readonly initialStocks: Readonly<Stocks> = {
    manufacturer: 0,
    firstHand: 0,
    secondHand: 0,
    hibernating: 0,
    broken: 0,
    landfill: 0,
  };

  public static readonly defaultParameters: Readonly<Parameters> = {
    firstHandPreference: 0.52,
    globalDemand: 1000000,
    abandonRate: 0.0,
    breakRate: 0.25,
    repairRate: 1.0,
    reuseRate: 1.0,
    refurbishRate: 1.0,
    recycleRate: 0.0,
  };

  constructor() {
    super(stockIds, flowIds, variableIds, parameterIds);
  }

  // eslint-disable-next-line class-methods-use-this
  public evaluate(stocks: Stocks, parameters: Parameters, t: number): Record {
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

  // eslint-disable-next-line class-methods-use-this
  public accumulateFlowsPerStock(flows: Flows): Stocks {
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
}

export type {
  StockIds,
  StockId,
  Stocks,
  StockArray,
  FlowIds,
  FlowId,
  Flows,
  FlowArray,
  VariableIds,
  VariableId,
  Variables,
  VariableArray,
  ParameterIds,
  ParameterId,
  Parameters,
  ParameterArray,
  Record,
};

export default CircularEconomyModel;
