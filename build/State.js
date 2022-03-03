import { call } from './core';
import { GenServer } from './GenServer';
import { Bus } from './Bus';
import { Registry } from './Registry';
import Utils from './util';
var isNil = Utils.isNil;
var correctIndex = function (index) { return isNaN(parseInt(index)) ? index : parseInt(index); };
var isObjectIndex = function (index) { return isNaN(parseInt(index)); };
var isArrayIndex = function (index) { return !isObjectIndex(index); };
var assignNestedValue = function (remainingPath, value, currentTarget) {
    if (remainingPath.length == 0) {
        return value;
    }
    else {
        var index = correctIndex(remainingPath.shift());
        if (remainingPath.length == 0) {
            currentTarget[index] = value;
            return currentTarget;
        }
        else {
            return assignNestedValue(remainingPath, value, currentTarget[index]);
        }
    }
};
var deleteItemAt = function (remainingPath, currentTarget) {
    if (currentTarget === undefined)
        return;
    if (remainingPath.length == 0)
        return;
    if (remainingPath.length == 1) {
        delete currentTarget[remainingPath[0]];
        return;
    }
    var index = correctIndex(remainingPath.shift());
    deleteItemAt(remainingPath, currentTarget[index]);
    return;
};
var getNestedValue = function (remainingPath, currentTarget) {
    if (currentTarget === undefined)
        return undefined;
    if (remainingPath.length == 0) {
        return currentTarget;
    }
    else {
        var index = correctIndex(remainingPath.shift());
        return getNestedValue(remainingPath, currentTarget[index]);
    }
};
var getState = function (scope, busName) {
    var busApi = Bus.getBus(busName);
    var registryName = "State[" + scope + "]";
    if (isNil(Registry.lookup(registryName))) {
        var _processID = GenServer({
            name: registryName,
            initialState: {},
            castHandlers: {
            // Are there any?
            },
            callHandlers: {
                set: function (self, state, msg) {
                    var name = msg.name, value = msg.value;
                    var oldValue = getNestedValue(name.split('.'), state);
                    var path = name.split('.');
                    var firstLeg = path.shift();
                    state[firstLeg] = assignNestedValue(path, value, state[firstLeg]);
                    busApi.sendEvent({ type: name + ":changed", oldValue: oldValue, newValue: value });
                    return;
                },
                unset: function (self, state, msg) {
                    var name = msg.name;
                    var oldValue = getNestedValue(name.split('.'), state);
                    deleteItemAt(name.split('.'), state);
                    busApi.sendEvent({ type: name + ":removed", oldValue: oldValue });
                    return;
                },
                get: function (self, state, msg) {
                    var name = msg.name;
                    if (isNil(name) || undefined === name || name == '' || name == '.') {
                        return getNestedValue([], state);
                    }
                    else {
                        var path = name.split('.');
                        return getNestedValue(path, state);
                    }
                }
            }
        });
        Registry.create(_processID, registryName);
    }
    return {
        getState: getState,
        set: function (name, value) {
            call(Registry.lookup(registryName), { type: 'set', name: name, value: value });
        },
        unset: function (name) {
            call(Registry.lookup(registryName), { type: 'unset', name: name });
        },
        get: function (name) {
            if (name === void 0) { name = null; }
            return call(Registry.lookup(registryName), { type: 'get', name: name });
        }
    };
};
export var State = getState('global', 'mainBus');
