"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mount = exports.Bus = exports.State = exports.Registry = exports.GenServer = exports.destroy = exports.cast = exports.call = exports.create = exports.Utils = void 0;
var core_1 = require("./core");
var GenServer_1 = require("./GenServer");
var Registry_1 = require("./Registry");
var State_1 = require("./State");
var Bus_1 = require("./Bus");
var index_1 = require("./util/index");
exports.Utils = index_1.default;
exports.create = core_1.create;
exports.call = core_1.call;
exports.cast = core_1.cast;
exports.destroy = core_1.destroy;
exports.GenServer = GenServer_1.GenServer;
exports.Registry = Registry_1.Registry;
exports.State = State_1.State;
exports.Bus = Bus_1.Bus;
var result = null;
// Mount provides runtime access to the APIs
// in the Browser Console or in the Node shell.
// This is purely for debugging purposes, not for
// creating code.
var mount = function () {
    exports.Utils.mountNamespace('conqur', result);
};
exports.mount = mount;
result = {
    create: exports.create,
    call: exports.call,
    cast: exports.cast,
    destroy: exports.destroy,
    GenServer: exports.GenServer,
    Registry: exports.Registry,
    State: exports.State,
    Bus: exports.Bus,
    Utils: exports.Utils,
    mount: exports.mount,
};
exports.default = result;
