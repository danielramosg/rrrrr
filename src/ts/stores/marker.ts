import { defineStore } from 'pinia';
import { ref } from 'vue';

import type {
  Marker,
  MarkerObservables,
} from '../util/input/marker-tracking/marker-observables';

import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  POINTER_MARKER_COORDINATES,
} from '../builtin-config';
import { useOptionStore } from './options';
import { guardedQuerySelector } from '../util/guarded-query-selectors';
import { PointerMarkerTracker } from '../util/input/marker-tracking/pointer-marker-tracker';
import { Tuio11EventEmitter } from '../util/input/tuio/tuio11-event-emitter';
import { TuioMarkerTracker } from '../util/input/marker-tracking/tuio-marker-tracker';
import { CombinedMarkerTracker } from '../util/input/marker-tracking/combined-marker-tracker';
import {
  Tuio11Client,
  WebsocketTuioReceiver,
} from '../../vendor/InteractiveScapeGmbh/tuio_client_js/src';

export const useMarkerStore = defineStore('marker', () => {
  const options = useOptionStore();

  const markerTrackers = new Array<MarkerObservables<Marker>>();

  if (options.usePointerMarkers) {
    const panel = guardedQuerySelector(HTMLDivElement, '#slot-panel');
    const pointerMarkerTracking = new PointerMarkerTracker(
      panel,
      POINTER_MARKER_COORDINATES,
    );
    markerTrackers.push(pointerMarkerTracking);
  }

  if (options.useTuioMarkers) {
    const tuio11EventEmitter = new Tuio11EventEmitter();
    const tuioMarkerTracking = new TuioMarkerTracker(tuio11EventEmitter);
    markerTrackers.push(tuioMarkerTracking);

    const WEBSOCKET_URL = 'ws://localhost:3339'; // local
    // const WEBSOCKET_URL = 'ws://10.0.0.20:3333'; // InteractiveScape ScapeX
    const client = new Tuio11Client(new WebsocketTuioReceiver(WEBSOCKET_URL));

    client.addTuioListener(tuio11EventEmitter);

    /*
     * FIXME:
     *   This is a workaround to not miss the initial marker events that are emitted directly after the connection is
     *   established.
     */
    setTimeout(() => client.connect(), 0);
  }

  const markerPositions = ref(new Array<Marker>());

  const markerTracker = new CombinedMarkerTracker(...markerTrackers);
  const { markerAdd$, markerMove$, markerRemove$ } = markerTracker;

  const rel2Abs = (rel: { x: number; y: number }) => ({
    x: BOARD_WIDTH * rel.x,
    y: BOARD_HEIGHT * rel.y,
  });

  const removeHandler = (m: Marker) => {
    let index = -1;
    do {
      index = markerPositions.value.findIndex(({ id }) => id === m.id);
      if (index !== -1) markerPositions.value.splice(index, 1);
    } while (index !== -1);
  };

  const addHandler = (m: Marker) => {
    removeHandler(m);
    markerPositions.value.push({ ...m, ...rel2Abs(m) });
  };

  const moveHandler = (m: Marker) => {
    const movedMarker = markerPositions.value.find(({ id }) => id === m.id);
    if (typeof movedMarker === 'undefined') {
      addHandler(m);
      return;
    }

    const { x, y } = rel2Abs(m);
    movedMarker.x = x;
    movedMarker.y = y;
  };

  markerAdd$.subscribe(addHandler);
  markerMove$.subscribe(moveHandler);
  markerRemove$.subscribe(removeHandler);

  return { markerPositions };
});

export type { Marker };
