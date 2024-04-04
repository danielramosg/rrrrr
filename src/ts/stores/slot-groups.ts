import type { DeepReadonly } from 'ts-essentials';

import { strict as assert } from 'assert';
import { defineStore } from 'pinia';
import { inject, reactive } from 'vue';
import { v4 as uuid4 } from 'uuid';

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
  readonly uuid: string;
  active: boolean;
}

export interface SlotGroupParameterTransformsState {
  readonly id: string;
  parameterTransforms: ParameterTransformState[];
}

export function useParameterTransformId(id: string): ParameterTransformState {
  const uuid = uuid4();
  const active = false;
  return reactive({ id, uuid, active });
}

export function useInternalSlotGroup(): SlotGroupParameterTransformsState {
  const id = 'internal';
  const parameterTransformStore = useParameterTransformsStore();
  const parameterTransforms: ParameterTransformState[] = reactive(
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
  const parameterTransforms = reactive(
    config.parameterTransformIds.map(useParameterTransformId),
  );
  return { id, parameterTransforms };
}

function useActionCardSlotGroup(
  config: DeepReadonly<ActionCardSlotGroupConfig>,
): SlotGroupParameterTransformsState {
  const { id } = config;
  const parameterTransforms = reactive(
    config.cards.map(({ parameterTransformId }) =>
      useParameterTransformId(parameterTransformId),
    ),
  );
  return { id, parameterTransforms };
}

function useEventCardSlotGroup(
  config: DeepReadonly<EventCardSlotGroupConfig>,
): SlotGroupParameterTransformsState {
  const { id } = config;
  const parameterTransforms = reactive(
    config.cards.map(({ parameterTransformId }) =>
      useParameterTransformId(parameterTransformId),
    ),
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
  const nonInternalSlotGroups = config.interaction.slotGroups.map(useSlotGroup);

  const slotGroups = [internalSlotGroup, ...nonInternalSlotGroups];

  return { slotGroups, internalSlotGroup, nonInternalSlotGroups };
});
