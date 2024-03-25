import { wrap } from '@typeschema/suretype';
import type { ElementOf, StrictExclude, DeepReadonly } from 'ts-essentials';

import { SuretypeConfigSchema } from './suretype-config-schema';
import { type Config } from './config-schema-types.generated';

const ConfigSchema = wrap(SuretypeConfigSchema);

type ReadonlyConfig = DeepReadonly<Config>;

type ValidationResult = Awaited<ReturnType<typeof ConfigSchema.validate>>;
type ValidationIssue = ElementOf<
  StrictExclude<ValidationResult, { data: unknown }>['issues']
>;

export { ReadonlyConfig, ValidationIssue };
export { ConfigSchema };

export * from './config-schema-types.generated';
