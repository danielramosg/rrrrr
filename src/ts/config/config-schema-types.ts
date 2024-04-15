import type {
  BasicSlotConfig,
  SlotWithCardConfig,
  ActionCardSlotGroupConfig,
  ActionCardConfig,
  EventCardConfig,
  BasicSlotGroupConfig,
  EventCardSlotGroupConfig,
} from './config-schema-types.generated';

export type SlotConfig = BasicSlotConfig | SlotWithCardConfig;

export type CardConfig = ActionCardConfig | EventCardConfig;

export type SlotGroupConfig =
  | BasicSlotGroupConfig
  | ActionCardSlotGroupConfig
  | EventCardSlotGroupConfig;

export * from './config-schema-types.generated';
