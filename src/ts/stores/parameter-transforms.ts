import type { DeepReadonly } from 'ts-essentials';
import type { Ref } from 'vue';

import { strict as assert } from 'assert';
import { defineStore } from 'pinia';
import { reactive, ref, computed, inject } from 'vue';

import type {
  ReadonlyConfig,
  ParameterTransformConfig,
} from '../config/config-schema';

import { parameterIds } from '../circular-economy-model';
import type { ModelElementIds, ModelElementObject } from '../model';
import { isVarName } from '../util/is-var-name';

export type ParameterTransformFunction<P extends ModelElementIds> = <
  T extends ModelElementObject<P>,
>(
  parameters: T,
) => T;

export type ReactiveParameterTransform = {
  id: string;
  script: Ref<string>;
  transform: Ref<ParameterTransformFunction<typeof parameterIds>>;
};

function createParameterTransformFunction<P extends ModelElementIds>(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  parameterIds: P,
  script: string,
): ParameterTransformFunction<P> {
  parameterIds.forEach((parameterId) => {
    if (!isVarName(parameterId)) {
      throw new Error(
        `Parameter name '${parameterId}' can not be used as a variable`,
      );
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const wrappedScript = new Function(script).toString();

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const func = new Function(
    `{ ${parameterIds.join(', ')} }`,
    `(${wrappedScript})(); return { ${parameterIds.join(', ')} }`,
  ) as ParameterTransformFunction<P>;

  return <T extends ModelElementObject<P>>(parameters: T) => {
    const transformedParameters = func(parameters);
    Object.assign(parameters, transformedParameters);
    return parameters;
  };
}

function createReactiveParameterTransform({
  id,
  script,
}: Readonly<{
  id: string;
  script: string;
}>): ReactiveParameterTransform {
  const reactiveScript = ref(script);
  const reactiveTransform = computed(() =>
    createParameterTransformFunction(parameterIds, reactiveScript.value),
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
