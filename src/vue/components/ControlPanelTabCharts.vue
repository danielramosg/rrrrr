<script setup lang="ts">
import { strict as assert } from 'assert';
import { ref, computed, watchEffect, onMounted } from 'vue';
import {
  Chart as ChartJs,
  BarController,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

import { useModelStore } from '../../ts/stores/model';
import {
  CircularEconomyModel,
  stockIds,
  flowIds,
  variableIds,
  parameterIds,
  type Record,
} from '../../ts/circular-economy-model';

ChartJs.register(
  BarController,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

function toChartJsRecord(record: Record): { id: string; value: number }[] {
  return CircularEconomyModel.elementIds
    .map((key) =>
      Object.entries(record[key]).map(([id, value]) => ({ id, value })),
    )
    .reduce((cur, acc) => [...cur, ...acc], []);
}

const modelStore = useModelStore();

const labels = {
  stocks: stockIds,
  flows: flowIds,
  variables: variableIds,
  parameters: parameterIds,
};
const labelsArray = Object.values(labels).flat();

const chartJsRecord = computed(() => toChartJsRecord(modelStore.record));

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  assert(canvas.value);
  const chartJs = new ChartJs(canvas.value, {
    type: 'bar',
    data: {
      labels: labelsArray,
      datasets: [
        {
          label: 'Values',
          data: new Array<number>(labelsArray.length).fill(0),
        },
      ],
    },
    options: { animation: false },
  });

  watchEffect(() => {
    chartJs.data.datasets[0].data = chartJsRecord.value.map((x) => x.value);
    chartJs.update();
  });
});
</script>

<template>
  <div style="width: 100%">
    <canvas ref="canvas"></canvas>
  </div>
</template>
