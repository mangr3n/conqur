"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAsap = void 0;
// Schedules work off the stack
// It will push to the microtask queue (processed first after stack)
// Or if a certain amount of time has passed, it will push to the event loop
// This allows eventhandlers and renderering to fire.
require("setimmediate");
var self_1 = require("./self");
var self = self_1.getSelf();
var queueMicrotask = (function () {
    if (self.queueMicrotask !== undefined) {
        return self.queueMicrotask;
    }
    else if (self.process.nextTick !== undefined) {
        return self.process.nextTick;
    }
    else {
        var unusedNodes_1 = [];
        return function (callback) {
            var hiddenDiv;
            if (unusedNodes_1.length !== 0) {
                hiddenDiv = unusedNodes_1.pop();
            }
            else {
                hiddenDiv = document.createElement('div');
            }
            var obs = new MutationObserver(function () {
                callback();
                obs.disconnect();
                if (hiddenDiv !== null) {
                    unusedNodes_1.push(hiddenDiv);
                }
                hiddenDiv = null;
            });
            obs.observe(hiddenDiv, { attributes: true });
            hiddenDiv.setAttribute('i', '1');
        };
    }
})();
var setImmediate = self.setImmediate;
var lastTimeToEventLoop = null;
// let countToTaskQueue = 0;
var setAsap = function (callback) {
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
exports.setAsap = setAsap;
