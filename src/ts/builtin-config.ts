import { DeepReadonly } from 'ts-essentials';

const BOARD_WIDTH = 1920;
const BOARD_HEIGHT = 1080;
const BOARD_WIDTH_MM = 1209.6;
const MARKER_DIAMETER_MM = 74.3;
const MARKER_CIRCLE_DIAMETER =
  (BOARD_WIDTH * MARKER_DIAMETER_MM) / BOARD_WIDTH_MM;

const NUM_POINTER_MARKERS = 8;
const POINTER_MARKER_COORDINATES = new Array(NUM_POINTER_MARKERS)
  .fill(0)
  .map(() => ({ x: 90 / BOARD_WIDTH, y: 130 / BOARD_HEIGHT }));

const SLOT_DEFINITIONS_RW = [
  {
    id: 'manufacturer-1',
    x: 94.35,
    y: 659.11,
    transformId: 'Triple Diamantglas (T)',
  },
  { id: 'manufacturer-2', x: 94.35, y: 532.9, transformId: 'Sim Card 4.0 (T)' },
  {
    id: 'manufacturer-3',
    x: 94.35,
    y: 405.4,
    transformId: 'KI-Automatisierung (T)',
  },
  {
    id: 'government-1',
    x: 684.3,
    y: 1004.2,
    transformId: 'Schul-Repair-Café (P)',
  },
  {
    id: 'government-2',
    x: 812.15,
    y: 1004.2,
    transformId: 'Extreme Öko-Steuer (P)',
  },
  { id: 'government-3', x: 938.2, y: 1004.2, transformId: 'Handy Spenden (P)' },
  { id: 'reduce-1', x: 788.2, y: 616.4, transformId: 'Reduce' },
  { id: 'reduce-2', x: 915.4, y: 622.4, transformId: 'Reduce' },
  { id: 'reduce-3', x: 1041.4, y: 628.4, transformId: 'Reduce' },
  { id: 'reuse-1', x: 1756, y: 696, transformId: 'Reuse' },
  { id: 'reuse-2', x: 1751.2, y: 568.4, transformId: 'Reuse' },
  { id: 'reuse-3', x: 1746.4, y: 442.4, transformId: 'Reuse' },
  { id: 'repair-1', x: 652.2, y: 421.4, transformId: 'Repair' },
  { id: 'repair-2', x: 778.4, y: 402.4, transformId: 'Repair' },
  { id: 'repair-3', x: 903, y: 384, transformId: 'Repair' },
  { id: 'refurbish-1', x: 1479.4, y: 1000.4, transformId: 'Refurbish' },
  { id: 'refurbish-2', x: 1596.4, y: 949, transformId: 'Refurbish' },
  { id: 'refurbish-3', x: 1712, y: 898.4, transformId: 'Refurbish' },
  { id: 'recycle-1', x: 232.4, y: 221.4, transformId: 'Recycle' },
  { id: 'recycle-2', x: 345.5, y: 163, transformId: 'Recycle' },
  { id: 'recycle-3', x: 458, y: 105.4, transformId: 'Recycle' },
  { id: 'event', x: 1033.4, y: 77.4, transformId: 'Hacker Attack (E)' },
];
const SLOT_DEFINITIONS: DeepReadonly<typeof SLOT_DEFINITIONS_RW> =
  SLOT_DEFINITIONS_RW;
const SLOT_CIRCLE_DIAMETER = MARKER_CIRCLE_DIAMETER;

export {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BOARD_WIDTH_MM,
  MARKER_DIAMETER_MM,
  MARKER_CIRCLE_DIAMETER,
  NUM_POINTER_MARKERS,
  POINTER_MARKER_COORDINATES,
  SLOT_DEFINITIONS,
  SLOT_CIRCLE_DIAMETER,
};
