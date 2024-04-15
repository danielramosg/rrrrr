// This file was auto-generated from the InsightMaker model. Do not edit it manually.
import { Model } from './model';
import type {
  ModelElementObject,
  ModelElementId,
  ModelElementArray,
  ModelRecord,
} from './model';

const stockIds = [
  'capacityOfNewlyProducedPhones',
  'capacityOfRecycledMaterials',
  'capacityOfRefurbishedPhones',
  'capacityOfRepairedPhones',
  'phonesInUse',
  'supplyOfBrokenPhones',
  'supplyOfDisposedPhones',
  'supplyOfHibernatingPhones',
  'supplyOfNewlyProducedPhones',
  'supplyOfRecycledMaterials',
  'supplyOfRefurbishedPhones',
  'supplyOfRepairedPhones',
] as const;

const flowIds = [
  'abandon',
  'acquireNewlyProduced',
  'acquireRefurbished',
  'acquireRepaired',
  'acquireUsed',
  'capacityOfNewlyProducedPhonesAdjustment',
  'capacityOfRecycledMaterialsAdjustment',
  'capacityOfRefurbishedPhonesAdjustment',
  'disposeBroken',
  'disposeHibernating',
  'goBroken',
  'landfill',
  'produceFromNaturalResources',
  'produceFromRecycledMaterials',
  'recycle',
  'refurbish',
  'repair',
  'repairShopCapcityAdjustment',
] as const;

const variableIds = [
  'demandForNaturalResources',
  'demandForNewlyProducedPhones',
  'demandForPhones',
  'demandForRecycledMaterials',
  'demandForRecycling',
  'demandForRefurbishedPhones',
  'demandForRefurbishment',
  'demandForRepair',
  'demandForRepairedPhones',
  'demandForResources',
  'demandForReusedPhones',
  'inflowIncentiveSumForPhonesInUse',
  'phoneGoal',
  'phonesInUseExcess',
  'supplyOfBrokenPhonesForDisposal',
  'supplyOfBrokenPhonesForRepair',
  'supplyOfDisposedPhonesForLandfilling',
  'supplyOfDisposedPhonesForRecycling',
  'supplyOfHibernatingPhonesForDisposal',
  'supplyOfHibernatingPhonesForRefurbishment',
  'supplyOfHibernatingPhonesForReuse',
] as const;

const parameterIds = [
  'abandonExcessRate',
  'abandonRate',
  'acquireRate',
  'breakRate',
  'capacityAdjustmentRate',
  'disposeIncentive',
  'disposeRate',
  'landfillIncentive',
  'landfillRate',
  'naturalResourcesIncentive',
  'newPhoneProductionRate',
  'newlyProducedPhoneIncentive',
  'numberOfUsers',
  'phonesPerUserGoal',
  'recycleRate',
  'recyclingIncentive',
  'refurbishmentIncentive',
  'refurbishmentRate',
  'repairIncentive',
  'repairRate',
  'reuseIncentive',
] as const;

const stocksFlowsMatrix = [
  [null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, 10, null, 0, null, null, null, null],
  [null, null, null, null, null, null, 8, null, null, null, null, 16],
  [null, null, null, null, null, null, null, null, null, 14, null, null],
  [null, null, null, null, 4, null, 9, null, null, null, 15, null],
  [null, null, null, null, 1, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, 13, null, null, null],
  [null, null, null, null, 2, null, null, null, null, null, null, null],
  [null, null, null, null, 3, null, null, null, null, null, null, null],
] as (number | null)[][];

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
    capacityOfNewlyProducedPhones: 0,
    capacityOfRecycledMaterials: 0,
    capacityOfRefurbishedPhones: 0,
    capacityOfRepairedPhones: 0,
    phonesInUse: 0,
    supplyOfBrokenPhones: 0,
    supplyOfDisposedPhones: 0,
    supplyOfHibernatingPhones: 0,
    supplyOfNewlyProducedPhones: 0,
    supplyOfRecycledMaterials: 0,
    supplyOfRefurbishedPhones: 0,
    supplyOfRepairedPhones: 0,
  };

  public static readonly defaultParameters: Readonly<Parameters> = {
    abandonExcessRate: 0.5,
    abandonRate: 0.1,
    acquireRate: 1,
    breakRate: 0.1,
    capacityAdjustmentRate: 0.1,
    disposeIncentive: 0.5,
    disposeRate: 0.5,
    landfillIncentive: 0.5,
    landfillRate: 1,
    naturalResourcesIncentive: 0.5,
    newPhoneProductionRate: 0.5,
    newlyProducedPhoneIncentive: 0.82,
    numberOfUsers: 1000000,
    phonesPerUserGoal: 1,
    recycleRate: 1,
    recyclingIncentive: 0.89,
    refurbishmentIncentive: 0.5,
    refurbishmentRate: 1,
    repairIncentive: 0.5,
    repairRate: 1,
    reuseIncentive: 0.86,
  };

  constructor() {
    super(stockIds, flowIds, variableIds, parameterIds);
  }

  // eslint-disable-next-line class-methods-use-this
  public evaluate(stocks: Stocks, parameters: Parameters, t: number): Record {
    const {
      capacityOfNewlyProducedPhones,
      capacityOfRecycledMaterials,
      capacityOfRefurbishedPhones,
      capacityOfRepairedPhones,
      phonesInUse,
      supplyOfBrokenPhones,
      supplyOfDisposedPhones,
      supplyOfHibernatingPhones,
      supplyOfNewlyProducedPhones,
      supplyOfRecycledMaterials,
      supplyOfRefurbishedPhones,
      supplyOfRepairedPhones,
    } = stocks;
    const {
      abandonExcessRate,
      abandonRate,
      acquireRate,
      breakRate,
      capacityAdjustmentRate,
      disposeIncentive,
      disposeRate,
      landfillIncentive,
      landfillRate,
      naturalResourcesIncentive,
      newPhoneProductionRate,
      newlyProducedPhoneIncentive,
      numberOfUsers,
      phonesPerUserGoal,
      recycleRate,
      recyclingIncentive,
      refurbishmentIncentive,
      refurbishmentRate,
      repairIncentive,
      repairRate,
      reuseIncentive,
    } = parameters;

    const phoneGoal = numberOfUsers * phonesPerUserGoal;
    const phonesInUseExcess = Math.max(phonesInUse - phoneGoal, 0);
    const abandon =
      abandonRate * phonesInUse + abandonExcessRate * phonesInUseExcess;
    const inflowIncentiveSumForPhonesInUse =
      reuseIncentive +
      repairIncentive +
      refurbishmentIncentive +
      newlyProducedPhoneIncentive;
    const goBroken = breakRate * phonesInUse;
    const demandForPhones = Math.max(
      0,
      phoneGoal - phonesInUse + goBroken + abandon,
    );
    const demandForNewlyProducedPhones =
      (newlyProducedPhoneIncentive / inflowIncentiveSumForPhonesInUse) *
      demandForPhones;
    const acquireNewlyProduced =
      acquireRate *
      Math.min(supplyOfNewlyProducedPhones, demandForNewlyProducedPhones);
    const demandForRefurbishedPhones =
      (refurbishmentIncentive / inflowIncentiveSumForPhonesInUse) *
      demandForPhones;
    const acquireRefurbished =
      acquireRate *
      Math.min(demandForRefurbishedPhones, supplyOfRefurbishedPhones);
    const demandForRepairedPhones =
      (repairIncentive / inflowIncentiveSumForPhonesInUse) * demandForPhones;
    const acquireRepaired =
      acquireRate * Math.min(demandForRepairedPhones, supplyOfRepairedPhones);
    const supplyOfHibernatingPhonesForReuse =
      (reuseIncentive /
        (reuseIncentive + refurbishmentIncentive + disposeIncentive)) *
      supplyOfHibernatingPhones;
    const demandForReusedPhones =
      (reuseIncentive / inflowIncentiveSumForPhonesInUse) * demandForPhones;
    const acquireUsed =
      acquireRate *
      Math.min(supplyOfHibernatingPhonesForReuse, demandForReusedPhones);
    const capacityOfNewlyProducedPhonesAdjustment =
      capacityAdjustmentRate *
      (demandForNewlyProducedPhones - capacityOfNewlyProducedPhones);
    const demandForResources = Math.max(
      capacityOfNewlyProducedPhones -
        supplyOfNewlyProducedPhones +
        acquireNewlyProduced,
      0,
    );
    const demandForRecycledMaterials =
      (recyclingIncentive / (naturalResourcesIncentive + recyclingIncentive)) *
      demandForResources;
    const capacityOfRecycledMaterialsAdjustment =
      capacityAdjustmentRate *
      (demandForRecycledMaterials - capacityOfRecycledMaterials);
    const capacityOfRefurbishedPhonesAdjustment =
      capacityAdjustmentRate *
      (demandForRefurbishedPhones - capacityOfRefurbishedPhones);
    const supplyOfBrokenPhonesForDisposal =
      (disposeIncentive / (repairIncentive + disposeIncentive)) *
      supplyOfBrokenPhones;
    const disposeBroken = disposeRate * supplyOfBrokenPhonesForDisposal;
    const supplyOfHibernatingPhonesForDisposal =
      (disposeIncentive /
        (reuseIncentive + refurbishmentIncentive + disposeIncentive)) *
      supplyOfHibernatingPhones;
    const disposeHibernating =
      disposeRate * supplyOfHibernatingPhonesForDisposal;
    const supplyOfDisposedPhonesForLandfilling =
      (landfillIncentive / (recyclingIncentive + landfillIncentive)) *
      supplyOfDisposedPhones;
    const landfill = landfillRate * supplyOfDisposedPhonesForLandfilling;
    const demandForNaturalResources =
      (naturalResourcesIncentive /
        (naturalResourcesIncentive + recyclingIncentive)) *
      demandForResources;
    const produceFromNaturalResources =
      newPhoneProductionRate * demandForNaturalResources;
    const produceFromRecycledMaterials =
      newPhoneProductionRate *
      Math.min(demandForRecycledMaterials, supplyOfRecycledMaterials);
    const supplyOfDisposedPhonesForRecycling =
      (recyclingIncentive / (recyclingIncentive + landfillIncentive)) *
      supplyOfDisposedPhones;
    const demandForRecycling = Math.max(
      capacityOfRecycledMaterials -
        supplyOfRecycledMaterials +
        produceFromRecycledMaterials,
      0,
    );
    const recycle =
      recycleRate *
      Math.min(supplyOfDisposedPhonesForRecycling, demandForRecycling);
    const supplyOfHibernatingPhonesForRefurbishment =
      (refurbishmentIncentive /
        (reuseIncentive + refurbishmentIncentive + disposeIncentive)) *
      supplyOfHibernatingPhones;
    const demandForRefurbishment = Math.max(
      capacityOfRefurbishedPhones -
        supplyOfRefurbishedPhones +
        acquireRefurbished,
      0,
    );
    const refurbish =
      refurbishmentRate *
      Math.min(
        supplyOfHibernatingPhonesForRefurbishment,
        demandForRefurbishment,
      );
    const demandForRepair = Math.max(
      capacityOfRepairedPhones - supplyOfRepairedPhones + acquireRepaired,
      0,
    );
    const repair = repairRate * Math.min(supplyOfBrokenPhones, demandForRepair);
    const repairShopCapcityAdjustment =
      capacityAdjustmentRate *
      (demandForRepairedPhones - capacityOfRepairedPhones);
    const supplyOfBrokenPhonesForRepair =
      (repairIncentive / (repairIncentive + disposeIncentive)) *
      supplyOfBrokenPhones;

    const variables = {
      demandForNaturalResources,
      demandForNewlyProducedPhones,
      demandForPhones,
      demandForRecycledMaterials,
      demandForRecycling,
      demandForRefurbishedPhones,
      demandForRefurbishment,
      demandForRepair,
      demandForRepairedPhones,
      demandForResources,
      demandForReusedPhones,
      inflowIncentiveSumForPhonesInUse,
      phoneGoal,
      phonesInUseExcess,
      supplyOfBrokenPhonesForDisposal,
      supplyOfBrokenPhonesForRepair,
      supplyOfDisposedPhonesForLandfilling,
      supplyOfDisposedPhonesForRecycling,
      supplyOfHibernatingPhonesForDisposal,
      supplyOfHibernatingPhonesForRefurbishment,
      supplyOfHibernatingPhonesForReuse,
    };
    const flows = {
      abandon,
      acquireNewlyProduced,
      acquireRefurbished,
      acquireRepaired,
      acquireUsed,
      capacityOfNewlyProducedPhonesAdjustment,
      capacityOfRecycledMaterialsAdjustment,
      capacityOfRefurbishedPhonesAdjustment,
      disposeBroken,
      disposeHibernating,
      goBroken,
      landfill,
      produceFromNaturalResources,
      produceFromRecycledMaterials,
      recycle,
      refurbish,
      repair,
      repairShopCapcityAdjustment,
    };

    return { t, stocks, parameters, variables, flows };
  }

  // eslint-disable-next-line class-methods-use-this
  public accumulateFlowsPerStock(flows: Flows): Stocks {
    const {
      abandon,
      acquireNewlyProduced,
      acquireRefurbished,
      acquireRepaired,
      acquireUsed,
      capacityOfNewlyProducedPhonesAdjustment,
      capacityOfRecycledMaterialsAdjustment,
      capacityOfRefurbishedPhonesAdjustment,
      disposeBroken,
      disposeHibernating,
      goBroken,
      landfill,
      produceFromNaturalResources,
      produceFromRecycledMaterials,
      recycle,
      refurbish,
      repair,
      repairShopCapcityAdjustment,
    } = flows;

    const flowPerStock: Stocks = {
      capacityOfNewlyProducedPhones: capacityOfNewlyProducedPhonesAdjustment,
      capacityOfRecycledMaterials: capacityOfRecycledMaterialsAdjustment,
      capacityOfRefurbishedPhones: capacityOfRefurbishedPhonesAdjustment,
      capacityOfRepairedPhones: repairShopCapcityAdjustment,
      phonesInUse:
        acquireNewlyProduced +
        acquireRefurbished +
        acquireRepaired +
        acquireUsed -
        (abandon + goBroken),
      supplyOfBrokenPhones: goBroken - (disposeBroken + repair),
      supplyOfDisposedPhones:
        disposeBroken + disposeHibernating - (landfill + recycle),
      supplyOfHibernatingPhones:
        abandon - (acquireUsed + disposeHibernating + refurbish),
      supplyOfNewlyProducedPhones:
        produceFromNaturalResources +
        produceFromRecycledMaterials -
        acquireNewlyProduced,
      supplyOfRecycledMaterials: recycle - produceFromRecycledMaterials,
      supplyOfRefurbishedPhones: refurbish - acquireRefurbished,
      supplyOfRepairedPhones: repair - acquireRepaired,
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

export {
  CircularEconomyModel,
  stockIds,
  flowIds,
  variableIds,
  parameterIds,
  stocksFlowsMatrix,
};
