import * as Rx from 'rxjs';
import { strict as assert } from 'assert';

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
  type SlotIdAndMarkerId,
  type SlotObservables,
} from './util/input/slot-tracking/slot-observables';
import {
  type CircularSlot,
  CircularSlotTracker,
} from './util/input/slot-tracking/circular-slot-tacker';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  MARKER_CIRCLE_DIAMETER,
  POINTER_MARKER_COORDINATES,
  SLOT_CIRCLE_DIAMETER,
  SLOT_DEFINITIONS,
} from './builtin-config';

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

    const transformId = SLOT_DEFINITIONS.find(
      (sd) => sd.id === id,
    )?.transformId;
    assert(typeof transformId !== 'undefined');
    const idElement = document.createElement('div');
    idElement.append(
      id,
      document.createElement('br'),
      transformId.replaceAll(' ', '\u00A0'),
    );
    element.append(idElement);
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
        element.style.left = `${BOARD_WIDTH * x}px`;
        element.style.top = `${BOARD_HEIGHT * y}px`;
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

export function setupMarkerPanel(): CircularSlotTracker {
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

  return slotTracker;
}
