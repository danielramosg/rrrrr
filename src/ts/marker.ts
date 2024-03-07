/* eslint-disable no-console */
import { strict as assert } from 'assert';
import osc from './util/input/tuio/osc';
import { Tuio } from './util/input/tuio/tuio';

import { documentReady } from './util/document-ready';
import { guardedQuerySelectorAll } from './util/guarded-query-selectors';
import { Circle } from './util/geometry/circle';
import { Marker } from './marker/marker';
import { Slot } from './marker/slot';

type MarkerWithElem = { marker: Marker; element: HTMLElement };
type SlotWithElem = { slot: Slot; element: HTMLElement };

function main() {
  const markerElems = [...guardedQuerySelectorAll(HTMLElement, '.marker')];
  assert(markerElems.length > 0, 'No markers found in the document.');

  const markersWithElems: MarkerWithElem[] = markerElems
    .map(
      (markerElem) => [markerElem, markerElem.getBoundingClientRect()] as const,
    )
    .map(([markerElem, rect]) => [markerElem, Circle.toIncircle(rect)] as const)
    .map(([markerElem, circle]) => ({
      marker: new Marker(circle),
      element: markerElem,
    }));

  markersWithElems.forEach(({ marker, element }) => {
    marker.events.on('move', (movedMarker) => {
      /* eslint-disable no-param-reassign */
      console.log('move');
      const { x, y } = movedMarker.geometry;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    });
  });

  function makeDraggable({ marker, element }: MarkerWithElem) {
    function markerDragHandler(event: PointerEvent) {
      console.log('dragged');
      marker.move(event.clientX, event.clientY);
    }

    element.addEventListener('pointerdown', (downEvent) => {
      console.log('pointerdown');
      element.setPointerCapture(downEvent.pointerId);
      element.addEventListener('pointermove', markerDragHandler);
    });
    element.addEventListener('pointerup', (upEvent) => {
      console.log('pointerup');
      element.releasePointerCapture(upEvent.pointerId);
      element.removeEventListener('pointermove', markerDragHandler);
    });
  }

  markersWithElems.forEach(makeDraggable);

  const slotElems = [...guardedQuerySelectorAll(HTMLElement, '.slot')];
  assert(slotElems.length > 0, 'No slots found in the document.');

  const slotsWithElems: SlotWithElem[] = slotElems
    .map((slotElem) => [slotElem, slotElem.getBoundingClientRect()] as const)
    .map(([slotElem, rect]) => [slotElem, Circle.toIncircle(rect)] as const)
    .map(([slotElem, circle]) => ({
      slot: new Slot(circle),
      element: slotElem,
    }));

  slotsWithElems.forEach(({ slot, element }) => {
    slot.events.on('activate', () => {
      element.classList.add('active');
    });
    slot.events.on('deactivate', () => {
      element.classList.remove('active');
    });
    markersWithElems.forEach(({ marker, element: markerElement }) => {
      slot.track(marker);
      slot.events.on('marker-enter', (_, enteredMarker) => {
        if (enteredMarker === marker) markerElement.classList.add('active');
      });
      slot.events.on('marker-leave', (_, enteredMarker) => {
        if (enteredMarker === marker) markerElement.classList.remove('active');
      });
    });
  });

  return { markersWithElems, slotsWithElems };
}

function setupTuio({
  markersWithElems,
}: {
  markersWithElems: MarkerWithElem[];
}) {
  const oscPort = new osc.WebSocketPort({ url: 'ws://localhost:3339' });
  const tuio = new Tuio(oscPort);
  tuio.events.on('/tuio/2Dobj', (params) => {
    const { i, x, y } = params;
    markersWithElems[i % markersWithElems.length].marker.move(
      x * 1920,
      y * 1080,
    );
  });
  oscPort.open();
}

documentReady()
  .then(main)
  .then(setupTuio)
  .catch((err) => console.error(err));
