import type { DeepReadonly } from 'ts-essentials';
import type { Ref } from 'vue';

import { strict as assert } from 'assert';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { ParameterId, Parameters } from '../circular-economy-model';

import { CircularEconomyModel } from '../circular-economy-model';

import { useParameterTransformsStore } from './parameter-transforms';
import { useSlotGroupsStore } from './slot-groups';

export interface ParameterTransformStep {
  before: DeepReadonly<Parameters>;
  after: DeepReadonly<Parameters>;
  diff: Partial<DeepReadonly<Parameters>>;
}

const useTransformedParameters = (initialParameters: Ref<Parameters>) => {
  const slotGroupsStore = useSlotGroupsStore();
  const parameterTransformStore = useParameterTransformsStore();

  const transformedParametersExt = computed(
    (): Readonly<ParameterTransformStep>[] => {
      const { activeParameterTransformIds: activeIds } = slotGroupsStore;
      const { parameterTransforms: transforms } = parameterTransformStore;

      const steps = new Array<ParameterTransformStep>();
      let before = { ...initialParameters.value };
      steps.push({
        before,
        after: before,
        diff: {},
      });
      activeIds.forEach((id) => {
        const transform = transforms.find((t) => t.id === id)?.transform;
        assert(transform, `No transform found for id ${id}`);

        const after = transform.applyTo({ ...before });
        const diff = Object.fromEntries(
          (Object.entries(after) as Array<[ParameterId, number]>).filter(
            ([key, value]) => value !== before[key],
          ),
        );
        steps.push({ before, after, diff });
        before = after;
      });
      return steps;
    },
  );

  const transformedParameters = computed(() => {
    assert(transformedParametersExt.value.length > 0);
    return transformedParametersExt.value[
      transformedParametersExt.value.length - 1
    ].after;
  });

  return { transformedParametersExt, transformedParameters };
};

export const useModelStore = defineStore('model', () => {
  const initialRecord = new CircularEconomyModel().evaluate(
    CircularEconomyModel.initialStocks,
    CircularEconomyModel.defaultParameters,
    0,
  );
  const record = ref(initialRecord);

  const initialParameters = ref({ ...CircularEconomyModel.defaultParameters });

  const { transformedParameters, transformedParametersExt } =
    useTransformedParameters(initialParameters);
  return {
    record,
    initialParameters,
    transformedParameters,
    transformedParametersExt,
  };
});
