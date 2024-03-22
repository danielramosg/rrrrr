import { v, suretype } from 'suretype';
import { stockIds, parameterIds } from '../circular-economy-model';

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

const CONFIG_SCHEMA_NAME = 'Config';

const ConfigSchema = suretype(
  { name: CONFIG_SCHEMA_NAME },
  v
    .object({
      parameterTransforms: ParameterTransformsSchema.required(),
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
    })
    .additional(false)
    .required(),
);

export { ConfigSchema as SuretypeConfigSchema, CONFIG_SCHEMA_NAME };
