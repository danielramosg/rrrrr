import type { DeepReadonly } from 'ts-essentials';
import type { Ref } from 'vue';

import { strict as assert } from 'assert';
import { defineStore } from 'pinia';
import { inject, ref } from 'vue';
import { reactiveComputed } from '@vueuse/core';

import type {
  ActionCardSlotGroupConfig,
  BasicSlotGroupConfig,
  EventCardSlotGroupConfig,
  ReadonlyConfig,
  SlotGroupConfig,
} from '../config/config-schema';

import { CONFIG_INJECTION_KEY } from '../builtin-config';
import { useParameterTransformsStore } from './parameter-transforms';
import { exhaustiveGuard } from '../util/type-helpers';

export interface ParameterTransformState {
  readonly id: string;
  active: Ref<boolean> | boolean;
}

export interface SlotGroupParameterTransformsState {
  readonly id: string;
  parameterTransforms: ParameterTransformState[];
}

function useParameterTransformId(id: string): ParameterTransformState {
  const active = ref(false);
  return { id, active };
}

export function useInternalSlotGroup(): SlotGroupParameterTransformsState {
  const id = 'internal';
  const parameterTransformStore = useParameterTransformsStore();
  const parameterTransforms: ParameterTransformState[] = reactiveComputed<
    ParameterTransformState[]
  >(() =>
    parameterTransformStore.parameterTransforms.map(
      ({ id: parameterTransformId }) =>
        useParameterTransformId(parameterTransformId),
    ),
  );
  return { id, parameterTransforms };
}

function useBasicSlotGroup(
  config: DeepReadonly<BasicSlotGroupConfig>,
): SlotGroupParameterTransformsState {
  const { id } = config;
  const parameterTransforms = config.parameterTransformIds.map(
    useParameterTransformId,
  );
  return { id, parameterTransforms };
}

function useActionCardSlotGroup(
  config: DeepReadonly<ActionCardSlotGroupConfig>,
): SlotGroupParameterTransformsState {
  const { id } = config;
  const parameterTransforms = config.cards.map(({ parameterTransformId }) =>
    useParameterTransformId(parameterTransformId),
  );
  return { id, parameterTransforms };
}

function useEventCardSlotGroup(
  config: DeepReadonly<EventCardSlotGroupConfig>,
): SlotGroupParameterTransformsState {
  const { id } = config;
  const parameterTransforms = config.cards.map(({ parameterTransformId }) =>
    useParameterTransformId(parameterTransformId),
  );
  return { id, parameterTransforms };
}

export function useSlotGroup(
  config: DeepReadonly<SlotGroupConfig>,
): SlotGroupParameterTransformsState {
  const { type } = config;
  switch (type) {
    case 'basic':
      return useBasicSlotGroup(config);
    case 'action-card':
      return useActionCardSlotGroup(config);
    case 'event-card':
      return useEventCardSlotGroup(config);
    default:
      return exhaustiveGuard(type);
  }
}

export const useSlotGroupsStore = defineStore('slot-groups', () => {
  const config = inject<ReadonlyConfig | null>(CONFIG_INJECTION_KEY, null);
  assert(config);

  const internalSlotGroup = useInternalSlotGroup();
  const configBasedSlotGroups = config.interaction.slotGroups.map(useSlotGroup);

  const slotGroups = [internalSlotGroup, ...configBasedSlotGroups];

  return { slotGroups, internalSlotGroup };
});
