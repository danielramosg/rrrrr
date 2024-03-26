import { DeepReadonly } from 'ts-essentials';

const CONFIG_BASE_URL = new URL('./config/', window.location.href);
const CONFIG_FILENAMES = [
  'general.yaml',
  'model.yaml',
  'simulation.yaml',
  'parameter-transforms.yaml',
  'interaction.yaml',
  'triggers.yaml',
] as const;

const CONFIG_URLS = CONFIG_FILENAMES.map(
  (name) => new URL(name, CONFIG_BASE_URL),
);

const BOARD_WIDTH = 2 * 1920;
const BOARD_HEIGHT = 2 * 1080;
const BOARD_WIDTH_MM = 1209.6;
const MARKER_DIAMETER_MM = 74.3;
const MARKER_CIRCLE_DIAMETER =
  (BOARD_WIDTH * MARKER_DIAMETER_MM) / BOARD_WIDTH_MM;

const NUM_POINTER_MARKERS = 8;
const POINTER_MARKER_COORDINATES = new Array(NUM_POINTER_MARKERS)
  .fill(0)
  .map(() => ({ x: 180 / BOARD_WIDTH, y: 260 / BOARD_HEIGHT }));

const SLOT_DEFINITIONS_RW = [
  {
    id: 'manufacturer-1',
    x: 188.7,
    y: 1318.22,
    transformId: 'Triple Diamantglas (T)',
  },
  {
    id: 'manufacturer-2',
    x: 188.7,
    y: 1064.51,
    transformId: 'Sim Card 4.0 (T)',
  },
  {
    id: 'manufacturer-3',
    x: 188.7,
    y: 810.8,
    transformId: 'KI-Automatisierung (T)',
  },
  {
    id: 'government-1',
    x: 1368.6,
    y: 2008.4,
    transformId: 'Schul-Repair-Café (P)',
  },
  {
    id: 'government-2',
    x: 1624.3,
    y: 2008.4,
    transformId: 'Extreme Öko-Steuer (P)',
  },
  {
    id: 'government-3',
    x: 1876.4,
    y: 2008.4,
    transformId: 'Handy Spenden (P)',
  },
  { id: 'reduce-1', x: 1576.4, y: 1232.8, transformId: 'Reduce' },
  { id: 'reduce-2', x: 1830.8, y: 1244.8, transformId: 'Reduce' },
  { id: 'reduce-3', x: 2082.8, y: 1256.8, transformId: 'Reduce' },
  { id: 'reuse-1', x: 3512, y: 1392, transformId: 'Reuse' },
  { id: 'reuse-2', x: 3502.4, y: 1136.8, transformId: 'Reuse' },
  { id: 'reuse-3', x: 3492.8, y: 884.8, transformId: 'Reuse' },
  { id: 'repair-1', x: 1304.4, y: 842.8, transformId: 'Repair' },
  { id: 'repair-2', x: 1556.8, y: 804.8, transformId: 'Repair' },
  { id: 'repair-3', x: 1806, y: 768, transformId: 'Repair' },
  { id: 'refurbish-1', x: 2958.8, y: 2000.8, transformId: 'Refurbish' },
  { id: 'refurbish-2', x: 3192.8, y: 1898, transformId: 'Refurbish' },
  { id: 'refurbish-3', x: 3424, y: 1796.8, transformId: 'Refurbish' },
  { id: 'recycle-1', x: 464.8, y: 442.8, transformId: 'Recycle' },
  { id: 'recycle-2', x: 691, y: 326, transformId: 'Recycle' },
  { id: 'recycle-3', x: 916, y: 210.8, transformId: 'Recycle' },
  { id: 'event', x: 2066.8, y: 154.8, transformId: 'Hacker Attack (E)' },
];
const SLOT_DEFINITIONS: DeepReadonly<typeof SLOT_DEFINITIONS_RW> =
  SLOT_DEFINITIONS_RW;
const SLOT_CIRCLE_DIAMETER = MARKER_CIRCLE_DIAMETER;

interface Card<S extends string> {
  type: S;
  transformId: string;
  sprite: URL;
}

interface EventCard extends Card<'event'> {
  timeout: number;
}

interface ActionCard extends Card<'action'> {}

const EVENT_CARDS: DeepReadonly<EventCard[]> = [];
const POLICY_ACTION_CARDS: DeepReadonly<ActionCard[]> = [];
const TECHNOLOGY_ACTION_CARDS: DeepReadonly<ActionCard[]> = [];

export type { Card, EventCard, ActionCard };

export {
  CONFIG_BASE_URL,
  CONFIG_FILENAMES,
  CONFIG_URLS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BOARD_WIDTH_MM,
  MARKER_DIAMETER_MM,
  MARKER_CIRCLE_DIAMETER,
  NUM_POINTER_MARKERS,
  POINTER_MARKER_COORDINATES,
  SLOT_DEFINITIONS,
  SLOT_CIRCLE_DIAMETER,
  EVENT_CARDS,
  POLICY_ACTION_CARDS,
  TECHNOLOGY_ACTION_CARDS,
};
