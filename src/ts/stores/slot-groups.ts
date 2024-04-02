import { strict as assert } from 'assert';
import { defineStore } from 'pinia';
import { computed, inject } from 'vue';

import type { ReadonlyConfig } from '../config/config-schema';

import { CONFIG_INJECTION_KEY } from '../builtin-config';
import { useSlotGroup } from '../composables/slot-group';

/* TODO:
 * - We need parameter transforms for each slot group
 * - Stores can't be parameterized (by the slot group)
 * - Turn this store into a parameterized composable?
 * - Create a store for parameterTransforms of each slot group (Map<slot:string,ParameterTransformComposable>)?
 * - Try to align the structure as much as possible with the config file!
 * - Possibly add an "internal" slot group for connecting the control panel to test parameter transforms?
 */

export const useSlotGroupsStore = defineStore('slot-groups', () => {
  const config = inject<ReadonlyConfig | null>(CONFIG_INJECTION_KEY, null);
  assert(config);

  const slotGroups = config.interaction.slotGroups.map(useSlotGroup);

  const activeParameterTransformIds = computed(() => {
    const allActive2d = slotGroups.map(({ parameterTransforms }) =>
      parameterTransforms.filter((p) => p.active).map(({ id }) => id),
    );
    const allActive = allActive2d.flat();
    return allActive;
  });

  return { slotGroups, activeParameterTransformIds };
});

/*
export const useParameterTransformsStore = defineStore(
  'parameter-transforms',
  () => {
    const config = inject<ReadonlyConfig | null>(CONFIG_INJECTION_KEY, null);
    assert(config);

    const modelStore = useModelStore();

    const parameterTransforms = config.parameterTransforms.map(
      (p) =>
        new ScriptedParameterTransform(p.id, parameterIds, p.script, false),
    );

    const available = ref(parameterTransforms);
    const active = computed(() => available.value.filter((p) => p.isActive));

    const { initialParameters } = modelStore;

    const transformedParametersExt = computed(
      (): Readonly<ParameterTransformStep>[] => {
        const steps = new Array<ParameterTransformStep>();
        let before = { ...initialParameters };
        steps.push({
          before,
          after: before,
          diff: {},
        });
        active.value.forEach((transform) => {
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

    return {
      available,
      active,
      initialParameters,
      transformedParametersExt,
      transformedParameters,
    };
  },
);
*/
