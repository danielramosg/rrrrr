import { EventEmitter } from 'events';
import type TypedEmitter from 'typed-emitter';
import { strict as assert } from 'assert';
import { ignorePromise } from './ignore-promise';

type RunnerEvents = {
  play: () => void;
  pause: () => void;
  tick: (
    delta: DOMHighResTimeStamp,
    timestamp: DOMHighResTimeStamp,
    lastTimeStamp: DOMHighResTimeStamp,
    timeStampOffset: DOMHighResTimeStamp,
  ) => void;
};

function getCurrentAnimationTime() {
  const currentAnimationTime = document.timeline?.currentTime;
  if (
    typeof currentAnimationTime === 'undefined' ||
    currentAnimationTime === null
  )
    return performance.now();

  if (typeof currentAnimationTime === 'number') return currentAnimationTime;

  return currentAnimationTime.to('ms').value;
}

class Runner extends (EventEmitter as new () => TypedEmitter<RunnerEvents>) {
  protected shouldRun: boolean = false;

  protected running: boolean = false;

  protected timeStampOffset: DOMHighResTimeStamp = 0;

  protected lastTimeStamp: DOMHighResTimeStamp = getCurrentAnimationTime();

  protected cancelAnimationFrameCallback: (() => void) | null = null;

  play() {
    this.shouldRun = true;
    ignorePromise(this.run());
  }

  pause() {
    this.shouldRun = false;
    if (this.cancelAnimationFrameCallback !== null)
      this.cancelAnimationFrameCallback();
  }

  isPlaying() {
    return this.running;
  }

  isPaused() {
    return !this.running;
  }

  shouldPlay(): boolean {
    return this.shouldRun;
  }

  shouldPause(): boolean {
    return !this.shouldRun;
  }

  togglePlayPause() {
    if (this.shouldRun) this.pause();
    else this.play();
  }

  tick() {
    if (this.isPlaying()) {
      assert(this.cancelAnimationFrameCallback !== null);
      this.cancelAnimationFrameCallback();
    } else {
      this.play();
      this.pause();
    }
  }

  protected async run() {
    if (this.running || !this.shouldRun) return;
    this.running = true;
    this.emit('play');

    // Keep track of the offset between this runner and the global animation time.
    // The offset increases by the time the runner was paused.
    let timeStamp = getCurrentAnimationTime();
    this.timeStampOffset += timeStamp - this.lastTimeStamp;

    // The first tick will be emitted with a delta of 0, i.e. the attached listeners should not progress.
    // If renderers are attached, they should just render the current state.
    this.lastTimeStamp = timeStamp;
    do {
      const delta = timeStamp - this.lastTimeStamp;
      this.emit(
        'tick',
        delta,
        timeStamp,
        this.lastTimeStamp,
        this.timeStampOffset,
      );
      this.lastTimeStamp = timeStamp;

      // Account for the case where the runner has been paused during the tick event
      if (!this.shouldRun) break;

      try {
        // Wait for the next animation frame
        // eslint-disable-next-line no-await-in-loop
        timeStamp = await new Promise<DOMHighResTimeStamp>(
          (resolve, reject) => {
            const requestId = requestAnimationFrame(resolve);
            this.cancelAnimationFrameCallback = () => {
              cancelAnimationFrame(requestId);
              this.cancelAnimationFrameCallback = null;
              if (this.shouldRun) resolve(getCurrentAnimationTime());
              else reject();
            };
          },
        );
      } catch (err) {
        // The runner was paused while waiting for the next animation frame
      }
    } while (this.shouldRun);
    this.running = false;
    this.emit('pause');
  }
}

export { Runner };
export type { RunnerEvents };
