import { strict as assert } from 'assert';
import * as Rx from 'rxjs';
import type { Marker, MarkerObservables } from './marker-observables';

export class PointerMarkerTracker implements MarkerObservables<Marker> {
  readonly markerAdd$: Rx.Observable<Marker>;

  readonly markerMove$: Rx.Observable<Marker>;

  readonly markerRemove$: Rx.Observable<Marker>;

  constructor(
    element: HTMLElement,
    initialCoordinates: { x: number; y: number }[],
  ) {
    /**
     * Keep things simple for now:
     * - Immediately add fixed number of markers
     * - Markers can be moved by pointer events
     * - Markers are never removed
     */
    const markerAdd$ = new Rx.Subject<Marker>();
    const markerMove$ = new Rx.Subject<Marker>();
    const markerRemove$ = new Rx.Subject<Marker>();

    const markers = new Map<string, Marker>(
      initialCoordinates.map(({ x, y }, i) => [
        PointerMarkerTracker.toId(i),
        { id: PointerMarkerTracker.toId(i), x, y },
      ]),
    );

    Rx.from(markers.values()).pipe(Rx.delay(0)).subscribe(markerAdd$);

    const pointerToMarker = new Map<
      number,
      { markerId: string; offset: { x: number; y: number } }
    >();

    element.addEventListener('pointerdown', (event) => {
      if (event.target === null || !(event.target instanceof HTMLElement))
        return;

      const elementRect = element.getBoundingClientRect();

      const targetElement = event.target;
      const { markerId } = targetElement.dataset;
      if (markerId && markers.has(markerId)) {
        const marker = markers.get(markerId);
        assert(typeof marker !== 'undefined');
        const offset = {
          x: event.clientX - marker.x * elementRect.width,
          y: event.clientY - marker.y * elementRect.height,
        };
        pointerToMarker.set(event.pointerId, { markerId, offset });
        element.setPointerCapture(event.pointerId);
      }
    });

    element.addEventListener('pointermove', (event) => {
      if (pointerToMarker.has(event.pointerId)) {
        const marker = pointerToMarker.get(event.pointerId);
        assert(typeof marker !== 'undefined');

        const elementRect = element.getBoundingClientRect();

        const { markerId, offset } = marker;
        const updatedMarker = {
          id: markerId,
          x: (event.clientX - offset.x) / elementRect.width,
          y: (event.clientY - offset.y) / elementRect.height,
        };
        markers.set(markerId, updatedMarker);
        markerMove$.next(updatedMarker);
      }
    });

    const upOrCancelHandler = (event: PointerEvent) => {
      element.releasePointerCapture(event.pointerId);
      pointerToMarker.delete(event.pointerId);
    };
    element.addEventListener('pointerup', upOrCancelHandler);
    element.addEventListener('pointercancel', upOrCancelHandler);

    this.markerAdd$ = markerAdd$;
    this.markerMove$ = markerMove$;
    this.markerRemove$ = markerRemove$;
  }

  static toId(pointerId: number): string {
    return `pointer_${pointerId}`;
  }
}
