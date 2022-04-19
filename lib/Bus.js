"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bus = void 0;
var core_1 = require("./core");
var Registry_1 = require("./Registry");
var GenServer_1 = require("./GenServer");
var getBus = function (name) {
    var _registryName = "Bus[" + name + "]";
    if (Registry_1.Registry.lookup(_registryName) == null) {
        var debugLabel_1 = function () { return _registryName + "/[pid: " + bus_1 + "]"; };
        var bus_1 = GenServer_1.GenServer({
            initialState: {
                _handlerId: 0,
                idMap: {},
                handlers: {},
                handleQueue: [],
                _queueInProcess: [],
                _notHandledQueue: [],
                _inProcess: false,
                _pending: false,
            },
            name: _registryName,
            castHandlers: {
                init: function (self, state, msg) {
                    if (state.debug) {
                        console.log(debugLabel_1() + "/init", { state: state, msg: msg });
                    }
                    var handlers = msg.handlers;
                    for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
                        var handlerItem = handlers_1[_i];
                        var event_1 = handlerItem.event, options = handlerItem.options, handler = handlerItem.handler;
                        var handlerId = core_1.call(self(), { type: 'registerHandler', options: options, event: event_1, handler: handler });
                    }
                    return state;
                },
                processQueue: function (self, state, _msg) {
                    if (!!state.debug) {
                        console.log(debugLabel_1() + "/processQueue", { state: state });
                    }
                    if (!state._inProcess && state.handleQueue.length > 0) {
                        state._inProcess = true;
                        // Copy the queue to _queueInProcess
                        // Empty the queue to accept new events
                        state._queueInProcess = state.handleQueue;
                        state.handleQueue = [];
                        state._notHandledQueue = [];
                        while (state._queueInProcess.length > 0) {
                            var handleEntry = state._queueInProcess.shift();
                            var event_2 = handleEntry.event, handler = handleEntry.handler;
                            var id = handler.id, options = handler.options;
                            var _handler = handler.handler;
                            handleEntry.tries++;
                            try {
                                var result = _handler(event_2);
                                if (result === undefined || result) {
                                    if (options.once) {
                                        core_1.call(self(), { type: 'removeHandler', id: id });
                                    }
                                }
                                else {
                                    state._notHandledQueue.push(handleEntry);
                                }
                            }
                            catch (error) {
                                if (options.once) {
                                    core_1.call(self(), { type: 'removeHandler', id: id });
                                }
                                core_1.call(self(), { type: 'sendEvent', event: { type: 'error', error: error, source: handleEntry } });
                            }
                        }
                        while (state._notHandledQueue.length > 0) {
                            var handleEntry = state._notHandledQueue.shift();
                            state.handleQueue.push(handleEntry);
                        }
                        state._inProcess = false;
                        if (state._pending) {
                            state._pending = false;
                            core_1.cast(self(), { type: 'processQueue' });
                        }
                    }
                    return state;
                },
            },
            callHandlers: {
                debug: function (self, state, msg) {
                    var turnOn = msg.turnOn;
                    state.debug = turnOn;
                    return state.debug;
                },
                logEvents: function (self, state, msg) {
                    var turnOn = msg.turnOn;
                    state.logEvents = turnOn;
                    return state.logEvents;
                },
                registerHandler: function (self, state, msg) {
                    if (!!state.debug) {
                        console.log(debugLabel_1() + "/registerHandler", { state: state, msg: msg });
                    }
                    var event = msg.event;
                    var id = state._handlerId++;
                    // delete msg['type'];
                    var handlerEntry = __assign(__assign({}, msg), { id: id });
                    state.idMap[id] = handlerEntry;
                    if (!state.handlers.hasOwnProperty(event)) {
                        state.handlers[event] = [];
                    }
                    state.handlers[event].push(handlerEntry);
                    return id;
                },
                sendEvent: function (self, state, msg) {
                    if (!!state.debug) {
                        console.log(debugLabel_1() + "/sendEvent", { state: state, msg: msg });
                    }
                    if (!!state.logEvents) {
                        console.log(debugLabel_1() + "/event: ", msg.event);
                    }
                    var event = msg.event;
                    var type = event.type;
                    if (!state.handlers.hasOwnProperty(type)) {
                        if (!!state.debug)
                            console.log(debugLabel_1() + " has no handlers for '" + type + "'");
                    }
                    else {
                        var handlers = state.handlers[type];
                        for (var _i = 0, handlers_2 = handlers; _i < handlers_2.length; _i++) {
                            var handlerItem = handlers_2[_i];
                            var handlerEntry = handlerItem;
                            state.handleQueue.push({ handler: handlerEntry, event: event, tries: 0 });
                        }
                    }
                    if (state._inProcess) {
                        state._pending = true;
                    }
                    else {
                        core_1.cast(self(), { type: 'processQueue' });
                    }
                    return state;
                },
                removeHandler: function (self, state, msg) {
                    if (!!state.debug) {
                        console.log(debugLabel_1() + "/removeHandler", { state: state, msg: msg });
                    }
                    var id = msg.id;
                    if (state.idMap[id]) {
                        var event_3 = state.idMap[id].event;
                        var handlers = state.handlers[event_3];
                        var newHandlers = [];
                        for (var _i = 0, handlers_3 = handlers; _i < handlers_3.length; _i++) {
                            var entry = handlers_3[_i];
                            if (id === entry.id)
                                continue;
                            newHandlers.push(entry);
                        }
                        state.handlers[event_3] = newHandlers;
                        delete state.idMap[id];
                    }
                },
            },
        });
        Registry_1.Registry.create(bus_1, _registryName);
    }
    return {
        getBus: getBus,
        initialize: function (handlers) {
            core_1.cast(Registry_1.Registry.lookup(_registryName), { type: 'init', handlers: handlers });
        },
        sendEvent: function (event) {
            core_1.call(Registry_1.Registry.lookup(_registryName), { type: 'sendEvent', event: event });
            return;
        },
        handle: function (event, handler, options) {
            if (options === void 0) { options = {}; }
            return core_1.call(Registry_1.Registry.lookup(_registryName), { type: 'registerHandler', event: event, handler: handler, options: options });
        },
        handleOnce: function (event, handler) {
            return core_1.call(Registry_1.Registry.lookup(_registryName), { type: 'registerHandler', event: event, handler: handler, options: { once: true } });
        },
        unhandle: function (handlerId) {
            return core_1.call(Registry_1.Registry.lookup(_registryName), { type: 'removeHandler', id: handlerId });
        },
        debug: function (turnOn) {
            if (turnOn === void 0) { turnOn = true; }
            return core_1.call(Registry_1.Registry.lookup(_registryName), { type: 'debug', turnOn: turnOn });
        },
        logEvents: function (turnOn) {
            if (turnOn === void 0) { turnOn = true; }
            return core_1.call(Registry_1.Registry.lookup(_registryName), { type: 'logEvents', turnOn: turnOn });
        },
    };
};
exports.Bus = getBus('mainBus');
