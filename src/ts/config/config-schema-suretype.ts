import { v, suretype } from 'suretype';
import { stockIds, parameterIds } from '../circular-economy-model';

const POSITIONAL_ASSET_REGEX = /_x[+-]?[0-9]+_y[+-]?[0-9]+\.[a-zA-Z0-9]+$/g;
const AssetUrlSchema = v.string().matches(POSITIONAL_ASSET_REGEX);

const ParameterTransformSchema = suretype(
  { name: 'ParameterTransformConfig' },
  v
    .object({ id: v.string().required(), script: v.string().required() })
    .additional(false)
    .required(),
);

const ParameterTransformsSchema = v.array(ParameterTransformSchema);

const InitialParametersSchema = suretype(
  { name: 'InitialParametersConfig' },
  v
    .object(
      Object.fromEntries(parameterIds.map((p) => [p, v.number().required()])),
    )
    .additional(false),
);

const InitialStocksSchema = suretype(
  { name: 'InitialStocksConfig' },
  v
    .object(Object.fromEntries(stockIds.map((p) => [p, v.number().required()])))
    .additional(false),
);

const MarkerSlotSchema = suretype(
  { name: 'MarkerSlotConfig' },
  v
    .object({
      id: v.string().required(),
      x: v.number().required(),
      y: v.number().required(),
      angle: v.number().default(0),
    })
    .additional(false),
);

const CardSlotSchema = suretype(
  { name: 'CardSlotConfig' },
  v
    .object({
      id: v.string().required(),
      x: v.number().required(),
      y: v.number().required(),
      angle: v.number().default(0).required(),
    })
    .additional(false),
);

const CardSchema = suretype(
  { name: 'CardConfig' },
  v
    .object({
      parameterTransformId: v.string().required(),
      url: AssetUrlSchema.required(),
    })
    .additional(false),
);

const SlotGroupIdSchema = v.string().matches(/^((?!internal).)*$/g);

const BasicSlotGroupSchema = suretype(
  { name: 'BasicSlotGroupConfig' },
  v
    .object({
      id: SlotGroupIdSchema.required(),
      type: v.string().enum('basic').required(),
      slots: v.array(MarkerSlotSchema).required(),
      parameterTransformIds: v.array(v.string()).required(),
    })
    .additional(false),
);

const ActionCardSlotGroupSchema = suretype(
  { name: 'ActionCardSlotGroupConfig' },
  v
    .object({
      id: SlotGroupIdSchema.required(),
      type: v.string().enum('action-card').required(),
      slots: v
        .array(
          v
            .object({
              markerSlot: MarkerSlotSchema.required(),
              cardSlot: CardSlotSchema.required(),
            })
            .additional(false),
        )
        .required(),
      cards: v.array(CardSchema).required(),
    })
    .additional(false),
);

const EventCardSlotGroupSchema = suretype(
  { name: 'EventCardSlotGroupConfig' },
  v
    .object({
      id: SlotGroupIdSchema.required(),
      minDelayMs: v.number().gte(0).required(),
      maxDelayMs: v.number().gte(0).required(),
      minDurationMs: v.number().gte(0).required(),
      maxDurationMs: v.number().gte(0).required(),
      type: v.string().enum('event-card').required(),
      markerSlot: MarkerSlotSchema.required(),
      cardSlots: v.array(CardSlotSchema).required(),
      cards: v.array(CardSchema).required(),
    })
    .additional(false),
);

const SlotGroupSchema = suretype(
  { name: 'SlotGroup' },
  v.anyOf([
    BasicSlotGroupSchema,
    ActionCardSlotGroupSchema,
    EventCardSlotGroupSchema,
  ]),
);

const TriggerConditionSchema = suretype(
  { name: 'TriggerConditionConfig' },
  v
    .object({
      condition: v.string().required(),
      url: AssetUrlSchema.required(),
    })
    .additional(false)
    .required(),
);

const TriggerSchema = suretype(
  { name: 'TriggerConfig' },
  v
    .object({
      id: v.string().required(),
      events: v.array(TriggerConditionSchema).required(),
    })
    .additional(false)
    .required(),
);

const CONFIG_SCHEMA_NAME = 'Config';

const ConfigSchema = suretype(
  { name: CONFIG_SCHEMA_NAME },
  v
    .object({
      general: v
        .object({ assetBaseDir: v.string().required() })
        .additional(false)
        .required(),
      model: v
        .object({
          initialParameters: InitialParametersSchema.required(),
          initialStocks: InitialStocksSchema.required(),
        })
        .additional(false)
        .required(),
      simulation: v
        .object({
          deltaPerSecond: v.number().required(),
          maxStepSize: v.number().required(),
        })
        .additional(false)
        .required(),
      parameterTransforms: ParameterTransformsSchema.required(),
      interaction: v
        .object({
          actionCardDelayMs: v.number().gte(0).required(),
          slotGroups: v.array(SlotGroupSchema).required(),
        })
        .additional(false)
        .required(),
      triggers: v.array(TriggerSchema).required(),
    })
    .additional(false)
    .required(),
);

export { ConfigSchema as SuretypeConfigSchema, CONFIG_SCHEMA_NAME };
