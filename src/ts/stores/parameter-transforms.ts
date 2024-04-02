import type { Ref } from 'vue';

import { strict as assert } from 'assert';
import { defineStore } from 'pinia';
import { reactive, ref, computed, inject } from 'vue';

import type { ReadonlyConfig } from '../config/config-schema';

import { ScriptedParameterTransform } from '../parameter-transform/scripted-parameter-transform';
import { parameterIds } from '../circular-economy-model';
import { CONFIG_INJECTION_KEY } from '../builtin-config';

export type ReactiveParameterTransform = {
  id: string;
  script: Ref<string>;
  transform: Ref<ScriptedParameterTransform<typeof parameterIds>>;
};

function createReactiveParameterTransform({
  id,
  script,
}: Readonly<{
  id: string;
  script: string;
}>): ReactiveParameterTransform {
  const reactiveScript = ref(script);
  const reactiveTransform = computed(
    () => new ScriptedParameterTransform(id, parameterIds, script),
  );
  return { id, script: reactiveScript, transform: reactiveTransform };
}

export const useParameterTransformsStore = defineStore(
  'parameter-transforms',
  () => {
    const config = inject<ReadonlyConfig | null>(CONFIG_INJECTION_KEY, null);
    assert(config);

    const parameterTransforms = reactive(
      config.parameterTransforms.map((pt) =>
        reactive(createReactiveParameterTransform(pt)),
      ),
    );

    const addOrModify = (id: string, script: string) => {
      const index = parameterTransforms.findIndex((t) => t.id === id);
      if (index === -1) {
        const newTransform = createReactiveParameterTransform({ id, script });
        parameterTransforms.push(reactive(newTransform));
      } else {
        parameterTransforms[index].script = script;
      }
    };

    const remove = (id: string) => {
      const index = parameterTransforms.findIndex((t) => t.id === id);
      if (index !== -1) parameterTransforms.splice(index, 1);
    };

    return {
      parameterTransforms,
      addOrModify,
      remove,
    };
  },
);
