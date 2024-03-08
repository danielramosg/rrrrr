// TODO: Implement TUIO 1.0 2Dobj lifecycle events

import type TypedEmitter from 'typed-emitter';
import { EventEmitter } from 'events';

import osc, { OscBundle, OscMessage } from './osc';
import * as TuioParser from './tuio-parser';
import type { TuioEvents } from './tuio-parser';

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
      case '/tuio/2Dobj': // TODO: Parse whole osc message via zod (maybe even the whole bundle)
        {
          const [command] = args;
          switch (command) {
            case 'set':
              try {
                const tuio2dObjSetTuple =
                  TuioParser.zTuio2dObjSetTuple.parse(args);
                const tuio2dObjSetRecord =
                  TuioParser.tuio2dObjSetTupleToRecord(tuio2dObjSetTuple);
                this.events.emit('/tuio/2Dobj', tuio2dObjSetRecord);
              } catch (err) {
                console.error(err);
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
