import { create as _create, call as _call, cast as _cast, destroy as _destroy } from './core';
import { GenServer as _GenServer } from './GenServer';
import { Registry as _Registry } from './Registry';
import { State as _State } from './State';
import { Bus as _Bus } from './Bus';
import _Utils from './util/index';
export var Utils = _Utils;
export var create = _create;
export var call = _call;
export var cast = _cast;
export var destroy = _destroy;
export var GenServer = _GenServer;
export var Registry = _Registry;
export var State = _State;
export var Bus = _Bus;
var result = null;
export var mount = function () {
    Utils.mountNamespace('conqur', result);
};
// Mount provides runtime access to the APIs
// in the Browser Console or in the Node shell.
// This is purely for debugging purposes, not for
// creating code.
// To enable simply require('conqur').mount();
//
result = {
    create: create, call: call, cast: cast, destroy: destroy, GenServer: GenServer, Registry: Registry, State: State, Bus: Bus, Utils: Utils, mount: mount
};
export default result;
