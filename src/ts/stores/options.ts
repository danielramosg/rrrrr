import type { DeepReadonly } from 'ts-essentials';

import { defineStore } from 'pinia';

import { NUM_POINTER_MARKERS } from '../builtin-config';

export const useOptionStore = defineStore('options', () => {
  const searchParams = new URLSearchParams(window.location.search);

  const useTuioMarkers = (searchParams.get('tuio') ?? 'true') === 'true';
  const usePointerMarkers = (searchParams.get('pointer') ?? 'false') === 'true';

  const numPointerMarkers = Number.parseInt(
    searchParams.get('numPointerMarkers') ?? `${NUM_POINTER_MARKERS}`,
    10,
  );
  const tuioUrl = searchParams.get('tuioUrl') ?? 'ws://localhost:3339';

  const autoStart = (searchParams.get('autoStart') ?? 'true') === 'true';

  const developerMode = (searchParams.get('devMode') ?? 'false') === 'true';

  const result = {
    useTuioMarkers,
    usePointerMarkers,
    numPointerMarkers,
    tuioUrl,
    autoStart,
    developerMode,
  };

  return result as DeepReadonly<typeof result>;
});
