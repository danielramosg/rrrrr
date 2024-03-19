import type TypedEmitter from 'typed-emitter';
import { EventEmitter } from 'events';

import {
  Tuio11Object,
  Tuio11Cursor,
  Tuio11Blob,
  type Tuio11Listener,
} from './tuio_client_js';

export type Tuio11Events = {
  'tuio-object-add': (tuioObject: Tuio11Object) => void;
  'tuio-object-update': (tuioObject: Tuio11Object) => void;
  'tuio-object-remove': (tuioObject: Tuio11Object) => void;
  'tuio-cursor-add': (tuioCursor: Tuio11Cursor) => void;
  'tuio-cursor-update': (tuioCursor: Tuio11Cursor) => void;
  'tuio-cursor-remove': (tuioCursor: Tuio11Cursor) => void;
  'tuio-blob-add': (tuioBlob: Tuio11Blob) => void;
  'tuio-blob-update': (tuioBlob: Tuio11Blob) => void;
  'tuio-blob-remove': (tuioBlob: Tuio11Blob) => void;
  'refresh': (frameTime: number) => void;
};

export class Tuio11EventEmitter
  extends (EventEmitter as new () => TypedEmitter<Tuio11Events>)
  implements Tuio11Listener
{
  addTuioObject(tuioObject: Tuio11Object) {
    this.emit('tuio-object-add', tuioObject);
  }

  updateTuioObject(tuioObject: Tuio11Object) {
    this.emit('tuio-object-update', tuioObject);
  }

  removeTuioObject(tuioObject: Tuio11Object) {
    this.emit('tuio-object-remove', tuioObject);
  }

  addTuioCursor(tuioCursor: Tuio11Cursor) {
    this.emit('tuio-cursor-add', tuioCursor);
  }

  updateTuioCursor(tuioCursor: Tuio11Cursor) {
    this.emit('tuio-cursor-update', tuioCursor);
  }

  removeTuioCursor(tuioCursor: Tuio11Cursor) {
    this.emit('tuio-cursor-remove', tuioCursor);
  }

  addTuioBlob(tuioBlob: Tuio11Blob) {
    this.emit('tuio-blob-add', tuioBlob);
  }

  updateTuioBlob(tuioBlob: Tuio11Blob) {
    this.emit('tuio-blob-update', tuioBlob);
  }

  removeTuioBlob(tuioBlob: Tuio11Blob) {
    this.emit('tuio-blob-remove', tuioBlob);
  }

  refresh(frameTime: number) {
    this.emit('refresh', frameTime);
  }
}
