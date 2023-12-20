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

export type Config = {
  parameterTransformsGroups: ParameterTransformsGroupsConfig;
};

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

export default async function loadConfig() {
  const parameterTransformsGroups = (await loadConfigFile(
    new URL('parameter-transforms.json', configBaseUrl),
  )) as ParameterTransformsGroupsConfig; // FIXME: Validate instead of casting
  return {
    parameterTransformsGroups: preprocessParameterTransformsGroups(
      parameterTransformsGroups,
    ),
  };
}
