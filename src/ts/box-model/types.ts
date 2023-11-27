import { ConvertTupleItemType } from '../util/type-helpers';

type ToNumberArray<T extends readonly number[]> = ConvertTupleItemType<
  T,
  number
>;

export type IntegrationEngineInputArray<T extends readonly number[]> =
  readonly [...ToNumberArray<T>];

export type IntegrationEngineOutputArray<T extends readonly number[]> = [
  ...ToNumberArray<T>,
];

// Returns the sum of all flows into and out of a stock at time t
export type FlowEvaluator<T extends readonly number[]> = (
  stocks: IntegrationEngineInputArray<T>,
  t: number,
) => IntegrationEngineOutputArray<T>;

export type IVPIntegrator<T extends readonly number[]> = (
  y: IntegrationEngineInputArray<T>,
  x: number,
  h: number,
  derivatives: (
    y: IntegrationEngineInputArray<T>,
    x: number,
  ) => IntegrationEngineOutputArray<T>,
) => IntegrationEngineOutputArray<T>;

export type ConvergenceCriterionResult<C> = { userdata: C; done: boolean };
export type ConvergenceCriterion<T extends readonly number[], C> = (
  stocksAtT: IntegrationEngineInputArray<T>,
  t: number,
  previousResult: C | undefined,
  i: number,
) => ConvergenceCriterionResult<C>;
