import type { DeepReadonly } from 'ts-essentials';
import { CircularEconomyModel } from './circular-economy-model';
import type { GameConfig } from './game';

const configBaseUrl = new URL('./config/', window.location.href);

async function loadConfigFile(url: string | URL): Promise<unknown> {
  const response = await fetch(url);
  const json = (await response.json()) as unknown;
  return json;
}

export type ParameterTransformConfig = { id: string; script: string };
export type ParameterTransformsConfig = ParameterTransformConfig[];
export type ParameterTransformsGroupConfig = {
  id: string;
  transforms: ParameterTransformConfig[];
};
export type ParameterTransformsGroupsConfig = ParameterTransformsGroupConfig[];

type Config = {
  parameterTransformsGroups: ParameterTransformsGroupsConfig;
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

function preprocessParameterTransformsGroups(
  ptgs: ParameterTransformsGroupsConfig,
): ParameterTransformsGroupsConfig {
  const options = new URLSearchParams(window.location.search);
  const ptgIds = options.getAll('ptg');
  const ptgsFiltered = [];
  if (ptgIds.length === 0) {
    ptgsFiltered.push(...ptgs);
  } else {
    const ptgsClone = [...ptgs];
    ptgIds.forEach((ptgId) => {
      const ptgIndex = ptgsClone.findIndex(({ id }) => ptgId === id);
      if (ptgIndex === -1) {
        console.warn(`Unknown parameter transforms group id: '${ptgId}'`);
      } else {
        const ptg = ptgsClone[ptgIndex];
        // Remove the element from the list such that a repeated search for the same id will
        // only succeed if list contains another item with this id.
        ptgsClone.splice(ptgIndex, 1);
        ptgsFiltered.push(ptg);
      }
    });
  }
  return ptgsFiltered;
}

export async function loadConfig(): Promise<ReadOnlyConfig> {
  const modelConfig = (await loadConfigFile(
    new URL('model.json', configBaseUrl),
  )) as GameConfig['model']; // FIXME: Validate instead of casting

  const simulationConfig = (await loadConfigFile(
    new URL('simulation.json', configBaseUrl),
  )) as GameConfig['simulation']; // FIXME: Validate instead of casting

  const parameterTransformsGroups = (await loadConfigFile(
    new URL('parameter-transforms.json', configBaseUrl),
  )) as ParameterTransformsGroupsConfig; // FIXME: Validate instead of casting

  return {
    model: modelConfig,
    simulation: simulationConfig,
    parameterTransformsGroups: preprocessParameterTransformsGroups(
      parameterTransformsGroups,
    ),
  };
}
