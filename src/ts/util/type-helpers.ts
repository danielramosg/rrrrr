type ConvertTupleToUnion<T extends readonly unknown[]> = [...T][number];

type ConvertTupleToObject<
  T extends readonly (string | number | symbol)[],
  V,
> = {
  [P in ConvertTupleToUnion<T>]: V;
};

type ConvertTupleItemType<T extends readonly unknown[], V> = [
  ...{
    -readonly [P in keyof T]: V;
  },
];

type SafeResult<SuccessType, ErrorType> =
  | { success: true; data: SuccessType }
  | { success: false; error: ErrorType };

type Callable<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : never;

function makeSafe<T extends Array<unknown>, U>(
  f: (...args: T) => U,
): (...args: T) => SafeResult<U, unknown> {
  return (...args): SafeResult<U, unknown> => {
    try {
      return { success: true, data: f(...args) };
    } catch (error) {
      return { success: false, error };
    }
  };
}

function makeSafeAsync<T extends Array<unknown>, U>(
  f: (...args: T) => Promise<U>,
): (...args: T) => Promise<SafeResult<U, unknown>> {
  return async (...args: T): Promise<SafeResult<U, unknown>> => {
    try {
      return { success: true, data: await f(...args) };
    } catch (error) {
      return { success: false, error };
    }
  };
}

export type {
  ConvertTupleToUnion,
  ConvertTupleToObject,
  ConvertTupleItemType,
  SafeResult,
  Callable,
};

export { makeSafe, makeSafeAsync };
