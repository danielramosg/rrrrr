import * as Rx from 'rxjs';

import { Tuio11EventEmitter } from './util/input/tuio/tuio11-event-emitter';
import {
  WebsocketTuioReceiver,
  Tuio11Client,
} from './util/input/tuio/tuio_client_js';

import { guardedQuerySelector } from './util/guarded-query-selectors';
import { Circle } from './util/geometry/circle';
import {
  type Marker,
  type MarkerObservables,
} from './util/input/marker-tracking/marker-observables';
import { TuioMarkerTracker } from './util/input/marker-tracking/tuio-marker-tracker';
import { PointerMarkerTracker } from './util/input/marker-tracking/pointer-marker-tracker';
import { CombinedMarkerTracker } from './util/input/marker-tracking/combined-marker-tracker';
import {
  SlotIdAndMarkerId,
  SlotObservables,
} from './util/input/slot-tracking/slot-observables';
import {
  CircularSlot,
  CircularSlotTracker,
} from './util/input/slot-tracking/circular-slot-tacker';

const NUM_POINTER_MARKERS = 8;
const POINTER_MARKER_COORDINATES = new Array(NUM_POINTER_MARKERS)
  .fill(0)
  .map(() => ({ x: 0, y: 0 }));

const BOARD_WIDTH = 1920;
const BOARD_HEIGHT = 1080;
const BOARD_WIDTH_MM = 1209.6;
const MARKER_DIAMETER_MM = 74.3;
const MARKER_CIRCLE_DIAMETER =
  (BOARD_WIDTH * MARKER_DIAMETER_MM) / BOARD_WIDTH_MM;

const SLOT_DEFINITIONS = [
  { id: 'manufacturer-1', x: 94.35, y: 659.11 },
  { id: 'manufacturer-2', x: 94.35, y: 532.9 },
  { id: 'manufacturer-3', x: 94.35, y: 405.4 },
  { id: 'government-1', x: 684.3, y: 1004.2 },
  { id: 'government-2', x: 812.15, y: 1004.2 },
  { id: 'government-3', x: 938.2, y: 1004.2 },
  { id: 'reduce-1', x: 788.2, y: 616.4 },
  { id: 'reduce-2', x: 915.4, y: 622.4 },
  { id: 'reduce-3', x: 1041.4, y: 628.4 },
  { id: 'reuse-1', x: 1756, y: 696 },
  { id: 'reuse-2', x: 1751.2, y: 568.4 },
  { id: 'reuse-3', x: 1746.4, y: 442.4 },
  { id: 'repair-1', x: 652.2, y: 421.4 },
  { id: 'repair-2', x: 778.4, y: 402.4 },
  { id: 'repair-3', x: 903, y: 384 },
  { id: 'refurbish-1', x: 1479.4, y: 1000.4 },
  { id: 'refurbish-2', x: 1596.4, y: 949 },
  { id: 'refurbish-3', x: 1712, y: 898.4 },
  { id: 'recycle-1', x: 232.4, y: 221.4 },
  { id: 'recycle-2', x: 345.5, y: 163 },
  { id: 'recycle-3', x: 458, y: 105.4 },
  { id: 'event', x: 1033.4, y: 77.4 },
];
const SLOT_CIRCLE_DIAMETER = 0.97 * MARKER_CIRCLE_DIAMETER;

const SLOTS: CircularSlot[] = SLOT_DEFINITIONS.map(({ id, x, y }) => ({
  id,
  activeShape: new Circle(x, y, SLOT_CIRCLE_DIAMETER / 2.0),
}));

function setupUi(
  { markerAdd$, markerMove$, markerRemove$ }: MarkerObservables<Marker>,
  {
    slotMarkerEnter$,
    slotMarkerLeave$,
    slotDeactivate$,
    slotActivate$,
  }: SlotObservables,
) {
  const panel = guardedQuerySelector(HTMLDivElement, '#slot-panel');
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

export function setupMarkerPanel(): void {
  const panel = guardedQuerySelector(HTMLDivElement, '#slot-panel');
  const pointerMarkerTracking = new PointerMarkerTracker(
    panel,
    POINTER_MARKER_COORDINATES,
  );

  const tuio11EventEmitter = new Tuio11EventEmitter();
  const tuioMarkerTracking = new TuioMarkerTracker(tuio11EventEmitter);

  const markerTracker = new CombinedMarkerTracker(
    pointerMarkerTracking,
    tuioMarkerTracking,
  );
  const slotTracker = new CircularSlotTracker(SLOTS, markerTracker);

  setupUi(markerTracker, slotTracker);

  const WEBSOCKET_URL = 'ws://localhost:3339'; // local
  // const WEBSOCKET_URL = 'ws://10.0.0.20:3333'; // InteractiveScape ScapeX
  const client = new Tuio11Client(new WebsocketTuioReceiver(WEBSOCKET_URL));

  client.addTuioListener(tuio11EventEmitter);
  client.connect();
}
