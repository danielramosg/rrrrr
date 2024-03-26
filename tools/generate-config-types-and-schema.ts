import { strict as assert } from 'assert';
import {
  getJsonSchemaReader,
  getTypeScriptWriter,
  makeConverter,
} from 'typeconv';
import { extractJsonSchema } from 'suretype';
import yaml from 'js-yaml';
import { writeFileSync } from 'node:fs';
import * as prettier from 'prettier';

import {
  SuretypeConfigSchema,
  CONFIG_SCHEMA_NAME,
} from '../src/ts/config/config-schema-suretype';

const CONFIG_SCHEMA_TYPESCRIPT_FILENAME =
  'src/ts/config/config-schema-types.generated.ts';
const CONFIG_SCHEMA_YAML_FILENAME = 'src/yaml/config-schema.generated.yaml';

async function main() {
  const jsonSchemeReader = getJsonSchemaReader();
  const typeScriptWriter = getTypeScriptWriter();
  const jsonSchemaToTypeScriptConverter = makeConverter(
    jsonSchemeReader,
    typeScriptWriter,
  );

  const { schema: inputJsonSchema } = extractJsonSchema(
    [SuretypeConfigSchema],
    {
      refMethod: 'ref-all',
      onTopLevelNameConflict: 'error',
      onNonSuretypeValidator: 'error',
    },
  );
  const inputJsonSchemaString = JSON.stringify(inputJsonSchema, null, 2);

  // generate and export TypeScript types
  const { data: outputTypeScriptString } =
    await jsonSchemaToTypeScriptConverter.convert({
      data: inputJsonSchemaString,
    });
  const prettierTypeScriptOptions =
    (await prettier.resolveConfig(CONFIG_SCHEMA_TYPESCRIPT_FILENAME)) ??
    undefined;

  const formattedTypeScriptString = await prettier.format(
    outputTypeScriptString,
    { parser: 'typescript', ...prettierTypeScriptOptions },
  );
  writeFileSync(CONFIG_SCHEMA_TYPESCRIPT_FILENAME, formattedTypeScriptString);

  // generate and export JSON schema, but use YAML syntax
  const { definitions: jsonSchemaDefinitions } = inputJsonSchema;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  assert(typeof jsonSchemaDefinitions[CONFIG_SCHEMA_NAME] === 'object');
  const configDefinition = jsonSchemaDefinitions[CONFIG_SCHEMA_NAME] as Record<
    string,
    unknown
  >;

  const jsonSchemaDefinitionsWithoutConfig = Object.fromEntries(
    Object.entries(jsonSchemaDefinitions).filter(
      ([key]) => key !== CONFIG_SCHEMA_NAME,
    ),
  );

  const outputJsonSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: CONFIG_SCHEMA_NAME,
    ...configDefinition,
    definitions: jsonSchemaDefinitionsWithoutConfig,
  };

  const outputJsonSchemaString = yaml.dump(outputJsonSchema);

  const prettierYamlOptions =
    (await prettier.resolveConfig(CONFIG_SCHEMA_YAML_FILENAME)) ?? undefined;
  const formattedJsonSchemaString = await prettier.format(
    outputJsonSchemaString,
    { parser: 'yaml', ...prettierYamlOptions },
  );

  writeFileSync(CONFIG_SCHEMA_YAML_FILENAME, formattedJsonSchemaString);
}

void main();
