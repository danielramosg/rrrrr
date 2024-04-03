<script setup lang="ts">
import { strict as assert } from 'assert';
import { onMounted, ref } from 'vue';
import Sortable from 'sortablejs';
import { v4 as uuid4 } from 'uuid';

import type { Parameters } from '../../ts/circular-economy-model';

import { useModelStore } from '../../ts/stores/model';
import { useParameterTransformsStore } from '../../ts/stores/parameter-transforms';
import { useSlotGroupsStore } from '../../ts/stores/slot-groups';

const { transformedParametersExt } = useModelStore();
const parameterTransformsStore = useParameterTransformsStore();
const { slotGroups, internalSlotGroup } = useSlotGroupsStore();

const newId = ref('');
const newScript = ref('');

function select(id: string) {
  newId.value = id;
  newScript.value =
    parameterTransformsStore.parameterTransforms.find((pt) => pt.id === id)
      ?.script ?? '';
}

function addOrModify(id: string, script: string) {
  parameterTransformsStore.addOrModify(id, script);
}

function remove(id: string) {
  parameterTransformsStore.remove(id);
}

function move(from: number, to: number) {
  parameterTransformsStore.move(from, to);
}

const createTooltip = (slotGroupId: string, index: number): string => {
  const slotGroupTransformedParametersExt = transformedParametersExt.find(
    ({ id }) => id === slotGroupId,
  );
  assert(typeof slotGroupTransformedParametersExt !== 'undefined');

  const step = slotGroupTransformedParametersExt.steps[index];
  assert(typeof step !== 'undefined');
  const { active, script, diff } = step;

  const pToS = (p: Partial<Parameters>) => JSON.stringify(p, null, 2);

  return active
    ? `Diff: ${pToS(diff)}\n\nScript:\n${script}`
    : `Script:\n${script}`;
};

const availableContainer = ref<HTMLDivElement | null>(null);

onMounted(() => {
  assert(availableContainer.value);

  Sortable.create(availableContainer.value, {
    onEnd: (event) => {
      const { newDraggableIndex, oldDraggableIndex } = event;
      assert(typeof newDraggableIndex !== 'undefined');
      assert(typeof oldDraggableIndex !== 'undefined');
      move(oldDraggableIndex, newDraggableIndex);
    },
  });
});
</script>

<template>
  <div id="parameter-transforms" class="parameter-transforms">
    <div>
      Internal (applied first):
      <div ref="availableContainer" class="available">
        <div
          class="parameter-transform"
          v-for="(
            { id, uuid }, index
          ) in internalSlotGroup.parameterTransforms.map((pt) => ({
            ...pt,
            uuid: uuid4(),
          }))"
          :key="id"
          :data-id="id"
          :title="createTooltip(internalSlotGroup.id, index)"
        >
          <input
            type="checkbox"
            :id="`${internalSlotGroup.id}-${id}-checkbox-${uuid}`"
            :value="id"
            v-bind="() => internalSlotGroup.parameterTransforms[index].active"
            @input="
              internalSlotGroup.parameterTransforms[index].active =
                !internalSlotGroup.parameterTransforms[index].active
            "
          />
          <label
            :for="`${internalSlotGroup.id}-${id}-checkbox-${uuid}`"
            class="draggable"
            >{{ id }}</label
          >
          <span class="edit" @click="select(id)">✎</span>
        </div>
      </div>
    </div>
    <div>
      <div>
        Id:<br />
        <input
          type="text"
          v-model="newId"
          name="parameter-transform-id"
        /><br />
        Script:<br />
        <textarea
          v-model="newScript"
          rows="5"
          cols="10"
          name="parameter-transform-script"
        ></textarea
        ><br />
        <input
          type="button"
          value="Add/Modify"
          @click="addOrModify(newId, newScript)"
        />
        <input type="button" value="Delete" @click="remove(newId)" />
        <br />
        <input
          type="button"
          value="Clear all active transforms"
          id="clear-all-active-parameter-transforms-button"
        />
      </div>
      <div class="slot-group-transforms">
        <div
          v-for="{ id: sId, parameterTransforms } in slotGroups.filter(
            ({ id }) => id !== internalSlotGroup.id,
          )"
          :key="sId"
          :data-id="sId"
        >
          <br />
          Slot group '{{ sId }}':
          <div class="available">
            <div
              class="parameter-transform"
              v-for="({ id: pId, uuid }, pIndex) in parameterTransforms.map(
                (pt) => ({ ...pt, uuid: uuid4() }),
              )"
              :key="pId"
              :data-id="pId"
              :title="createTooltip(sId, pIndex)"
            >
              <input
                type="checkbox"
                :id="`${sId}-${pId}-checkbox-${uuid}`"
                :value="pId"
                v-bind="() => parameterTransforms[pIndex].active"
                disabled
              />
              <label :for="`${sId}-${pId}-checkbox-${uuid}`">{{ pId }}</label>
              <span class="edit" @click="select(pId)">✎</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.parameter-transforms {
  display: flex;
  gap: 2em;

  & > *:first-child {
    flex-grow: 0;
  }

  & > *:last-child {
    flex-grow: 3;

    & input[type='text'],
    & textarea {
      width: 100%;
    }
  }

  & .available {
    overflow: scroll;
    max-height: 900px;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
    }

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    min-width: 300px;
    max-width: 300px;
    min-height: 20px;
    border: solid 1px;

    & > div {
      outline: solid 1px;
      padding: 0.2ex;
      display: flex;
      flex-wrap: nowrap;

      & label {
        flex-grow: 1;
      }

      & label.draggable {
        cursor: grab;
      }

      & > * {
        white-space: nowrap;
      }

      & input,
      & .edit {
        margin-left: 0.5ex;
        margin-right: 0.5ex;
      }

      & input:not(:disabled),
      & .edit {
        cursor: pointer;
      }
    }
  }
}

.slot-group-transforms {
  height: 700px;
  overflow: scroll;
}
</style>
