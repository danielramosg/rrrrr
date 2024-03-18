import * as Rx from 'rxjs';

export type Marker = { id: string; x: number; y: number };

export interface MarkerObservables<T extends Marker> {
  markerAdd$: Rx.Observable<T>;
  markerMove$: Rx.Observable<T>;
  markerRemove$: Rx.Observable<T>;
}
