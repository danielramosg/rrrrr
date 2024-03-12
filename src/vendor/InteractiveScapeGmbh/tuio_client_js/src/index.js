/// <reference path="./index.d.ts" />

// common code
import { TuioConnectionType } from './common/TuioConnectionType.js';
import { TuioReceiver } from './common/TuioReceiver.js';
import { TuioState } from './common/TuioState.js';
import { TuioTime } from './common/TuioTime.js';
import { WebsocketTuioReceiver } from './common/WebsocketTuioReceiver.js';

export {
  TuioConnectionType,
  TuioReceiver,
  TuioState,
  TuioTime,
  WebsocketTuioReceiver,
};

// TUIO 1.1 code
import { Tuio11Blob } from './tuio11/Tuio11Blob.js';
import { Tuio11Client } from './tuio11/Tuio11Client.js';
import { Tuio11Container } from './tuio11/Tuio11Container.js';
import { Tuio11Cursor } from './tuio11/Tuio11Cursor.js';
import { Tuio11Object } from './tuio11/Tuio11Object.js';
import { Tuio11Point } from './tuio11/Tuio11Point.js';

export {
  Tuio11Blob,
  Tuio11Client,
  Tuio11Container,
  Tuio11Cursor,
  Tuio11Object,
  Tuio11Point,
};

/* Exclude TUIO 2.0 code for now
// TUIO 2.0 code
import { Tuio20Bounds } from './tuio20/Tuio20Bounds.js';
import { Tuio20Client } from './tuio20/Tuio20Client.js';
import { Tuio20Component } from './tuio20/Tuio20Component.js';
import { Tuio20Object } from './tuio20/Tuio20Object.js';
import { Tuio20Point } from './tuio20/Tuio20Point.js';
import { Tuio20Pointer } from './tuio20/Tuio20Pointer.js';
import { Tuio20Symbol } from './tuio20/Tuio20Symbol.js';
import { Tuio20Token } from './tuio20/Tuio20Token.js';

export {
  Tuio20Bounds,
  Tuio20Client,
  Tuio20Component,
  Tuio20Object,
  Tuio20Point,
  Tuio20Pointer,
  Tuio20Symbol,
  Tuio20Token,
};
*/
