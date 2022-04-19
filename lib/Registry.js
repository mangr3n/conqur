"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registry = void 0;
var core_1 = require("./core");
var GenServer_1 = require("./GenServer");
var self_1 = require("./util/self");
var _self = self_1.getSelf();
if (!_self.hasOwnProperty('_registry')) {
    _self._registry = GenServer_1.GenServer({
        name: 'Registry',
        initialState: {
            processMap: {},
        },
        castHandlers: {
            create: function (self, state, msg) {
                var process = msg.process, name = msg.name;
                state.processMap[name] = process;
                return state;
            },
        },
        callHandlers: {
            create: function (self, state, msg) {
                var process = msg.process, name = msg.name;
                state.processMap[name] = process;
                return state;
            },
            lookup: function (self, state, msg) {
                var name = msg.name;
                return state.processMap[name];
            },
        },
    });
}
exports.Registry = {
    create: function (process, name) {
        return core_1.call(_self._registry, { type: 'create', process: process, name: name });
    },
    lookup: function (name) {
        return core_1.call(_self._registry, { type: 'lookup', name: name });
    },
};
