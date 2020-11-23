"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mount = exports.Utils = exports.Bus = exports.State = exports.Registry = exports.GenServer = exports.destroy = exports.cast = exports.call = exports.create = void 0;
var core_1 = require("./core");
Object.defineProperty(exports, "create", { enumerable: true, get: function () { return core_1.create; } });
Object.defineProperty(exports, "call", { enumerable: true, get: function () { return core_1.call; } });
Object.defineProperty(exports, "cast", { enumerable: true, get: function () { return core_1.cast; } });
Object.defineProperty(exports, "destroy", { enumerable: true, get: function () { return core_1.destroy; } });
var GenServer_1 = require("./GenServer");
Object.defineProperty(exports, "GenServer", { enumerable: true, get: function () { return GenServer_1.GenServer; } });
var Registry_1 = require("./Registry");
Object.defineProperty(exports, "Registry", { enumerable: true, get: function () { return Registry_1.Registry; } });
var State_1 = require("./State");
Object.defineProperty(exports, "State", { enumerable: true, get: function () { return State_1.State; } });
var Bus_1 = require("./Bus");
Object.defineProperty(exports, "Bus", { enumerable: true, get: function () { return Bus_1.Bus; } });
exports.Utils = require('./util/index').default;
// Mount provides runtime access to the APIs
// in the Browser Console or in the Node shell.
// This is purely for debugging purposes, not for
// creating code.
// To enable simply require('conqur').mount();
//
var mount = function () {
    var Utils = require('./util/index').default;
    Utils.mountNamespace('conqur', require('./index'));
    Utils.mountNamespace('conqur.Utils', Utils);
};
exports.mount = mount;
