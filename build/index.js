import { create, call, cast, destroy } from './core';
import { GenServer } from './GenServer';
import { Registry } from './Registry';
import { State } from './State';
import { Bus } from './Bus';
import _Utils from './util/index';
export var Utils = _Utils;
// Mount provides runtime access to the APIs
// in the Browser Console or in the Node shell.
// This is purely for debugging purposes, not for
// creating code.
// To enable simply require('conqur').mount();
//
var result = {
    create: create, call: call, cast: cast, destroy: destroy, GenServer: GenServer, Registry: Registry, State: State, Bus: Bus, Utils: Utils, mount: mount
};
mount = function () {
    Utils.mountNamespace('conqur', result);
};
export default result;
