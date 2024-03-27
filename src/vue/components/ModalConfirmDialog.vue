<script setup lang="ts">
import { strict as assert } from 'assert';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Modal } from 'bootstrap';

const defaultTitleText = 'Confirmation required';

const modalElementRef = ref<HTMLDivElement | null>(null);
const modalRef = ref<Modal | null>(null);

const props = defineProps<{ title: string; message: string }>();

const title = ref(props.title);
const message = ref(props.title);

const emit = defineEmits(['confirm', 'dismiss']);

const isOpen = ref(false);
const isVisible = ref(false);

watch(isOpen, (value) => {
  if (modalRef.value !== null) {
    if (value) {
      modalRef.value.show();
    } else {
      modalRef.value.hide();
    }
  }
});

let resolver: (value: boolean) => void = () => {};

const confirm = () => {
  emit('confirm');
  resolver(true);
  resolver = () => {};
};

const dismiss = () => {
  emit('dismiss');
  resolver(false);
  resolver = () => {};
};

const open = async (
  m: string,
  t: string = defaultTitleText,
): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    title.value = t;
    message.value = m;
    resolver = resolve;
    isOpen.value = true;
  }).then((result) => {
    isOpen.value = false;
    return result;
  });
};

defineExpose<{ open: typeof open }>({ open });

onMounted(() => {
  assert(modalElementRef.value !== null);
  const modalElement = modalElementRef.value;
  const modal = new Modal(modalElement);
  modalRef.value = modal;
  onUnmounted(() => {
    modal.dispose();
  });
});
</script>

<template>
  <Teleport :to="'#fixed-size-container'">
    <div class="scale-2x" :style="{ display: isVisible ? 'block' : 'none' }">
      <div
        ref="modalElementRef"
        class="modal fade"
        data-bs-backdrop="false"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
        v-on="{
          'show.bs.modal': () => (isVisible = true),
          'hidden.bs.modal': () => (isVisible = false),
        }"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="staticBackdropLabel">
                {{ title }}
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                @click="dismiss"
              ></button>
            </div>
            <div class="modal-body" ref="slot">{{ message }}</div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click="dismiss"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-primary"
                data-bs-dismiss="modal"
                @click="confirm"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.scale-2x {
  position: absolute;
  width: 50%;
  height: 50%;
  transform-origin: top left;
  transform: scale(2);
}
</style>
