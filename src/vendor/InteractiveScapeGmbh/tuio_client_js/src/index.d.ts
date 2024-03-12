/* eslint-disable max-classes-per-file */
export class TuioConnectionType {
  static UDP: TuioConnectionType;
  static Websocket: TuioConnectionType;

  constructor(name: string);

  toString(): string;
}

export class TuioReceiver {
  constructor();

  connect(): void;
  disconnect(): void;

  protected onOscMessage(oscMessage: unknown): void;

  addMessageListener(
    address: string,
    callback: (message: unknown) => void,
  ): void;
}

export class TuioState {
  static Added: TuioState;
  static Accelerating: TuioState;
  static Decelerating: TuioState;
  static Stopped: TuioState;
  static Removed: TuioState;
  static Rotating: TuioState;
  static Idle: TuioState;

  constructor(name: string);

  toString(): string;
}

export class TuioTime {
  constructor(seconds: number, microSeconds: number);

  static fromOscTime(oscTime: unknown): TuioTime;

  subtract(tuioTime: TuioTime): TuioTime;

  getTotalMilliseconds(): number;

  static init(): void;

  static getCurrentTime(): TuioTime;
}

export class WebsocketTuioReceiver extends TuioReceiver {
  constructor(url: string);

  connect(): void;

  disconnect(): void;
}

export class Tuio11Point {
  constructor(startTime: number, xPos: number, yPos: number);

  get startTime(): number;

  get xPos(): number;

  get yPos(): number;
}

export class Tuio11Container extends Tuio11Point {
  MAX_PATH_LENGTH: number;

  constructor(
    startTime: number,
    sessionId: number,
    xPos: number,
    yPos: number,
    xSpeed: number,
    ySpeed: number,
    motionAccel: number,
  );

  get currentTime(): number;

  get sessionId(): number;

  get xSpeed(): number;

  get ySpeed(): number;

  get motionSpeed(): number;

  get motionAccel(): number;

  get state(): number;

  get path(): number;
}

export class Tuio11Object extends Tuio11Container {
  constructor(
    startTime: number,
    sessionId: number,
    symbolId: number,
    xPos: number,
    yPos: number,
    angle: number,
    xSpeed: number,
    ySpeed: number,
    rotationSpeed: number,
    motionAccel: number,
    rotationAccel: number,
  );

  get symbolId(): number;

  get angle(): number;

  get rotationSpeed(): number;

  get rotationAccel(): number;
}

export class Tuio11Cursor extends Tuio11Container {
  constructor(
    startTime: number,
    sessionId: number,
    cursorId: number,
    xPos: number,
    yPos: number,
    xSpeed: number,
    ySpeed: number,
    motionAccel: number,
  );
  get cursorId(): number;
}

export class Tuio11Blob extends Tuio11Container {
  constructor(
    startTime: number,
    blobId: number,
    symbolId: number,
    xPos: number,
    yPos: number,
    angle: number,
    width: number,
    height: number,
    area: number,
    xSpeed: number,
    ySpeed: number,
    rotationSpeed: number,
    motionAccel: number,
    rotationAccel: number,
  );
  get blobId(): number;

  get angle(): number;

  get width(): number;

  get height(): number;

  get area(): number;

  get rotationSpeed(): number;

  get rotationAccel(): number;
}

export interface Tuio11Listener {
  addTuioObject(tuioObject: Tuio11Object): void;
  updateTuioObject(tuioObject: Tuio11Object): void;

  removeTuioObject(tuioObject: Tuio11Object): void;

  addTuioCursor(tuioCursor: Tuio11Cursor): void;

  updateTuioCursor(tuioCursor: Tuio11Cursor): void;

  removeTuioCursor(tuioCursor: Tuio11Cursor): void;

  addTuioBlob(tuioBlob: Tuio11Blob): void;

  updateTuioBlob(tuioBlob: Tuio11Blob): void;

  removeTuioBlob(tuioBlob: Tuio11Blob): void;

  refresh(frameTime: number): void;
}

export class Tuio11Client {
  constructor(tuioReceiver: TuioReceiver);

  connect(): void;

  disconnect(): void;

  addTuioListener(tuioListener: Tuio11Listener): void;

  removeTuioListener(tuioListener: Tuio11Listener): void;

  removeAllTuioListeners(): void;

  getTuioObjects(): IterableIterator<Tuio11Object>;

  getTuioCursors(): IterableIterator<Tuio11Cursor>;

  getTuioBlobs(): IterableIterator<Tuio11Blob>;

  getTuioObject(sessionId: number): Tuio11Object | null;

  getTuioCursor(sessionId: number): Tuio11Cursor | null;

  getTuioBlob(sessionId: number): Tuio11Blob | null;
}
