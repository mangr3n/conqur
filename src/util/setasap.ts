// Schedules work off the stack
// It will push to the microtask queue (processed first after stack)
// Or if a certain amount of time has passed, it will push to the event loop
// This allows eventhandlers and renderering to fire.
import 'setimmediate';

import { getSelf } from './self';
const self = getSelf();

type Callback = () => void;

const queueMicrotask = (() => {
  if (self.queueMicrotask !== undefined) {
    return self.queueMicrotask;
  } else if (self.process.nextTick !== undefined) {
    return self.process.nextTick;
  } else {
    const unusedNodes: HTMLElement[] = [];
    return (callback: Callback) => {
      let hiddenDiv: HTMLElement | null | undefined;
      if (unusedNodes.length !== 0) {
        hiddenDiv = unusedNodes.pop();
      } else {
        hiddenDiv = document.createElement('div');
      }
      const obs = new MutationObserver(() => {
        callback();
        obs.disconnect();
        if (hiddenDiv !== null) {
          unusedNodes.push(hiddenDiv as HTMLElement);
        }
        hiddenDiv = null;
      });
      obs.observe(hiddenDiv as HTMLElement, { attributes: true });
      (hiddenDiv as HTMLElement).setAttribute('i', '1');
    };
  }
})();

const setImmediate = self.setImmediate;

let lastTimeToEventLoop: number | null = null;
// let countToTaskQueue = 0;
export const setAsap = (callback: Callback) => {
  if (lastTimeToEventLoop == null) {
    lastTimeToEventLoop = Date.now();
  }
  if (Date.now() - lastTimeToEventLoop > 20) {
    setImmediate(callback);
    lastTimeToEventLoop = null;
    return;
  }
  queueMicrotask(callback);
};
