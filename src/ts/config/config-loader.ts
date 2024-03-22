import yaml from 'js-yaml';
import deepmerge from 'deepmerge';
import { ReadOnlyConfig } from './config-schema';

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

export async function loadConfig(...urls: URL[]): Promise<ReadOnlyConfig> {
  const config = await loadAllConfigFiles(...urls);
  return config as ReadOnlyConfig; // FIXME: Validate instead of casting;
}
