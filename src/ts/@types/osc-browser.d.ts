declare module 'osc/dist/osc-browser' {
  import type TypedEmitter from 'typed-emitter';
  import type Long from 'long';
  import { EventEmitter } from 'events';

  export type OscLong =
    | Long
    | {
        high: number;
        low: number;
        unsigned: false;
      };

  export type OscTimeTag = {
    raw: [
      number, // seconds since January 1, 1900.
      number, // fractions of a second
    ];
    native: number;
  };

  export type OscColor = {
    r: number;
    g: number;
    b: number;
    a: number;
  };

  export type OscRawArgument = string | number;

  export type OscTypedArgumenti = { type: 'i'; value: number };
  export type OscTypedArgumenth = { type: 'h'; value: OscLong };
  export type OscTypedArgumentf = { type: 'f'; value: number };
  export type OscTypedArguments = { type: 's'; value: string };
  export type OscTypedArgumentS = { type: 'S'; value: string };
  export type OscTypedArgumentb = { type: 'b'; value: Uint8Array };
  export type OscTypedArgumentt = { type: 't'; value: OscTimeTag };
  export type OscTypedArgumentT = { type: 'T'; value: true };
  export type OscTypedArgumentF = { type: 'F'; value: false };
  export type OscTypedArgumentN = { type: 'N'; value: null };
  export type OscTypedArgumentI = { type: 'I'; value: 1.0 };
  export type OscTypedArgumentd = { type: 'd'; value: number };
  export type OscTypedArgumentc = { type: 'c'; value: string };
  export type OscTypedArgumentr = { type: 'r'; value: OscColor };
  export type OscTypedArgumentm = { type: 'm'; value: Uint8Array };

  export type OscTypedArgument =
    | OscTypedArgumenti
    | OscTypedArgumenth
    | OscTypedArgumentf
    | OscTypedArguments
    | OscTypedArgumentS
    | OscTypedArgumentb
    | OscTypedArgumentt
    | OscTypedArgumentT
    | OscTypedArgumentF
    | OscTypedArgumentN
    | OscTypedArgumentI
    | OscTypedArgumentd
    | OscTypedArgumentc
    | OscTypedArgumentr
    | OscTypedArgumentm;

  export type OscMessage = {
    address: string;
    args: (OscRawArgument | OscTypedArgument)[];
  };

  export type OscPacket = OscMessage | OscBundle;

  export type OscBundle = {
    packets: OscPacket[];
    timeTag: OscTimeTag;
  };

  export type OscEvents = {
    ready: () => void;
    message: (
      message: OscMessage,
      timeTag: OscTimeTag | undefined,
      info: unknown,
    ) => void;
    bundle: (bundle: OscBundle, timeTag: OscTimeTag, info: unknown) => void;
    osc: (packet: OscPacket, info: unknown) => void;
    raw: (data: Uint8Array, info: unknown) => void;
    error: (error: Error) => void;
  };

  export class WebSocketPort extends (EventEmitter as new () => TypedEmitter<OscEvents>) {
    constructor(options: { url: string });
    open(): void;
  }
}
