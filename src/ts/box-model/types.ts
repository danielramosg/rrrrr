export type IntegrationEngineInputArray<T> = T extends readonly number[]
  ? T
  : T extends number[]
  ? ReadonlyArray<number>
  : never;
export type IntegrationEngineOutputArray<T> = T extends readonly number[]
  ? [...T]
  : T extends number[]
  ? number[]
  : never;

// Returns the sum of all flows into and out of a stock at time t
export type FlowEvaluator<T> = (
  stocks: IntegrationEngineInputArray<T>,
  t: number,
) => IntegrationEngineOutputArray<T>;

export type IVPIntegrator<T> = (
  y: IntegrationEngineInputArray<T>,
  x: number,
  h: number,
  derivatives: (
    y: IntegrationEngineInputArray<T>,
    x: number,
  ) => IntegrationEngineOutputArray<T>,
) => IntegrationEngineOutputArray<T>;

export type ConvergenceCriterionResult<C> = { userdata: C; done: boolean };
export type ConvergenceCriterion<T, C> = (
  stocksAtT: IntegrationEngineInputArray<T>,
  t: number,
  previousResult: C | undefined,
  i: number,
) => ConvergenceCriterionResult<C>;
