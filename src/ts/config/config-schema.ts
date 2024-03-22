import type { DeepReadonly } from 'ts-essentials';
import { CircularEconomyModel } from '../circular-economy-model';

export type ParameterTransformConfig = { id: string; script: string };
export type ParameterTransformsConfig = ParameterTransformConfig[];

type Config = {
  parameterTransforms: ParameterTransformsConfig;
  model: {
    initialParameters: typeof CircularEconomyModel.defaultParameters;
    initialStocks: typeof CircularEconomyModel.initialStocks;
  };
  simulation: {
    deltaPerSecond: number;
    maxStepSize: number;
  };
};

export type ReadOnlyConfig = DeepReadonly<Config>;
