import {
  IntegrationEngineInputArray,
  IntegrationEngineOutputArray,
  FlowEvaluator,
  IVPIntegrator,
  ConvergenceCriterion,
} from './types';
import { rk4 } from './ode';

function step<T>(
  stocksAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  getFlows: FlowEvaluator<T>,
  integrator: IVPIntegrator<T> = rk4,
): IntegrationEngineOutputArray<T> {
  return integrator(stocksAtT, t, h, getFlows);
}

function converge<T, C>(
  stocksAtT: IntegrationEngineInputArray<T>,
  t: number,
  h: number,
  getFlows: FlowEvaluator<T>,
  criterion: ConvergenceCriterion<T, C>,
  integrator: IVPIntegrator<T> = rk4,
): C {
  let iterations = 0;
  let { userdata, done } = criterion(stocksAtT, t, undefined, iterations);

  if (!done) {
    while (!done) {
      /* eslint-disable no-param-reassign */
      stocksAtT = integrator(stocksAtT, t, h, getFlows);
      t += h;
      iterations += 1;
      ({ userdata, done } = criterion(stocksAtT, t, userdata, iterations));
    }
  }

  return userdata;
}

export type { FlowEvaluator, ConvergenceCriterion };
export { step, converge };
