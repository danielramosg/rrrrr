import type { FlowEvaluator, ConvergenceCriterion } from './types';
import { step as stepImpl, converge as convergeImpl } from './engine';
import {
  IntegrationEngineInputArray,
  IntegrationEngineOutputArray,
  IVPIntegrator,
} from './types';

function step5<T>(
  stocksAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  computeFlows: FlowEvaluator<T>,
  integrator?: IVPIntegrator<T>,
): IntegrationEngineOutputArray<T> {
  return stepImpl(stocksAtT, t, h, computeFlows, integrator);
}

function step6<T>(
  stocksAtT: IntegrationEngineInputArray<T>,
  flowsAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  computeFlows: FlowEvaluator<T>,
  integrator?: IVPIntegrator<T>,
): IntegrationEngineOutputArray<T> {
  const mutableFlowsAtT = [...flowsAtT] as IntegrationEngineOutputArray<T>;
  const getFlows: FlowEvaluator<T> = (y, x) =>
    x === t ? mutableFlowsAtT : computeFlows(y, x);
  return stepImpl<T>(stocksAtT, t, h, getFlows, integrator);
}

function step<T>(
  stocksAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  computeFlows: FlowEvaluator<T>,
  integrator?: IVPIntegrator<T>,
): IntegrationEngineOutputArray<T>;
function step<T>(
  stocksAtT: IntegrationEngineInputArray<T>,
  flowsAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  computeFlows: FlowEvaluator<T>,
  integrator?: IVPIntegrator<T>,
): IntegrationEngineOutputArray<T>;
function step<T>(
  stocksAtT: IntegrationEngineInputArray<T>,
  tOrFlowsAtT: number | IntegrationEngineInputArray<T>,
  tOrH: number,
  hOrComputeFlows: number | FlowEvaluator<T>,
  computeFlowsOrIntegrator?: FlowEvaluator<T> | IVPIntegrator<T>,
  integrator?: IVPIntegrator<T>,
): IntegrationEngineOutputArray<T> {
  if (typeof tOrFlowsAtT === 'number')
    return step5(
      stocksAtT,
      tOrFlowsAtT,
      tOrH,
      hOrComputeFlows as FlowEvaluator<T>,
      computeFlowsOrIntegrator as IVPIntegrator<T>,
    );

  return step6(
    stocksAtT,
    tOrFlowsAtT,
    tOrH,
    hOrComputeFlows as number,
    computeFlowsOrIntegrator as FlowEvaluator<T>,
    integrator as IVPIntegrator<T>,
  );
}

function converge6<T, C>(
  stocksAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  computeFlows: FlowEvaluator<T>,
  criterion: ConvergenceCriterion<T, C>,
  integrator?: IVPIntegrator<T>,
): C {
  return convergeImpl(stocksAtT, t, h, computeFlows, criterion, integrator);
}

function converge7<T, C>(
  stocksAtT: IntegrationEngineInputArray<T>,
  flowsAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  computeFlows: FlowEvaluator<T>,
  criterion: ConvergenceCriterion<T, C>,
  integrator?: IVPIntegrator<T>,
): C {
  const mutableFlowsAtT = [...flowsAtT] as IntegrationEngineOutputArray<T>;
  const getFlows: FlowEvaluator<T> = (y, x) =>
    x === t ? mutableFlowsAtT : computeFlows(y, x);
  return convergeImpl(stocksAtT, t, h, getFlows, criterion, integrator);
}

function converge<T, C>(
  stocksAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  computeFlows: FlowEvaluator<T>,
  criterion: ConvergenceCriterion<T, C>,
  integrator?: IVPIntegrator<T>,
): C;
function converge<T, C>(
  stocksAtT: IntegrationEngineInputArray<T>,
  flowsAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  computeFlows: FlowEvaluator<T>,
  criterion: ConvergenceCriterion<T, C>,
  integrator?: IVPIntegrator<T>,
): C;
function converge<T, C>(
  stocksAtT: IntegrationEngineInputArray<T>,
  tOrFlowsAtT: number | IntegrationEngineInputArray<T>,
  tOrH: number,
  hOrComputeFlows: number | FlowEvaluator<T>,
  computeFlowsOrCriterion: FlowEvaluator<T> | ConvergenceCriterion<T, C>,
  criterionOrIntegrator?: ConvergenceCriterion<T, C> | IVPIntegrator<T>,
  integrator?: IVPIntegrator<T>,
): C {
  if (typeof tOrFlowsAtT === 'number')
    return converge6<T, C>(
      stocksAtT,
      tOrFlowsAtT,
      tOrH,
      hOrComputeFlows as FlowEvaluator<T>,
      computeFlowsOrCriterion as ConvergenceCriterion<T, C>,
      criterionOrIntegrator as IVPIntegrator<T>,
    );

  return converge7<T, C>(
    stocksAtT,
    tOrFlowsAtT,
    tOrH,
    hOrComputeFlows as number,
    computeFlowsOrCriterion as FlowEvaluator<T>,
    criterionOrIntegrator as ConvergenceCriterion<T, C>,
    integrator as IVPIntegrator<T>,
  );
}

export type { FlowEvaluator, ConvergenceCriterion };
export { step, converge };
