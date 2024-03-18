import { strict as assert } from 'assert';
import * as Rx from 'rxjs';

import { Tuio11EventEmitter } from './util/input/tuio/tuio11-event-emitter';
import {
  WebsocketTuioReceiver,
  Tuio11Client,
} from './util/input/tuio/tuio_client_js';

import { documentReady } from './util/document-ready';
import { guardedQuerySelector } from './util/guarded-query-selectors';
import { Circle } from './util/geometry/circle';
import {
  type Marker,
  type MarkerObservables,
} from './util/input/marker-tracking/marker-observables';
import { TuioMarkerTracker } from './util/input/marker-tracking/tuio-marker-tracker';
import { PointerMarkerTracker } from './util/input/marker-tracking/pointer-marker-tracker';
import { CombinedMarkerTracker } from './util/input/marker-tracking/combined-marker-tracker';

const NUM_POINTER_MARKERS = 8;
const POINTER_MARKER_COORDINATES = new Array(NUM_POINTER_MARKERS)
  .fill(0)
  .map(() => ({ x: 0, y: 0 }));

const MARKER_CIRCLE_DIAMETER = 128;

const SLOT_DEFINITIONS = [
  { id: 'slot-1', x: 0, y: 0 },
  { id: 'slot-2', x: 1920 / 2, y: 1080 / 2 },
  { id: 'slot-3', x: 1920 - 100, y: 1080 - 100 },
];
const SLOT_CIRCLE_DIAMETER = 160;

type Slot = { id: string; activeShape: Circle };

const SLOTS: Slot[] = SLOT_DEFINITIONS.map(({ id, x, y }) => ({
  id,
  activeShape: new Circle(x, y, SLOT_CIRCLE_DIAMETER / 2.0),
}));

type SlotIdAndMarkerId = { slotId: string; markerId: string };
type SlotObservables = {
  slotActivate$: Rx.Observable<SlotIdAndMarkerId>;
  slotDeactivate$: Rx.Observable<SlotIdAndMarkerId>;
  slotMarkerEnter$: Rx.Observable<SlotIdAndMarkerId>;
  slotMarkerLeave$: Rx.Observable<SlotIdAndMarkerId>;
};

function setupMarkerTracking(
  element: HTMLElement,
  tuio11EventEmitter: Tuio11EventEmitter,
): MarkerObservables<Marker> {
  const pointerMarkerTracking = new PointerMarkerTracker(
    element,
    POINTER_MARKER_COORDINATES,
  );
  const tuioMarkerTracking = new TuioMarkerTracker(tuio11EventEmitter);

  return new CombinedMarkerTracker(pointerMarkerTracking, tuioMarkerTracking);
}

function setupSlotTracking({
  markerAdd$,
  markerMove$,
  markerRemove$,
}: MarkerObservables<Marker>): SlotObservables {
  const slotActivate$ = new Rx.Subject<SlotIdAndMarkerId>();
  const slotDeactivate$ = new Rx.Subject<SlotIdAndMarkerId>();
  const slotMarkerEnter$ = new Rx.Subject<SlotIdAndMarkerId>();
  const slotMarkerLeave$ = new Rx.Subject<SlotIdAndMarkerId>();

  const markersForSlots = new Map<string, Set<string>>(
    SLOTS.map(({ id }) => [id, new Set<string>()]),
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
    SLOTS.forEach((slot) => {
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
            x: 1920 * movedMarker.x,
            y: 1080 * movedMarker.y,
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

  return {
    slotMarkerEnter$,
    slotMarkerLeave$,
    slotActivate$,
    slotDeactivate$,
  };
}

function setupUi(
  { markerAdd$, markerMove$, markerRemove$ }: MarkerObservables<Marker>,
  {
    slotMarkerEnter$,
    slotMarkerLeave$,
    slotDeactivate$,
    slotActivate$,
  }: SlotObservables,
) {
  const panel = guardedQuerySelector(HTMLDivElement, '#panel');
  SLOTS.forEach(({ id, activeShape }) => {
    const element = document.createElement('div');
    element.classList.add('slot');
    element.dataset.slotId = id;
    element.style.width = `${SLOT_CIRCLE_DIAMETER}px`;
    element.style.height = `${SLOT_CIRCLE_DIAMETER}px`;
    element.style.left = `${activeShape.x}px`;
    element.style.top = `${activeShape.y}px`;

    panel.append(element);
  });

  markerAdd$.subscribe((addedMarker) => {
    const { id: markerId } = addedMarker;

    const element = document.createElement('div');
    element.classList.add('marker');
    element.dataset.markerId = markerId;
    element.style.width = `${MARKER_CIRCLE_DIAMETER}px`;
    element.style.height = `${MARKER_CIRCLE_DIAMETER}px`;

    panel.append(element);

    const idElement = document.createElement('div');
    idElement.innerText = markerId;
    element.append(idElement);

    const filterMarkerId = Rx.filter(({ id }: Marker) => id === markerId);
    const thisMarkerMove$ = markerMove$.pipe(
      filterMarkerId,
      Rx.takeUntil(markerRemove$.pipe(filterMarkerId)),
      Rx.startWith(addedMarker),
      Rx.share(),
    );

    const enteredSlots = new Set<string>();
    const filterSlotAndMarkerId = Rx.filter(
      ({ markerId: otherMarkerId }: SlotIdAndMarkerId) =>
        otherMarkerId === markerId,
    );
    const slotEnterSubscription = slotMarkerEnter$

      .pipe(filterSlotAndMarkerId)
      .subscribe(({ slotId }) => {
        enteredSlots.add(slotId);
        if (enteredSlots.size === 1) element.classList.add('active');
      });
    const slotLeaveSubscription = slotMarkerLeave$
      .pipe(filterSlotAndMarkerId)
      .subscribe(({ slotId }) => {
        enteredSlots.delete(slotId);
        if (enteredSlots.size === 0) element.classList.remove('active');
      });

    thisMarkerMove$.subscribe({
      next: (movedMarker) => {
        const { x, y } = movedMarker;
        element.style.left = `${1920 * x}px`; // FIXME: depends on game board size
        element.style.top = `${1080 * y}px`; // FIXME: depends on game board size
      },
      complete: () => {
        element.remove();
        slotEnterSubscription.unsubscribe();
        slotLeaveSubscription.unsubscribe();
      },
    });
  });

  slotActivate$.subscribe(({ slotId }) => {
    const slotElement = guardedQuerySelector(
      HTMLElement,
      `.slot[data-slot-id="${slotId}"]`,
    );
    slotElement.classList.add('active');
  });

  slotDeactivate$.subscribe(({ slotId }) => {
    const slotElement = guardedQuerySelector(
      HTMLElement,
      `.slot[data-slot-id="${slotId}"]`,
    );
    slotElement.classList.remove('active');
  });
}

function main(): void {
  const panel = guardedQuerySelector(HTMLDivElement, '#panel');

  const tuio11EventEmitter = new Tuio11EventEmitter();
  const markerObservables = setupMarkerTracking(panel, tuio11EventEmitter);
  const slotObservables = setupSlotTracking(markerObservables);
  setupUi(markerObservables, slotObservables);

  const WEBSOCKET_URL = 'ws://localhost:3339'; // local
  // const WEBSOCKET_URL = 'ws://10.0.0.20:3333'; // InteractiveScape ScapeX
  const client = new Tuio11Client(new WebsocketTuioReceiver(WEBSOCKET_URL));

  client.addTuioListener(tuio11EventEmitter);
  client.connect();
}

documentReady()
  .then(main)
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  });
