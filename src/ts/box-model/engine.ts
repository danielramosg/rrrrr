import {
  IntegrationEngineInputArray,
  IntegrationEngineOutputArray,
  FlowEvaluator,
  IVPIntegrator,
  ConvergenceCriterion,
} from './types';
import { rk4 } from './ode';

function step<T extends readonly number[]>(
  stocksAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  getFlows: FlowEvaluator<T>,
  integrator: IVPIntegrator<T> = rk4<T>,
): IntegrationEngineOutputArray<T> {
  return integrator(stocksAtT, t, h, getFlows);
}

function converge<T extends readonly number[], C>(
  stocksAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  getFlows: FlowEvaluator<T>,
  criterion: ConvergenceCriterion<T, C>,
  integrator: IVPIntegrator<T> = rk4<T>,
): C {
  let iterations = 0;
  let { userdata, done } = criterion(stocksAtT, t, undefined, iterations);

  if (!done) {
    let newT = t;
    let newStocks: IntegrationEngineOutputArray<T> | undefined;

    do {
      newStocks = integrator(newStocks ?? stocksAtT, newT, h, getFlows);
      newT += h;
      iterations += 1;
      ({ userdata, done } = criterion(newStocks, newT, userdata, iterations));
    } while (!done);
  }

  return userdata;
}

export type { FlowEvaluator, ConvergenceCriterion };
export { step, converge };
