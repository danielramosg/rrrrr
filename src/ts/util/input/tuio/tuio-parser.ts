import Long from 'long';
import { z } from 'zod';

import osc, { OscColor, OscLong, OscTimeTag } from './osc';

export const zLong: z.ZodType<Long> = z.instanceof(Long);
export const zOscLong: z.ZodType<OscLong> = zLong.or(
  z.object({
    high: z.number(),
    low: z.number(),
    unsigned: z.literal(false),
  }),
);
export const zOscTimeTag: z.ZodType<OscTimeTag> = z.object({
  raw: z.tuple([z.number(), z.number()]),
  native: z.number(),
});
export const zOscColor: z.ZodType<OscColor> = z.object({
  r: z.number(),
  g: z.number(),
  b: z.number(),
  a: z.number(),
});

export const rawOrTyped = <T>(
  typed: z.ZodType<{ type: string; value: T }>,
): z.ZodType<T> =>
  // @ts-expect-error typed has a shape.value property, but z.ZodType does not expose it (?)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (typed.shape.value as z.ZodTypeAny).or(typed.transform(({ value }) => value));

export const zOscTypedArgumenti: z.ZodType<osc.OscTypedArgumenti> = z.object({
  type: z.literal('i'),
  value: z.number().int(),
});
export const zOscArgumenti = rawOrTyped(zOscTypedArgumenti);

export const zOscTypedArgumenth: z.ZodType<osc.OscTypedArgumenth> = z.object({
  type: z.literal('h'),
  value: zOscLong,
});
export const zOscArgumenth = rawOrTyped(zOscTypedArgumenth);

export const zOscTypedArgumentf: z.ZodType<osc.OscTypedArgumentf> = z.object({
  type: z.literal('f'),
  value: z.number(),
});
export const zOscArgumentf = rawOrTyped(zOscTypedArgumentf);

export const zOscTypedArguments: z.ZodType<osc.OscTypedArguments> = z.object({
  type: z.literal('s'),
  value: z.string(),
});
export const zOscArguments = rawOrTyped(zOscTypedArguments);

export const zOscTypedArgumentS: z.ZodType<osc.OscTypedArgumentS> = z.object({
  type: z.literal('S'),
  value: z.string(),
});
export const zOscArgumentS = rawOrTyped(zOscTypedArgumentS);

export const zOscTypedArgumentb: z.ZodType<osc.OscTypedArgumentb> = z.object({
  type: z.literal('b'),
  value: z.instanceof(Uint8Array),
});
export const zOscArgumentb = rawOrTyped(zOscTypedArgumentb);

export const zOscTypedArgumentt: z.ZodType<osc.OscTypedArgumentt> = z.object({
  type: z.literal('t'),
  value: zOscTimeTag,
});
export const zOscArgumentt = rawOrTyped(zOscTypedArgumentt);

export const zOscTypedArgumentT: z.ZodType<osc.OscTypedArgumentT> = z.object({
  type: z.literal('T'),
  value: z.literal(true),
});
export const zOscArgumentT = rawOrTyped(zOscTypedArgumentT);

export const zOscTypedArgumentF: z.ZodType<osc.OscTypedArgumentF> = z.object({
  type: z.literal('F'),
  value: z.literal(false),
});
export const zOscArgumentF = rawOrTyped(zOscTypedArgumentF);

export const zOscTypedArgumentN: z.ZodType<osc.OscTypedArgumentN> = z.object({
  type: z.literal('N'),
  value: z.null(),
});
export const zOscArgumentN = rawOrTyped(zOscTypedArgumentN);

export const zOscTypedArgumentI: z.ZodType<osc.OscTypedArgumentI> = z.object({
  type: z.literal('I'),
  value: z.literal(1.0),
});
export const zOscArgumentI = rawOrTyped(zOscTypedArgumentI);

export const zOscTypedArgumentd: z.ZodType<osc.OscTypedArgumentd> = z.object({
  type: z.literal('d'),
  value: z.number(),
});
export const zOscArgumentd = rawOrTyped(zOscTypedArgumentd);

export const zOscTypedArgumentc: z.ZodType<osc.OscTypedArgumentc> = z.object({
  type: z.literal('c'),
  value: z.string(),
});
export const zOscArgumentc = rawOrTyped(zOscTypedArgumentc);

export const zOscTypedArgumentr: z.ZodType<osc.OscTypedArgumentr> = z.object({
  type: z.literal('r'),
  value: zOscColor,
});
export const zOscArgumentr = rawOrTyped(zOscTypedArgumentr);

export const zOscTypedArgumentm: z.ZodType<osc.OscTypedArgumentm> = z.object({
  type: z.literal('m'),
  value: z.instanceof(Uint8Array),
});
export const zOscArgumentm = rawOrTyped(zOscTypedArgumentm);

export const zTuioAliveTuple = z.tuple([
  rawOrTyped(z.object({ type: z.literal('s'), value: z.literal('alive') })), // command,
  z.array(zOscTypedArgumenti),
]);
export type TuioAliveTuple = z.infer<typeof zTuioAliveTuple>;
export const tuioAliveTupleToRecord = (args: TuioAliveTuple) => {
  const [command, ids] = args;
  return { command, ids };
};
export type TuioAliveRecord = z.infer<typeof zTuioAliveTuple>;

export const zTuioSourceTuple = z.tuple([
  rawOrTyped(z.object({ type: z.literal('s'), value: z.literal('source') })), // command,
  z.string(),
]);
export type TuioSourceTuple = z.infer<typeof zTuioSourceTuple>;
export const tuioSourceTupleToRecord = (args: TuioSourceTuple) => {
  const [command, source] = args;
  return { command, source };
};
export type TuioSourceRecord = ReturnType<typeof tuioSourceTupleToRecord>;

export const zTuio2dObjSetTuple = z.tuple([
  rawOrTyped(z.object({ type: z.literal('s'), value: z.literal('set') })), // command
  zOscArgumenti, // s
  zOscArgumenti, // i
  zOscArgumentf, // x
  zOscArgumentf, // y
  zOscArgumentf, // a
  zOscArgumentf, // X
  zOscArgumentf, // Y
  zOscArgumentf, // A
  zOscArgumentf, // m
  zOscArgumentf, // r
]);

export type Tuio2dObjSetTuple = z.infer<typeof zTuio2dObjSetTuple>;

export const tuio2dObjSetTupleToRecord = (args: Tuio2dObjSetTuple) => {
  const [command, s, i, x, y, a, X, Y, A, m, r] = args;
  return { command, s, i, x, y, a, X, Y, A, m, r };
};

export type Tuio2dObjSetRecord = ReturnType<typeof tuio2dObjSetTupleToRecord>;

export const zTuioFSeqTuple = z.tuple([
  rawOrTyped(z.object({ type: z.literal('s'), value: z.literal('fseq') })), // command,
  zOscArgumenti, // fseq,
]);
export type TuioFSeqTuple = z.infer<typeof zTuioFSeqTuple>;
export const tuioFSeqTupleToRecord = (args: TuioFSeqTuple) => {
  const [command, fseq] = args;
  return { command, fseq };
};
export type TuioFSeqRecord = ReturnType<typeof tuioFSeqTupleToRecord>;

export type TuioEvents = {
  '/tuio/2Dobj': (params: Tuio2dObjSetRecord) => void;
};
