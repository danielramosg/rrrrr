import * as Rx from 'rxjs';
import type { Marker, MarkerObservables } from './marker-observables';

export class CombinedMarkerTracker implements MarkerObservables<Marker> {
  readonly markerAdd$: Rx.Observable<Marker>;

  readonly markerMove$: Rx.Observable<Marker>;

  readonly markerRemove$: Rx.Observable<Marker>;

  constructor(...trackers: MarkerObservables<Marker>[]) {
    this.markerAdd$ = Rx.merge(
      ...trackers.map(({ markerAdd$ }) => markerAdd$),
    ).pipe(Rx.share());
    this.markerMove$ = Rx.merge(
      ...trackers.map(({ markerMove$ }) => markerMove$),
    ).pipe(Rx.share());
    this.markerRemove$ = Rx.merge(
      ...trackers.map(({ markerRemove$ }) => markerRemove$),
    ).pipe(Rx.share());
  }
}
