import { defineStore } from 'pinia';
import { ref, readonly } from 'vue';

import { BOARD_WIDTH, BOARD_HEIGHT } from '../builtin-config';
import { useOptionStore } from './options';
import { Tuio11EventEmitter } from '../util/input/tuio/tuio11-event-emitter';
import { Tuio11Client, Tuio11Object } from '../util/input/tuio/tuio_client_js';
import { WebsocketTuioReceiverExt } from '../util/input/tuio/websocket-tuio-receiver-ext';

interface Marker {
  id: string;
  x: number;
  y: number;
}

export const useMarkerStore = defineStore('marker', () => {
  const options = useOptionStore();

  const markerPositions = ref(new Array<Marker>());

  const removeMarker = (m: Marker) => {
    let index = -1;
    do {
      index = markerPositions.value.findIndex(({ id }) => id === m.id);
      if (index !== -1) markerPositions.value.splice(index, 1);
    } while (index !== -1);
  };

  const addMarker = (m: Marker) => {
    removeMarker(m);
    markerPositions.value.push({ ...m });
  };

  const moveMarker = (m: Marker) => {
    const movedMarker = markerPositions.value.find(({ id }) => id === m.id);
    if (typeof movedMarker === 'undefined') {
      addMarker(m);
      return;
    }

    movedMarker.x = m.x;
    movedMarker.y = m.y;
  };

  // TODO: Factor out the TUIO stuff into separate composable
  const tuio11EventEmitter = new Tuio11EventEmitter();

  if (options.useTuioMarkers) {
    const client = new Tuio11Client(
      new WebsocketTuioReceiverExt(
        options.tuioUrl,
        options.tuioReconnectionDelayMs,
      ),
    );
    client.addTuioListener(tuio11EventEmitter);

    /*
     * FIXME:
     *   This is a workaround to not miss the initial marker events that are emitted directly after the connection is
     *   established.
     */
    setTimeout(() => client.connect(), 0);
  }

  tuio11EventEmitter.on('tuio-object-add', (tuioObject: Tuio11Object) => {
    addMarker({
      id: `tuio-${tuioObject.sessionId}`,
      x: tuioObject.xPos * BOARD_WIDTH,
      y: tuioObject.yPos * BOARD_HEIGHT,
    });
  });

  tuio11EventEmitter.on('tuio-object-update', (tuioObject: Tuio11Object) => {
    moveMarker({
      id: `tuio-${tuioObject.sessionId}`,
      x: tuioObject.xPos * BOARD_WIDTH,
      y: tuioObject.yPos * BOARD_HEIGHT,
    });
  });

  tuio11EventEmitter.on('tuio-object-remove', (tuioObject: Tuio11Object) => {
    removeMarker({
      id: `tuio-${tuioObject.sessionId}`,
      x: tuioObject.xPos * BOARD_WIDTH,
      y: tuioObject.yPos * BOARD_HEIGHT,
    });
  });

  return {
    markerPositions: readonly(markerPositions),
    removeMarker,
    addMarker,
    moveMarker,
  };
});

export type { Marker };
