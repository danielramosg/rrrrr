import * as Rx from 'rxjs';

import type { Marker, MarkerObservables } from './marker-observables';
import {
  Tuio11EventEmitter,
  type Tuio11Events,
} from '../tuio/tuio11-event-emitter';
import { Tuio11Object } from '../tuio/tuio_client_js';

export class TuioMarkerTracker implements MarkerObservables<Marker> {
  readonly markerAdd$: Rx.Observable<Marker>;

  readonly markerMove$: Rx.Observable<Marker>;

  readonly markerRemove$: Rx.Observable<Marker>;

  constructor(tuio11EventEmitter: Tuio11EventEmitter) {
    const tuioObjectAdd$ = Rx.fromEvent(
      tuio11EventEmitter,
      'tuio-object-add',
      (...[tuioObject]: Parameters<Tuio11Events['tuio-object-add']>) =>
        tuioObject,
    ).pipe(Rx.share());
    const tuioObjectUpdate$ = Rx.fromEvent(
      tuio11EventEmitter,
      'tuio-object-update',
      (...[tuioObject]: Parameters<Tuio11Events['tuio-object-update']>) =>
        tuioObject,
    ).pipe(Rx.share());
    const tuioObjectRemove$ = Rx.fromEvent(
      tuio11EventEmitter,
      'tuio-object-remove',
      (...[tuioObject]: Parameters<Tuio11Events['tuio-object-remove']>) =>
        tuioObject,
    ).pipe(Rx.share());

    const tuioObjectToMarker = Rx.map(
      ({ sessionId, xPos, yPos }: Tuio11Object) => ({
        id: TuioMarkerTracker.toId(sessionId),
        x: xPos,
        y: yPos,
      }),
    );

    this.markerAdd$ = tuioObjectAdd$.pipe(tuioObjectToMarker, Rx.share());
    this.markerMove$ = tuioObjectUpdate$.pipe(tuioObjectToMarker, Rx.share());
    this.markerRemove$ = tuioObjectRemove$.pipe(tuioObjectToMarker, Rx.share());
  }

  static toId(sessionId: number): string {
    return `tuio11_${sessionId}`;
  }
}
