import type TypedEmitter from 'typed-emitter';
import { EventEmitter } from 'events';

import osc, { OscMessage, OscBundle } from './osc';

export type Tuio2DObjSetParameters = {
  command: 'set';
  s: number;
  i: number;
  x: number;
  y: number;
  a: number;
  X: number;
  Y: number;
  A: number;
  m: number;
  r: number;
};

export type TuioEvents = {
  '/tuio/2Dobj': (params: Tuio2DObjSetParameters) => void;
};

function isOscMessage(obj: OscMessage | OscBundle): obj is OscMessage {
  return 'address' in obj;
}

export class Tuio {
  readonly oscPort: osc.WebSocketPort;

  readonly events: TypedEmitter<TuioEvents> =
    new EventEmitter() as TypedEmitter<TuioEvents>;

  constructor(oscPort: osc.WebSocketPort) {
    this.oscPort = oscPort;
    this.oscPort.on('bundle', this.processOscBundle.bind(this));
  }

  protected processOscMessage(message: OscMessage) {
    const { address, args } = message;
    switch (address) {
      case '/tuio/2Dobj':
        {
          const [command, ...rargs] = args;
          switch (command) {
            case 'set':
              {
                const [s, i, x, y, a, X, Y, A, m, r] = rargs;
                const params = {
                  command: 'set',
                  s,
                  i,
                  x,
                  y,
                  a,
                  X,
                  Y,
                  A,
                  m,
                  r,
                } as Tuio2DObjSetParameters; // FIXME: Use zod for typesafe parsing of TUIO messages?
                console.log(params);
                this.events.emit('/tuio/2Dobj', params);
              }
              break;
            default:
              break;
          }
        }
        break;
      default:
        break;
    }
  }

  protected processOscBundle(bundle: OscBundle) {
    console.log('bundle', bundle);
    bundle.packets.forEach((packet) => {
      if (isOscMessage(packet)) {
        this.processOscMessage(packet);
      } else {
        this.processOscBundle(packet);
      }
    });
  }
}
