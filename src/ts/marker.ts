/* eslint-disable no-console */
import { strict as assert } from 'assert';
import * as Rx from 'rxjs';

import {
  Tuio11EventEmitter,
  type Tuio11Events,
} from './util/input/tuio/tuio11-event-emitter';
import {
  WebsocketTuioReceiver,
  Tuio11Client,
  Tuio11Object,
} from './util/input/tuio/tuio_client_js';

import { documentReady } from './util/document-ready';
import { guardedQuerySelector } from './util/guarded-query-selectors';
import { Circle } from './util/geometry/circle';

const MARKER_CIRCLE_DIAMETER = 128;
const SLOT_DEFINITIONS = [
  { id: 'slot-1', x: 0, y: 0 },
  { id: 'slot-2', x: 1920 / 2, y: 1080 / 2 },
  { id: 'slot-3', x: 1920 - 100, y: 1080 - 100 },
];
const SLOT_CIRCLE_DIAMETER = 160;

type Slot = { id: string; activeShape: Circle };
type Marker = { id: string; activeShape: Circle };

const SLOTS: Slot[] = SLOT_DEFINITIONS.map(({ id, x, y }) => ({
  id,
  activeShape: new Circle(x, y, SLOT_CIRCLE_DIAMETER / 2.0),
}));

function tuio11Id(symbolId: number) {
  return `tuio11_${symbolId}`;
}

type MarkerObservables = {
  markerAdd$: Rx.Observable<Marker>;
  markerMove$: Rx.Observable<Marker>;
  markerRemove$: Rx.Observable<Marker>;
};

type SlotIdAndMarkerId = { slotId: string; markerId: string };
type SlotObservables = {
  slotActivate$: Rx.Observable<SlotIdAndMarkerId>;
  slotDeactivate$: Rx.Observable<SlotIdAndMarkerId>;
  slotMarkerEnter$: Rx.Observable<SlotIdAndMarkerId>;
  slotMarkerLeave$: Rx.Observable<SlotIdAndMarkerId>;
};

function setupMarkerTracking(
  tuio11EventEmitter: Tuio11EventEmitter,
): MarkerObservables {
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
      id: tuio11Id(sessionId),
      activeShape: new Circle(
        1920 * xPos,
        1080 * yPos,
        MARKER_CIRCLE_DIAMETER / 2,
      ),
    }),
  );

  const markerAdd$ = tuioObjectAdd$.pipe(tuioObjectToMarker, Rx.share());
  const markerMove$ = tuioObjectUpdate$.pipe(tuioObjectToMarker, Rx.share());
  const markerRemove$ = tuioObjectRemove$.pipe(tuioObjectToMarker, Rx.share());

  return {
    markerAdd$,
    markerMove$,
    markerRemove$,
  };
}

function setupSlotTracking({
  markerAdd$,
  markerMove$,
  markerRemove$,
}: MarkerObservables): SlotObservables {
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
          const contained = slot.activeShape.containsPoint(
            movedMarker.activeShape,
          );
          const registered = markersForSlot.has(markerId);
          console.log(markerAndSlotId, movedMarker);
          if (contained && !registered) {
            // enter
            console.log('enter', markerAndSlotId);
            markersForSlot.add(markerId);
            slotMarkerEnter$.next(markerAndSlotId);
            if (markersForSlot.size === 1) {
              // activate
              console.log('activate', markerAndSlotId);
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
  { markerAdd$, markerMove$, markerRemove$ }: MarkerObservables,
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

      .pipe(
        Rx.tap((...args) =>
          console.log('slot-marker-enter-5', markerId, ...args),
        ),
        filterSlotAndMarkerId,
        Rx.tap((...args) =>
          console.log('slot-marker-enter-6', markerId, ...args),
        ),
      )
      .subscribe(({ slotId }) => {
        enteredSlots.add(slotId);
        console.log('slot-marker-enter-5', slotId, markerId, enteredSlots);
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
        const { x, y } = movedMarker.activeShape;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
      },
      complete: () => {
        element.remove();
        slotEnterSubscription.unsubscribe();
        slotLeaveSubscription.unsubscribe();
      },
    });
  });

  slotMarkerEnter$.subscribe((slotAndMarkerId) =>
    console.log('slot-marker-enter-4', slotAndMarkerId),
  );

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
  const tuio11EventEmitter = new Tuio11EventEmitter();
  const markerObservables = setupMarkerTracking(tuio11EventEmitter);
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
  .catch((err) => console.error(err));
