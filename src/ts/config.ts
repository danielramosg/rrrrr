const configBaseUrl = new URL('./config/', window.location.href);

async function loadConfigFile(url: string | URL): Promise<unknown> {
  const response = await fetch(url);
  const json = (await response.json()) as unknown;
  return json;
}

export type ParameterTransformConfig = { id: string; script: string };
export type ParameterTransformsConfig = ParameterTransformConfig[];

export type Config = {
  parameterTransforms: ParameterTransformsConfig;
};

export default async function loadConfig() {
  const parameterTransforms = (await loadConfigFile(
    new URL('parameter-transforms.json', configBaseUrl),
  )) as ParameterTransformsConfig; // FIXME: Validate instead of casting
  return {
    parameterTransforms,
  };
}
