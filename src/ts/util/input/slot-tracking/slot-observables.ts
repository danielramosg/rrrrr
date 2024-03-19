import * as Rx from 'rxjs';

export type SlotIdAndMarkerId = { slotId: string; markerId: string };

export type SlotObservables = {
  slotActivate$: Rx.Observable<SlotIdAndMarkerId>;
  slotDeactivate$: Rx.Observable<SlotIdAndMarkerId>;
  slotMarkerEnter$: Rx.Observable<SlotIdAndMarkerId>;
  slotMarkerLeave$: Rx.Observable<SlotIdAndMarkerId>;
};
