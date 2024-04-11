<script setup lang="ts">
import { ref, toRaw } from 'vue';
import yaml from 'js-yaml';

import { useParameterTransformsStore } from '../../ts/stores/parameter-transforms';
import { useConfigStore } from '../../ts/stores/config';
import { validateConfig } from '../../ts/config/config-schema';

const { config } = useConfigStore();

const parameterTransformsStore = useParameterTransformsStore();
const { parameterTransforms } = parameterTransformsStore;

const yamlText = ref('');

function importParameterTransforms() {
  const unvalidatedPartialConfig = yaml.load(yamlText.value) as {
    [key: string]: unknown;
  };
  const newConfig = structuredClone(toRaw(config)) as {
    [key: string]: unknown;
  };
  newConfig.parameterTransforms = unvalidatedPartialConfig.parameterTransforms;

  const validationResult = validateConfig(newConfig);

  if (!validationResult.ok) {
    /* eslint-disable no-console */
    const {
      error: { errors, explanation },
    } = validationResult;
    console.error('Invalid configuration:', newConfig);
    console.error(explanation);
    console.error(
      'Issues reported by the configuration validator:',
      ...(errors ?? []),
    );
    return;
  }

  const { parameterTransforms: validatedParameterTransforms } =
    validationResult.data;

  parameterTransformsStore.replaceAll(validatedParameterTransforms);
}

function exportParameterTransforms() {
  const exportObj = {
    parameterTransforms: parameterTransforms.map(({ id, script }) => ({
      id,
      script,
    })),
  };
  yamlText.value = yaml.dump(exportObj);
  console.log(yamlText.value);
}
</script>

<template>
  Import/Export parameter transforms:<br />
  <textarea v-model="yamlText" rows="37" cols="80"></textarea>
  <div>
    <input type="button" value="Import" @click="importParameterTransforms()" />
    <input type="button" value="Export" @click="exportParameterTransforms()" />
  </div>
</template>
