import { strict as assert } from 'assert';
import { defineStore } from 'pinia';
import { ref, computed, inject } from 'vue';

import type { ReadonlyConfig } from '../config/config-schema';

import { ScriptedParameterTransform } from '../parameter-transform/scripted-parameter-transform';
import { parameterIds } from '../circular-economy-model';
import { CONFIG_INJECTION_KEY } from '../builtin-config';

export const useParameterTransformsStore = defineStore(
  'parameter-transforms',
  () => {
    const config = inject<ReadonlyConfig | null>(CONFIG_INJECTION_KEY, null);
    assert(config);

    const parameterTransforms = config.parameterTransforms.map((c) => {
      const script = ref(c.id);
      const transform = computed(
        () => new ScriptedParameterTransform(c.id, parameterIds, c.script),
      );
      return { id: c.id, script, transform };
    });
    return { parameterTransforms };
  },
);
