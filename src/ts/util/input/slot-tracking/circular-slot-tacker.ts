import * as Rx from 'rxjs';
import { strict as assert } from 'assert';

import type {
  Marker,
  MarkerObservables,
} from '../marker-tracking/marker-observables';
import type { SlotIdAndMarkerId, SlotObservables } from './slot-observables';
import { Circle } from '../../geometry/circle';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../../../builtin-config';

export type CircularSlot = { id: string; activeShape: Circle };

export class CircularSlotTracker implements SlotObservables {
  slotActivate$: Rx.Observable<SlotIdAndMarkerId>;

  slotDeactivate$: Rx.Observable<SlotIdAndMarkerId>;

  slotMarkerEnter$: Rx.Observable<SlotIdAndMarkerId>;

  slotMarkerLeave$: Rx.Observable<SlotIdAndMarkerId>;

  constructor(
    slots: CircularSlot[],
    { markerAdd$, markerMove$, markerRemove$ }: MarkerObservables<Marker>,
  ) {
    const slotActivate$ = new Rx.Subject<SlotIdAndMarkerId>();
    const slotDeactivate$ = new Rx.Subject<SlotIdAndMarkerId>();
    const slotMarkerEnter$ = new Rx.Subject<SlotIdAndMarkerId>();
    const slotMarkerLeave$ = new Rx.Subject<SlotIdAndMarkerId>();

    const markersForSlots = new Map<string, Set<string>>(
      slots.map(({ id }) => [id, new Set<string>()]),
    );

    markerAdd$.pipe(Rx.delay(0)).subscribe((addedMarker) => {
      const { id: markerId } = addedMarker;

      const filterMarkerId = Rx.filter(({ id }: Marker) => id === markerId);
      const thisMarkerMove$ = Rx.concat(
        Rx.from([addedMarker]),
        markerMove$.pipe(
          filterMarkerId,
          Rx.takeUntil(markerRemove$.pipe(filterMarkerId)),
        ),
      ).pipe(Rx.shareReplay({ bufferSize: 1, refCount: true }));
      slots.forEach((slot) => {
        const { id: slotId } = slot;
        const markerAndSlotId = {
          markerId,
          slotId,
        };
        const markersForSlot = markersForSlots.get(slotId);
        assert(typeof markersForSlot !== 'undefined');

        thisMarkerMove$.subscribe({
          next: (movedMarker) => {
            const localMarkerCoords = {
              x: BOARD_WIDTH * movedMarker.x,
              y: BOARD_HEIGHT * movedMarker.y,
            }; // FIXME: depends on game board size
            const contained = slot.activeShape.containsPoint(localMarkerCoords);
            const registered = markersForSlot.has(markerId);
            if (contained && !registered) {
              // enter
              markersForSlot.add(markerId);
              slotMarkerEnter$.next(markerAndSlotId);
              if (markersForSlot.size === 1) {
                // activate
                slotActivate$.next(markerAndSlotId);
              }
            } else if (!contained && registered) {
              // leave
              markersForSlot.delete(markerId);
              slotMarkerLeave$.next(markerAndSlotId);
              if (markersForSlot.size === 0) {
                // deactivate
                slotDeactivate$.next(markerAndSlotId);
              }
            }
          },
          complete: () => {
            if (markersForSlot.has(markerId)) {
              // leave
              markersForSlot.delete(markerId);
              slotMarkerLeave$.next(markerAndSlotId);
              if (markersForSlot.size === 0) {
                // deactivate
                slotDeactivate$.next(markerAndSlotId);
              }
            }
          },
        });
      });
    });

    this.slotMarkerEnter$ = slotMarkerEnter$;
    this.slotMarkerLeave$ = slotMarkerLeave$;
    this.slotActivate$ = slotActivate$;
    this.slotDeactivate$ = slotDeactivate$;
  }
}
