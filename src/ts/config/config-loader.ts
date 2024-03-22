import yaml from 'js-yaml';
import deepmerge from 'deepmerge';
import {
  ConfigSchema,
  type ReadonlyConfig,
  type ValidationIssue,
} from './config-schema';
import { SafeResult } from '../util/type-helpers';

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

  static async safeLoad(
    ...urls: URL[]
  ): Promise<
    SafeResult<ReadonlyConfig, { config: unknown; issues: ValidationIssue[] }>
  > {
    const segments = await Promise.all(urls.map(ConfigLoader.fetch.bind(this)));
    const merged = deepmerge.all(segments, { arrayMerge: overwriteMerge });
    const validationResult = await ConfigSchema.validate(merged);
    if ('issues' in validationResult)
      return {
        success: false,
        error: { config: merged, issues: validationResult.issues },
      };

    return { success: true, data: validationResult.data as ReadonlyConfig };
  }

  static async load(...urls: URL[]): Promise<ReadonlyConfig> {
    const loadResult = await ConfigLoader.safeLoad(...urls);
    if (!loadResult.success)
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw loadResult.error;

    return loadResult.data;
  }
}
