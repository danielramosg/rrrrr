import {
  IntegrationEngineInputArray,
  IntegrationEngineOutputArray,
} from './types';

export function euler<T>(
  y: IntegrationEngineInputArray<T>,
  x: number,
  h: number,
  derivatives: (
    y: IntegrationEngineInputArray<T>,
    x: number,
  ) => IntegrationEngineOutputArray<T>,
): IntegrationEngineOutputArray<T> {
  const n: number = y.length;
  const dydx = derivatives(y, x);
  const yTemp = dydx; // Reuse array for result to avoid allocation and GC
  for (let i = 0; i < n; i += 1) yTemp[i] = y[i] + h * dydx[i];
  return yTemp;
}

export function rk4<T>(
  y: IntegrationEngineInputArray<T>,
  x: number,
  h: number,
  derivatives: (
    y: IntegrationEngineInputArray<T>,
    x: number,
  ) => IntegrationEngineOutputArray<T>,
): IntegrationEngineOutputArray<T> {
  const n: number = y.length;

  const dydx = derivatives(y, x);
  const yTemp = new Array(n) as IntegrationEngineOutputArray<T>;

  const h2 = h / 2.0;
  const h6 = h / 6.0;
  const xhh = x + h2;

  for (let i = 0; i < n; i += 1) yTemp[i] = y[i] + h2 * dydx[i];
  let dydxTemp = derivatives(yTemp, xhh);

  for (let i = 0; i < n; i += 1) yTemp[i] = y[i] + h2 * dydxTemp[i];
  const dydxM = derivatives(yTemp, xhh);

  for (let i = 0; i < n; i += 1) {
    yTemp[i] = y[i] + h * dydxM[i];
    dydxM[i] += dydxTemp[i];
  }
  dydxTemp = derivatives(yTemp, x + h);

  for (let i = 0; i < n; i += 1)
    yTemp[i] = y[i] + h6 * (dydx[i] + dydxTemp[i] + 2.0 * dydxM[i]);
  return yTemp;
}
