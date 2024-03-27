import type { StrictExtract, DeepReadonly } from 'ts-essentials';
import { compile } from 'suretype';

import { SuretypeConfigSchema } from './config-schema-suretype';
import { type Config } from './config-schema-types';
import type { SafeResult } from '../util/type-helpers';

const ConfigSchema = SuretypeConfigSchema;

const validateConfigSuretype = compile(ConfigSchema);
const ensureConfigSuretype = compile(ConfigSchema, { ensure: true });
const isValidConfigSuretype = compile(ConfigSchema, { simple: true });

type ValidationResult = Awaited<ReturnType<typeof validateConfigSuretype>>;
type ValidationIssue = Omit<
  StrictExtract<ValidationResult, { ok: true }>,
  'ok'
>;

const validateConfig: (data: unknown) => SafeResult<Config, ValidationIssue> = (
  data: unknown,
) => {
  const validationResult = validateConfigSuretype(data);
  if (!validationResult.ok) {
    const { errors, explanation } = validationResult;
    return { ok: false, error: { errors, explanation } };
  }

  return { ok: true, data: data as Config };
};

const ensureConfig = (data: unknown) => ensureConfigSuretype(data) as Config;
const isValidConfig = (data: unknown): data is Config =>
  isValidConfigSuretype(data);

type ReadonlyConfig = DeepReadonly<Config>;

export type { ReadonlyConfig, ValidationIssue };
export { ConfigSchema, validateConfig, ensureConfig, isValidConfig };

export * from './config-schema-types';
