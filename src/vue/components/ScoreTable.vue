<script setup lang="ts">
import { pick } from 'lodash';
import {toRaw} from 'vue';

import type { Ref } from 'vue';

import { computed } from 'vue';

import { useConfigStore } from '../../ts/stores/config';
import { useModelStore } from '../../ts/stores/model';
import { Scores } from '../../ts/scores';

const {
  config: { general },
  getPrimary,
  getSecondary,
} = useConfigStore();
const { scoreLabels } = general;
const { circularity: circularityLabels, happiness: happinessLabels } =
  scoreLabels;

const modelStore = useModelStore();

interface ScoreInfo {
  score: Ref<number>;
  primaryLabel: Ref<string>;
  secondaryLabel: Ref<string>;
}

const circularity: ScoreInfo = {
  score: computed(() => Scores.circularity(modelStore.record)),
  primaryLabel: getPrimary(circularityLabels),
  secondaryLabel: getSecondary(circularityLabels),
};
const happiness: ScoreInfo = {
  score: computed(() => Scores.happiness(modelStore.record)),
  primaryLabel: getPrimary(happinessLabels),
  secondaryLabel: getSecondary(happinessLabels),
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
    <table class="score-table">
      <template v-for="{ score, primaryLabel, secondaryLabel } in scores">
        <tr>
          <td class="label-column">
            <span class="primary-text">{{ primaryLabel.value }}&nbsp;</span
            ><br /><span class="secondary-text">{{
              secondaryLabel.value
            }}</span>
          </td>
          <td class="primary-text score-column">
            <span class="score-value">{{ format(score.value) }}</span>
          </td>
        </tr>
      </template>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.scores {
  display: table;
  table-layout: fixed;
  margin: 44px;
  width: 376px;
  height: 376px;
  background-color: black;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  line-height: 1.2;
  text-transform: uppercase;
  position: absolute;
}

.score-table {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

table {
  border-collapse: separate;
  border-spacing: 1ex 1em;
}

td {
  vertical-align: top;
}

.score-column {
  text-align: right;
}

.score-value {
  display: inline-block;
  width: 8ex;
  text-align: right;
}
</style>
