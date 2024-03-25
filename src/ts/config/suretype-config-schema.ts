import { v, suretype } from 'suretype';
import { stockIds, parameterIds } from '../circular-economy-model';

const I18NStringSchema = suretype(
  { name: 'I18NString' },
  v.object({}).additional(v.string()),
);

const ParameterTransformSchema = suretype(
  { name: 'ParameterTransform' },
  v
    .object({ id: v.string().required(), script: v.string().required() })
    .additional(false)
    .required(),
);

const ParameterTransformsSchema = v.array(ParameterTransformSchema);

const InitialParametersSchema = suretype(
  { name: 'InitialParameters' },
  v
    .object(
      Object.fromEntries(parameterIds.map((p) => [p, v.number().required()])),
    )
    .additional(false),
);

const InitialStocksSchema = suretype(
  { name: 'InitialStocks' },
  v
    .object(Object.fromEntries(stockIds.map((p) => [p, v.number().required()])))
    .additional(false),
);

const BasicSlotSchema = suretype(
  { name: 'BasicSlot' },
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
  { name: 'SlotWithCard' },
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
    id: v.string().required(),
    url: v.string().required(),
    title: I18NStringSchema.required(),
    description: I18NStringSchema.required(),
  })
  .additional(false);

const ActionCardSchema = suretype({ name: 'ActionCard' }, CardSchema);

const EventCardSchema = suretype({ name: 'EventCard' }, CardSchema);

const BasicSlotGroupSchema = suretype(
  { name: 'BasicSlotGroup' },
  v
    .object({
      id: v.string().required(),
      type: v.string().enum('basic').required(),
      slots: v.array(BasicSlotSchema).required(),
      parameterTransformIds: v.array(v.string()).required(),
    })
    .additional(false),
);

const ActionCardSlotGroupSchema = suretype(
  { name: 'ActionCardSlotGroup' },
  v
    .object({
      id: v.string().required(),
      type: v.string().enum('action-card').required(),
      slots: v.array(SlotWithCardSchema).required(),
      cards: v.array(ActionCardSchema).required(),
    })
    .additional(false),
);

const EventCardSlotGroupSchema = suretype(
  { name: 'EventCardSlotGroup' },
  v
    .object({
      id: v.string().required(),
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

const CONFIG_SCHEMA_NAME = 'Config';

const ConfigSchema = suretype(
  { name: CONFIG_SCHEMA_NAME },
  v
    .object({
      general: v
        .object({ backgroundImage: v.string().required() })
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
    })
    .additional(false)
    .required(),
);

export { ConfigSchema as SuretypeConfigSchema, CONFIG_SCHEMA_NAME };
