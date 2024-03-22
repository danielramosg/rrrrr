import yaml from 'js-yaml';
import deepmerge from 'deepmerge';
import { ReadOnlyConfig } from './config-schema';

function overwriteMerge<T>(destination: unknown, source: T): T {
  return source;
}

export class ConfigLoader {
  protected static async fetch(url: string | URL): Promise<object> {
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

  static async load(...urls: URL[]): Promise<ReadOnlyConfig> {
    const segments = await Promise.all(urls.map(ConfigLoader.fetch.bind(this)));
    const merged = deepmerge.all(segments, { arrayMerge: overwriteMerge });
    const config = merged as ReadOnlyConfig; // FIXME: Validate instead of casting;
    return config;
  }
}
