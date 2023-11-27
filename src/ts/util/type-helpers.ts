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

export type { ConvertTupleToUnion, ConvertTupleToObject, ConvertTupleItemType };
