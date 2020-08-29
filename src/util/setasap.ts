declare var require: (string) => any;
// Schedules work off the stack
// It will push to the microtask queue (processed first after stack)
// Or if a certain amount of time has passed, it will push to the event loop
// This allows eventhandlers and renderering to fire.
require('setimmediate');


const self = require('./self').getSelf();



const queueMicrotask = (() => {
  if (self.queueMicrotask !== undefined) {
    return self.queueMicrotask;
  } else if (self.process.nextTick !== undefined) {
    return self.process.nextTick;
  } else {
    const unusedNodes = [];
    return (callback) => {
      let hiddenDiv = null;
      if (unusedNodes.length !== 0) {
        hiddenDiv = unusedNodes.pop();
      } else {
        hiddenDiv = document.createElement('div');
      }
      const obs = new MutationObserver(function () {
        callback();
        obs.disconnect();
        unusedNodes.push(hiddenDiv);
        hiddenDiv = null;
      });
      obs.observe(hiddenDiv, { attributes: true });
      hiddenDiv.setAttribute('i', '1');
    };
  }
})();

const setImmediate = self.setImmediate;

let lastTimeToEventLoop = null;
// let countToTaskQueue = 0;
export const setAsap = (callback) => {
  if (lastTimeToEventLoop == null) {
    lastTimeToEventLoop = Date.now();
  }
  if ((Date.now() - lastTimeToEventLoop) > 20) {
    setImmediate(callback);
    lastTimeToEventLoop = null;
    return;
  }
  queueMicrotask(callback);
};
