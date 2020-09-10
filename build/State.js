"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
var core_1 = require("./core");
var GenServer_1 = require("./GenServer");
var Bus_1 = require("./Bus");
var Registry_1 = require("./Registry");
var util_1 = require("./util");
var correctIndex = function (index) { return isNaN(parseInt(index)) ? index : parseInt(index); };
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
var getNestedValue = function (remainingPath, currentTarget) {
    if (remainingPath.length == 0) {
        return currentTarget;
    }
    else {
        var index = correctIndex(remainingPath.shift());
        return getNestedValue(remainingPath, currentTarget[index]);
    }
};
var getState = function (scope, busName) {
    var busApi = Bus_1.Bus.getBus(busName);
    var registryName = "State[" + scope + "]";
    if (Registry_1.Registry.lookup(registryName) === null) {
        var _processID = GenServer_1.GenServer({
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
                get: function (self, state, msg) {
                    var name = msg.name;
                    if (util_1.isNil(name) || undefined === name || name == '' || name == '.') {
                        return getNestedValue([], state);
                    }
                    else {
                        var path = name.split('.');
                        return getNestedValue(path, state);
                    }
                }
            }
        });
        Registry_1.Registry.create(_processID, registryName);
    }
    return {
        getState: getState,
        set: function (name, value) {
            core_1.call(Registry_1.Registry.lookup(registryName), { type: 'set', name: name, value: value });
        },
        get: function (name) {
            if (name === void 0) { name = null; }
            return core_1.call(Registry_1.Registry.lookup(registryName), { type: 'get', name: name });
        }
    };
};
exports.State = getState('global', 'mainBus');
