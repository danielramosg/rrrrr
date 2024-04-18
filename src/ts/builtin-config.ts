import type { DeepReadonly } from 'ts-essentials';

const CONFIG_BASE_URL = new URL('./config/', window.location.href);
const CONFIG_FILENAMES = [
  'general.yaml',
  'model.yaml',
  'simulation.yaml',
  'parameter-transforms.yaml',
  'interaction.yaml',
  'layers.yaml',
] as const;

const CONFIG_URLS = CONFIG_FILENAMES.map(
  (name) => new URL(name, CONFIG_BASE_URL),
);

const CONFIG_INJECTION_KEY = Symbol('config injection key');

const BOARD_WIDTH = 2 * 1920;
const BOARD_HEIGHT = 2 * 1080;
const BOARD_WIDTH_MM = 1209.6;
const MARKER_DIAMETER_MM = 74.3;
const MARKER_CIRCLE_DIAMETER =
  (BOARD_WIDTH * MARKER_DIAMETER_MM) / BOARD_WIDTH_MM;

const NUM_POINTER_MARKERS = 8;
const POINTER_MARKER_COORDINATES = new Array(NUM_POINTER_MARKERS)
  .fill(0)
  .map(() => ({ x: 180, y: 260 }));

const SLOT_CIRCLE_DIAMETER = MARKER_CIRCLE_DIAMETER;

const HOTKEYS = {
  run: { key: ' ', label: 'space' },
  controlPanel: { key: 'c', label: 'c' },
  developerMode: { key: 'd', label: 'd' },
  fullscreen: { key: 'f', label: 'f' },
  highlightDerivatives: { key: 'h', label: 'h' },
} as const;

export {
  CONFIG_BASE_URL,
  CONFIG_INJECTION_KEY,
  CONFIG_FILENAMES,
  CONFIG_URLS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BOARD_WIDTH_MM,
  MARKER_DIAMETER_MM,
  MARKER_CIRCLE_DIAMETER,
  NUM_POINTER_MARKERS,
  POINTER_MARKER_COORDINATES,
  SLOT_CIRCLE_DIAMETER,
  HOTKEYS,
};
