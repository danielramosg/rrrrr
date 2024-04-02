import type { DeepReadonly } from 'ts-essentials';

import { ref, type Ref } from 'vue';

import type {
  SlotGroupConfig,
  BasicSlotGroupConfig,
  ActionCardSlotGroupConfig,
  EventCardSlotGroupConfig,
} from '../config/config-schema';

import { exhaustiveGuard } from '../util/type-helpers';

export interface ParameterTransformState {
  id: string;
  active: Ref<boolean>;
}

export interface SlotGroupParameterTransformsState {
  id: string;
  parameterTransforms: ParameterTransformState[];
}

function useParameterTransformId(id: string): ParameterTransformState {
  const active = ref(false);
  return { id, active };
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
