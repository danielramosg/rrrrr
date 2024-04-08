import { defineStore } from 'pinia';
import { ref, readonly } from 'vue';

export interface SlotIdAndMarkerId {
  slotId: string;
  markerId: string;
}

export const useSlotStore = defineStore('slot', () => {
  const slotActivations = ref(
    new Array<{ slotId: string; markerId: string }>(),
  );

  const removeActivation = (sm: SlotIdAndMarkerId) => {
    const index = slotActivations.value.findIndex(
      ({ slotId, markerId }) =>
        slotId === sm.slotId && markerId === sm.markerId,
    );
    if (index !== -1) slotActivations.value.splice(index, 1);
  };

  const addActivation = (sm: SlotIdAndMarkerId) => {
    removeActivation(sm);
    slotActivations.value.push(sm);
  };

  return {
    slotActivations: readonly(slotActivations),
    addActivation,
    removeActivation,
  };
});
