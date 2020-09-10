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
var getBus = null;
getBus = function (name) {
    var _registryName = "Bus[" + name + "]";
    if (Registry_1.Registry.lookup(_registryName) == null) {
        var bus_1 = null;
        var debugLabel_1 = function () { return _registryName + "/[pid: " + bus_1 + "]"; };
        bus_1 = GenServer_1.GenServer({
            initialState: {
                _handlerId: 0,
                idMap: {},
                handlers: {},
                handleQueue: []
            },
            name: _registryName,
            castHandlers: {
                init: function (self, state, msg) {
                    if (state.debug) {
                        console.log(debugLabel_1() + "/init", { state: state, msg: msg });
                    }
                    var handlers = msg.handlers;
                    for (var idx = 0; idx < handlers.length; idx++) {
                        var _a = handlers[idx], event_1 = _a.event, options = _a.options, handler = _a.handler;
                        var handlerId = core_1.call(self(), { type: 'registerHandler', options: options, event: event_1, handler: handler });
                    }
                    return state;
                },
                processQueue: function (self, state, _msg) {
                    if (!!state.debug) {
                        console.log(debugLabel_1() + "/processQueue", { state: state });
                    }
                    if (state.handleQueue.length > 0) {
                        var handleEntry = state.handleQueue.shift();
                        var event_2 = handleEntry.event, handler = handleEntry.handler;
                        var id = handler.id, options = handler.options;
                        var _handler = handler.handler;
                        if (!_handler(event_2)) {
                            state.handleQueue.push(handleEntry);
                            if (state.handleQueue.length > 1) {
                                // possible infinite loop...
                                core_1.cast(self(), { type: 'processQueue' });
                            }
                        }
                        else {
                            if (options.once) {
                                core_1.call(self(), { type: 'removeHandler', id: id });
                            }
                        }
                    }
                    return state;
                }
            },
            callHandlers: {
                debug: function (self, state, msg) {
                    if (state.debug == undefined || !state.debug) {
                        state.debug = true;
                    }
                    else {
                        state.debug = false;
                    }
                    return state.debug;
                },
                registerHandler: function (self, state, msg) {
                    if (!!state.debug) {
                        console.log(debugLabel_1() + "/registerHandler", { state: state, msg: msg });
                    }
                    var event = msg.event;
                    var id = state._handlerId++;
                    delete msg['type'];
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
                    var event = msg.event;
                    var type = event.type;
                    if (!state.handlers.hasOwnProperty(type)) {
                        console.log(debugLabel_1() + " has no handlers for '" + type + "'");
                    }
                    else {
                        var handlers = state.handlers[type];
                        for (var idx = 0; idx < handlers.length; idx++) {
                            var handlerEntry = handlers[idx];
                            state.handleQueue.push({ handler: handlerEntry, event: event });
                        }
                    }
                    core_1.cast(self(), { type: 'processQueue' });
                    return state;
                },
                removeHandler: function (self, state, msg) {
                    if (!!state.debug) {
                        console.log(debugLabel_1() + "/removeHandler", { state: state, msg: msg });
                    }
                    var id = msg.id;
                    var event = state.idMap[id].event;
                    delete state.idMap[id];
                    var handlers = state.handlers[event];
                    var newHandlers = [];
                    for (var idx = 0; idx < handlers.length; idx++) {
                        var entry = handlers[idx];
                        if (id == entry.id)
                            continue;
                        newHandlers.push(entry);
                    }
                    state.handlers[event] = newHandlers;
                }
            }
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
        debug: function () {
            return core_1.call(Registry_1.Registry.lookup(_registryName), { type: 'debug' });
        }
    };
};
exports.Bus = getBus('mainBus');
