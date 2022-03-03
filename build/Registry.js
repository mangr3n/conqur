import { call } from './core';
import { GenServer } from './GenServer';
import { getSelf } from './util/self';
var _self = getSelf();
if (!_self.hasOwnProperty('_registry')) {
    _self._registry = GenServer({
        name: 'Registry',
        initialState: {
            processMap: {}
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
            }
        }
    });
}
export var Registry = {
    create: function (process, name) {
        return call(_self._registry, { type: 'create', process: process, name: name });
    },
    lookup: function (name) {
        return call(_self._registry, { type: 'lookup', name: name });
    }
};
