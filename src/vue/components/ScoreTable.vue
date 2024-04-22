<script setup lang="ts">
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
            <span class="primary-text">{{ primaryLabel.value }}&nbsp;</span
            ><span class="secondary-text">{{ secondaryLabel.value }}</span>
          </td>
          <td class="primary-text score-column">{{ format(score.value) }}</td>
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
}
</style>
