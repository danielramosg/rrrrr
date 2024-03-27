import { isVarName } from '../util/is-var-name';

import {
  FunctionParameterTransform,
  type PararameterTransformFunction,
} from './function-parameter-transform';
import type { ModelElementIds, ModelElementObject } from '../model';

export class ScriptedParameterTransform<
  P extends ModelElementIds,
> extends FunctionParameterTransform<P> {
  public readonly script: string;

  constructor(i18nKey: string, parameterIds: P, script: string) {
    super(
      i18nKey,
      ScriptedParameterTransform.createFunction(parameterIds, script),
    );
    this.script = script;
  }

  static createFunction<P extends ModelElementIds>(
    parameterIds: P,
    script: string,
  ): PararameterTransformFunction<P> {
    parameterIds.forEach((parameterId) => {
      if (!isVarName(parameterId)) {
        throw new Error(
          `Parameter name '${parameterId}' can not be used as a variable`,
        );
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const wrappedScript = new Function(script).toString();

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const func = new Function(
      `{ ${parameterIds.join(', ')} }`,
      `(${wrappedScript})(); return { ${parameterIds.join(', ')} }`,
    ) as PararameterTransformFunction<P>;

    return <T extends ModelElementObject<P>>(parameters: T) => {
      const transformedParameters = func(parameters);
      Object.assign(parameters, transformedParameters);
      return parameters;
    };
  }
}
