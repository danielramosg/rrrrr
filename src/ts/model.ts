import {
  Stock,
  Flow,
  Variable,
  Parameter,
  LookupFunction,
  BoxModel,
} from '@imaginary-maths/box-model';

const stocks: Stock[] = [
  {
    id: 'manufacturer',
    in: ['natural resources', 'recycle'],
    out: ['selling'],
  },
  {
    id: 'first hand',
    in: ['selling', 'refurbish'],
    out: ['abandon-first-hand', 'break-first-hand'],
  },
  {
    id: 'second hand',
    in: ['repair', 'reuse'],
    out: ['abandon-second-hand', 'break-second-hand'],
  },
  {
    id: 'hibernating',
    in: ['abandon-first-hand', 'abandon-second-hand'],
    out: ['dispose-hibernating', 'refurbish'],
  },
  {
    id: 'broken',
    in: ['break-first-hand', 'break-second-hand'],
    out: ['dispose-broken', 'repair'],
  },
  {
    id: 'landfill',
    in: ['dispose-hibernating', 'dispose-broken'],
    out: [],
  },
];

const flows: Flow[] = [
  {
    id: 'abandon-first-hand',
    formula: ({ p, s }: { p: LookupFunction; s: LookupFunction }): number =>
      p('abandon rate') * s('first hand'),
  },
  {
    id: 'abandon-second-hand',
    formula: ({ p, s }: { p: LookupFunction; s: LookupFunction }): number =>
      p('abandon rate') * s('second hand'),
  },
  {
    id: 'break-first-hand',
    formula: ({ p, s }: { p: LookupFunction; s: LookupFunction }): number =>
      p('break rate') * s('first hand'),
  },
  {
    id: 'break-second-hand',
    formula: ({ p, s }: { p: LookupFunction; s: LookupFunction }): number =>
      p('break rate') * s('second hand'),
  },
  {
    id: 'dispose-broken',
    formula: ({ s }: { s: LookupFunction }): number => 0.4 * s('broken'),
  },
  {
    id: 'dispose-hibernating',
    formula: ({ s }: { s: LookupFunction }): number => 0.4 * s('hibernating'),
  },
  { id: 'natural resources', formula: () => 0.0 },
  {
    id: 'recycle',
    formula: ({ p, s }: { p: LookupFunction; s: LookupFunction }): number =>
      p('recycle rate') * s('broken'),
  },
  {
    id: 'refurbish',
    formula: ({ p, s }: { p: LookupFunction; s: LookupFunction }): number =>
      p('refurbish rate') * s('hibernating'),
  },
  {
    id: 'repair',
    formula: ({
      p,
      s,
      v,
    }: {
      p: LookupFunction;
      s: LookupFunction;
      v: LookupFunction;
    }): number =>
      Math.min(v('second hand demand') - s('second hand'), s('broken')) *
      p('repair rate'),
  },
  {
    id: 'reuse',
    formula: ({
      p,
      s,
      v,
    }: {
      p: LookupFunction;
      s: LookupFunction;
      v: LookupFunction;
    }): number =>
      Math.min(v('second hand demand') - s('second hand'), s('hibernating')) *
      p('reuse rate'),
  },
  {
    id: 'selling',
    formula: ({ v, s }: { v: LookupFunction; s: LookupFunction }): number =>
      v('first hand demand') - s('first hand'),
  },
];

const variables: Variable[] = [
  {
    id: 'first hand demand',
    formula: ({ p }: { p: LookupFunction }): number =>
      p('global demand') * p('first hand preference'),
  },
  {
    id: 'second hand demand',
    formula: ({ p, v }: { p: LookupFunction; v: LookupFunction }): number =>
      p('global demand') - v('first hand demand'),
  },
  {
    id: 'number of items',
    formula: ({ s }: { s: LookupFunction }): number =>
      s('first hand') + s('second hand'),
  },
];

const parameters: Parameter[] = [
  {
    id: 'first hand preference',
    value: 0.52,
  },
  {
    id: 'global demand',
    value: 1000000,
  },
  {
    id: 'abandon rate',
    value: 0.0,
  },
  {
    id: 'break rate',
    value: 0.25,
  },
  {
    id: 'repair rate',
    value: 1.0,
  },
  {
    id: 'reuse rate',
    value: 1.0,
  },
  {
    id: 'refurbish rate',
    value: 1.0,
  },
  {
    id: 'recycle rate',
    value: 0.0,
  },
];

const model: BoxModel = {
  stocks,
  flows,
  variables,
  parameters,
};

export default model;
