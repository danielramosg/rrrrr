<script setup lang="ts">
import { pick } from 'lodash';
import {toRaw} from 'vue';

import type { Ref } from 'vue';

import { computed } from 'vue';
import '@fontsource/jost/latin-500.css'; // Medium weight
import '@fontsource/jost/latin-700.css'; // Bold weight

import { useConfigStore } from '../../ts/stores/config';
import { useModelStore } from '../../ts/stores/model';
import { Scores } from '../../ts/scores';

const {
  config: { general },
} = useConfigStore();
const { primaryLanguage, secondaryLanguage, scoreLabels } = general;
const { circularity: circularityLabels, happiness: happinessLabels } =
  scoreLabels;

const modelStore = useModelStore();

interface ScoreInfo {
  score: Ref<number>;
  primaryLabel: string;
  secondaryLabel: string;
}

const circularity: ScoreInfo = {
  score: computed(() => Scores.circularity(modelStore.record)),
  primaryLabel: circularityLabels[primaryLanguage],
  secondaryLabel: circularityLabels[secondaryLanguage],
};
const happiness: ScoreInfo = {
  score: computed(() => Scores.happiness(modelStore.record)),
  primaryLabel: happinessLabels[primaryLanguage],
  secondaryLabel: happinessLabels[secondaryLanguage],
};

/** DEBUG / ADJUSTMENT FUNCTIONS */

declare global {
  interface Window {
    record: () => Object;
    scores: () => Object;
    stocks: () => Object;
    variables: () => Object;
    flows: () => Object;
    parameters: () => Object;
    demands: () => Object;
  }
}

window.record = () => toRaw(modelStore.record);
window.scores = () => Scores.all(modelStore.record);
window.stocks = () => pick(toRaw(modelStore.record), 'stocks')['stocks'];
window.variables = () => pick(toRaw(modelStore.record), 'variables')['variables'];
window.flows = () => pick(toRaw(modelStore.record), 'flows')['flows'];
window.parameters = () => pick(toRaw(modelStore.record), 'parameters')['parameters'];

window.demands = () => pick(pick(toRaw(modelStore.record), 'variables')['variables'],
[ 'demandForNaturalResources',
  'demandForNewlyProducedPhones',
  'demandForPhones',
  'demandForRecycledMaterials',
  'demandForRecycling',
  'demandForRefurbishedPhones',
  'demandForRefurbishment',
  'demandForRepair',
  'demandForRepairedPhones',
  'demandForResources',
  'demandForReusedPhones']);
  
/** END OF DEBUG / ADJUSTMENT FUNCTIONS */


const scores = [circularity, happiness];

const fractionDigits = 1;
const format = (score: number) => `${(score * 100).toFixed(fractionDigits)}%`;
</script>

<template>
  <div class="scores">
    <table>
      <template v-for="{ score, primaryLabel, secondaryLabel } in scores">
        <tr>
          <td>
            <span class="primary">{{ primaryLabel }}&nbsp;</span
            ><span class="secondary">{{ secondaryLabel }}</span>
          </td>
          <td class="primary score-column">{{ format(score.value) }}</td>
        </tr>
      </template>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.scores {
  display: table;
  table-layout: fixed;
  font-size: 38px;
  position: absolute;
  padding-bottom: 1.4ex;
  padding-right: 2.5ex;

  & .table-row {
    display: table-row;
  }

  & .table-cell {
    display: table-cell;
  }

  & .score-column {
    width: 9ex;
    text-align: right;
  }

  & .primary {
    font-family: 'Jost', sans-serif;
    font-weight: 700;
  }

  & .secondary {
    font-family: 'Jost', sans-serif;
    font-weight: 500;
  }
}
</style>
