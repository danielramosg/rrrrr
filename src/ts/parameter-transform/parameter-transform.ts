import type { ModelElementIds, ModelElementObject } from '../model';

export abstract class ParameterTransform<P extends ModelElementIds> {
  public readonly i18nKey: string;

  protected constructor(i18nKey: string) {
    this.i18nKey = i18nKey;
  }

  abstract applyTo<T extends ModelElementObject<P>>(parameters: T): T;
}
