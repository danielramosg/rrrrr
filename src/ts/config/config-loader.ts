import yaml from 'js-yaml';
import type { DeepReadonly } from 'ts-essentials';
import deepmerge from 'deepmerge';
import { CircularEconomyModel } from '../circular-economy-model';

const configBaseUrl = new URL('./config/', window.location.href);

function overwriteMerge<T>(destination: unknown, source: T): T {
  return source;
}

async function loadConfigFile(url: string | URL): Promise<object> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to load config file '${url.toString()}': ${response.statusText}`,
    );
  }

  const text = await response.text();
  const json = yaml.load(text, { schema: yaml.JSON_SCHEMA });
  if (typeof json !== 'object' || json === null)
    throw new Error(
      `Failed to parse config file '${url.toString()}': ${JSON.stringify(json)}`,
    );
  return json;
}

async function loadAllConfigFiles(...urls: (string | URL)[]) {
  const configSegments = await Promise.all(urls.map(loadConfigFile));
  return deepmerge.all(configSegments, { arrayMerge: overwriteMerge });
}

export type ParameterTransformConfig = { id: string; script: string };
export type ParameterTransformsConfig = ParameterTransformConfig[];

type ConfigLoader = {
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
export type ReadOnlyConfig = DeepReadonly<ConfigLoader>;

export async function loadConfig(): Promise<ReadOnlyConfig> {
  const configFileNames = [
    '00-model.yaml',
    '10-simulation.yaml',
    '20-parameter-transforms.yaml',
  ];
  const configFileUrls = configFileNames.map(
    (name) => new URL(name, configBaseUrl),
  );
  const config = await loadAllConfigFiles(...configFileUrls);

  return config as ReadOnlyConfig; // FIXME: Validate instead of casting;
}
