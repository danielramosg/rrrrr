import { ParameterTransform } from './parameter-transform';
import type { ModelElementIds, ModelElementObject } from '../model';

export type PararameterTransformFunction<P extends ModelElementIds> = <
  T extends ModelElementObject<P>,
>(
  parameters: T,
) => T;

export class FunctionParameterTransform<
  P extends ModelElementIds,
> extends ParameterTransform<P> {
  protected readonly callable: PararameterTransformFunction<P>;

  constructor(i18nKey: string, callable: PararameterTransformFunction<P>) {
    super(i18nKey);
    this.callable = callable;
  }

  applyTo<T extends ModelElementObject<P>>(parameters: T): T {
    this.callable(parameters);
    return parameters;
  }
}
