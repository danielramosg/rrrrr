<script setup lang="ts">
import { ref } from 'vue';

import { useParameterTransformsStore } from '../../ts/stores/parameter-transforms';

const parameterTransformsStore = useParameterTransformsStore();

const newId = ref('');
const newScript = ref('');

function select({ id, script }: { id: string; script: string }) {
  newId.value = id;
  newScript.value = script;
}

function addOrModify(id: string, script: string) {
  parameterTransformsStore.addOrModify(id, script);
}

function remove(id: string) {
  parameterTransformsStore.remove(id);
}
</script>

<template>
  <!--
  <div v-for="parameterId in parameterIds" :key="parameterId">
    <div>{{ parameterId }} = {{ initialParameters[parameterId] }}</div>
    <input
      type="range"
      min="0"
      max="4"
      step="0.001"
      v-model="initialParameters[parameterId]"
    />
  </div>
  -->

  <div id="parameter-transforms" class="parameter-transforms">
    <div>
      Active:
      <div class="active"></div>
      <br />
      <input
        type="button"
        value="Clear all active transforms"
        id="clear-all-active-parameter-transforms-button"
      />
    </div>
    <div>
      Available:
      <div
        class="available"
        v-for="parameterTransform in parameterTransformsStore.parameterTransforms"
        :key="parameterTransform.id"
      >
        <div
          class="parameter-transform"
          :data-id="parameterTransform.id"
          @click="select(parameterTransform)"
        >
          {{ parameterTransform.id }}
        </div>
      </div>
    </div>
    <div>
      Id:<br />
      <input type="text" v-model="newId" /><br />
      Script:<br />
      <textarea v-model="newScript" rows="5" cols="10"></textarea><br />
      <input
        type="button"
        value="Add/Modify"
        @click="addOrModify(newId, newScript)"
      />
      <input type="button" value="Delete" @click="remove(newId)" />
    </div>
  </div>
</template>

<style lang="scss">
.parameter-transforms {
  display: flex;
  gap: 2em;

  & *:nth-child(1),
  & *:nth-child(2) {
    flex-grow: 0;
  }

  & *:last-child {
    flex-grow: 3;

    & input[type='text'],
    & textarea {
      width: 100%;
    }
  }

  & .active,
  & .available {
    overflow: scroll;
    max-height: 900px;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
    }

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    min-width: 100px;
    max-width: 200px;
    min-height: 20px;
    border: solid 1px;

    & > div {
      border: solid 1px;
      margin: -1px;
      padding: 0.2ex;
    }
  }
}
</style>
