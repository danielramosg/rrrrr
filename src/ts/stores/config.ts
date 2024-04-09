import { strict as assert } from 'assert';
import { defineStore } from 'pinia';
import { inject } from 'vue';
import type { ReadonlyConfig } from '../config/config-schema';
import { CONFIG_INJECTION_KEY } from '../builtin-config';

export const useConfigStore = defineStore('config', () => {
  const config = inject<ReadonlyConfig | null>(CONFIG_INJECTION_KEY, null);
  assert(config);

  const {
    general: { assetBaseDir },
  } = config;

  const assetBaseUrl = new URL(`${assetBaseDir}/`, window.location.href);

  const toAssetUrl = (path: string) => new URL(path, assetBaseUrl);

  const POSITIONAL_ASSET_REGEX =
    /_x([+-]?[0-9]+)_y([+-]?[0-9]+)\.[a-zA-Z0-9]+$/;
  const extractAssetPosition = (
    url: string | URL,
  ): { x: number; y: number } => {
    if (typeof url !== 'string') return extractAssetPosition(url.href);

    const matches = url.match(POSITIONAL_ASSET_REGEX);
    if (matches === null || matches.length !== 3) return { x: 0, y: 0 };

    const x = Number.parseInt(matches[1], 10);
    const y = Number.parseInt(matches[2], 10);

    return { x, y };
  };

  return { config, assetBaseUrl, toAssetUrl, extractAssetPosition };
});
