import yaml from 'js-yaml';
import type { DeepReadonly } from 'ts-essentials';
import { CircularEconomyModel } from './circular-economy-model';
import type { GameConfig } from './game';

const configBaseUrl = new URL('./config/', window.location.href);

async function loadConfigFile(url: string | URL): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to load config file '${url.toString()}': ${response.statusText}`,
    );
  }
  const text = await response.text();
  const json = yaml.load(text, { schema: yaml.JSON_SCHEMA });
  return json;
}

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

export async function loadConfig(): Promise<ReadOnlyConfig> {
  const modelConfig = (await loadConfigFile(
    new URL('00-model.yaml', configBaseUrl),
  )) as GameConfig['model']; // FIXME: Validate instead of casting

  const simulationConfig = (await loadConfigFile(
    new URL('10-simulation.yaml', configBaseUrl),
  )) as GameConfig['simulation']; // FIXME: Validate instead of casting

  const parameterTransformsGroups = (await loadConfigFile(
    new URL('20-parameter-transforms.yaml', configBaseUrl),
  )) as ParameterTransformsConfig; // FIXME: Validate instead of casting

  return {
    model: modelConfig,
    simulation: simulationConfig,
    parameterTransforms: parameterTransformsGroups,
  };
}
