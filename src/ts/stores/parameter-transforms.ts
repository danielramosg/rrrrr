import type { DeepReadonly } from 'ts-essentials';
import type { Ref } from 'vue';

import { strict as assert } from 'assert';
import { defineStore } from 'pinia';
import { reactive, ref, computed, inject } from 'vue';

import type {
  ReadonlyConfig,
  ParameterTransformConfig,
} from '../config/config-schema';
import type { PararameterTransformFunction } from '../parameter-transform/function-parameter-transform';

import { ScriptedParameterTransform } from '../parameter-transform/scripted-parameter-transform';
import { parameterIds } from '../circular-economy-model';
import { CONFIG_INJECTION_KEY } from '../builtin-config';

export type ReactiveParameterTransform = {
  id: string;
  script: Ref<string>;
  transform: Ref<PararameterTransformFunction<typeof parameterIds>>;
};

function createReactiveParameterTransform({
  id,
  script,
}: Readonly<{
  id: string;
  script: string;
}>): ReactiveParameterTransform {
  const reactiveScript = ref(script);
  const reactiveTransform = computed(() =>
    ScriptedParameterTransform.createFunction(
      parameterIds,
      reactiveScript.value,
    ),
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

    const move = (from: number, to: number) => {
      const [removed] = parameterTransforms.splice(from, 1);
      parameterTransforms.splice(to, 0, removed);
    };

    const replaceAll = (ptcs: DeepReadonly<ParameterTransformConfig[]>) => {
      const newParameterTransforms = ptcs.map((ptc) =>
        reactive(createReactiveParameterTransform(ptc)),
      );
      parameterTransforms.splice(
        0,
        parameterTransforms.length,
        ...newParameterTransforms,
      );
    };

    return {
      parameterTransforms,
      addOrModify,
      move,
      remove,
      replaceAll,
    };
  },
);
