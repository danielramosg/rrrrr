import { defineStore } from 'pinia';
import { ref } from 'vue';

import { CircularEconomyModel } from '../circular-economy-model';

export const useModelStore = defineStore('model', () => {
  const initialRecord = new CircularEconomyModel().evaluate(
    CircularEconomyModel.initialStocks,
    CircularEconomyModel.defaultParameters,
    0,
  );
  const record = ref(initialRecord);

  return { record };
});
