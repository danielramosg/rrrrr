import { strict as assert } from 'assert';
import { defineStore } from 'pinia';
import { inject } from 'vue';
import type { ReadonlyConfig } from '../config/config-schema';
import { CONFIG_INJECTION_KEY } from '../builtin-config';

export const useConfigStore = defineStore('config', () => {
  const config = inject<ReadonlyConfig | null>(CONFIG_INJECTION_KEY, null);
  assert(config);

  return { config };
});
