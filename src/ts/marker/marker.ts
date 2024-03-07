import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

import { Circle } from '../util/geometry/circle';

export type MarkerEvents = {
  move: (marker: Marker) => void;
};

export class Marker {
  protected readonly _geometry: Circle;

  protected readonly _events: TypedEmitter<MarkerEvents>;

  constructor(circle: Circle) {
    this._geometry = circle.clone();
    this._events = new EventEmitter() as TypedEmitter<MarkerEvents>;
  }

  get geometry(): Readonly<Circle> {
    return this._geometry;
  }

  get events(): TypedEmitter<MarkerEvents> {
    return this._events;
  }

  move(x: number, y: number) {
    this._geometry.x = x;
    this._geometry.y = y;
    this.events.emit('move', this);
  }
}
