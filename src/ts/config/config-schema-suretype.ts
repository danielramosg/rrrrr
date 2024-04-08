import { v, suretype } from 'suretype';
import { stockIds, parameterIds } from '../circular-economy-model';

const I18NStringSchema = suretype(
  { name: 'I18NStringConfig' },
  v.object({}).additional(v.string()),
);

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

const BasicSlotSchema = suretype(
  { name: 'BasicSlotConfig' },
  v
    .object({
      id: v.string().required(),
      x: v.number().required(),
      y: v.number().required(),
      angle: v.number().default(0),
    })
    .additional(false),
);

const SlotWithCardSchema = suretype(
  { name: 'SlotWithCardConfig' },
  v
    .object({
      id: v.string().required(),
      x: v.number().required(),
      y: v.number().required(),
      angle: v.number().default(0),
      card: v
        .object({
          x: v.number().required(),
          y: v.number().required(),
          angle: v.number().default(0),
        })
        .additional(false)
        .required(),
    })
    .additional(false),
);

const CardSchema = v
  .object({
    parameterTransformId: v.string().required(),
    url: v.string().required(),
    title: I18NStringSchema.required(),
    description: I18NStringSchema.required(),
  })
  .additional(false);

const ActionCardSchema = suretype({ name: 'ActionCardConfig' }, CardSchema);

const EventCardSchema = suretype({ name: 'EventCardConfig' }, CardSchema);

const SlotGroupIdSchema = v.string().matches(/^((?!internal).)*$/g);

const BasicSlotGroupSchema = suretype(
  { name: 'BasicSlotGroupConfig' },
  v
    .object({
      id: SlotGroupIdSchema.required(),
      type: v.string().enum('basic').required(),
      slots: v.array(BasicSlotSchema).required(),
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
      slots: v.array(SlotWithCardSchema).required(),
      cards: v.array(ActionCardSchema).required(),
    })
    .additional(false),
);

const EventCardSlotGroupSchema = suretype(
  { name: 'EventCardSlotGroupConfig' },
  v
    .object({
      id: SlotGroupIdSchema.required(),
      type: v.string().enum('event-card').required(),
      slots: v.array(SlotWithCardSchema).required(),
      cards: v.array(EventCardSchema).required(),
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

const POSITIONAL_ASSET_REGEX = /_x[0-9]+_y[0-9]+\.[a-zA-Z0-9]+$/g;
const TriggerConditionSchema = suretype(
  { name: 'TriggerConditionConfig' },
  v
    .object({
      condition: v.string().required(),
      url: v.string().matches(POSITIONAL_ASSET_REGEX).required(),
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
          slotActivationDelay: v.number().required(),
          slotDeactivationDelay: v.number().required(),
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
