import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

import { Circle } from '../util/geometry/circle';
import { Marker } from './marker';

export type SlotEvents = {
  'activate': (slot: Slot, marker: Marker) => unknown;
  'deactivate': (slot: Slot, marker: Marker) => unknown;
  'marker-enter': (slot: Slot, marker: Marker) => unknown;
  'marker-leave': (slot: Slot, marker: Marker) => unknown;
};

export class Slot {
  protected readonly _geometry: Readonly<Circle>;

  protected readonly _trackedMarkers: Set<Marker> = new Set<Marker>();

  protected readonly _containedMarkers: Set<Marker> = new Set<Marker>();

  protected readonly _events: TypedEmitter<SlotEvents> =
    new EventEmitter() as TypedEmitter<SlotEvents>;

  protected markerMoveHandler: (marker: Marker) => void;

  constructor(circle: Circle) {
    this._geometry = circle.clone();
    this.markerMoveHandler = this.handleMarkerMove.bind(this);
  }

  get geometry(): Readonly<Circle> {
    return this._geometry;
  }

  get events(): TypedEmitter<SlotEvents> {
    return this._events;
  }

  track(marker: Marker): this {
    if (!this._trackedMarkers.has(marker)) {
      this._trackedMarkers.add(marker);
      marker.events.on('move', this.markerMoveHandler);
    }
    return this;
  }

  untrack(marker: Marker): this {
    if (this._trackedMarkers.has(marker)) {
      marker.events.off('move', this.markerMoveHandler);
      this._containedMarkers.delete(marker);
      this._trackedMarkers.delete(marker);
    }
    return this;
  }

  protected handleMarkerMove(marker: Marker) {
    if (this._geometry.containsCircle(marker.geometry)) {
      if (!this._containedMarkers.has(marker)) {
        this._containedMarkers.add(marker);
        this.events.emit('marker-enter', this, marker);
        if (this._containedMarkers.size === 1)
          this._events.emit('activate', this, marker);
      }
    } else if (this._containedMarkers.has(marker)) {
      this._containedMarkers.delete(marker);
      this.events.emit('marker-leave', this, marker);
      if (this._containedMarkers.size === 0)
        this._events.emit('deactivate', this, marker);
    }
  }

  get trackedMarkers(): Iterator<Marker> {
    return this._trackedMarkers.values();
  }

  isActive(): boolean {
    return this._containedMarkers.size > 0;
  }

  contains(marker: Marker): boolean {
    if (this._trackedMarkers.has(marker))
      return this._containedMarkers.has(marker);

    return this._geometry.containsCircle(marker.geometry);
  }
}
