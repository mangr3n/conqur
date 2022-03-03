import { create, call, cast, destroy } from './core';
export type { Process, ProcessID, ProcessAccessor } from './types';
import { GenServer } from './GenServer';
import { Registry } from './Registry';
import { State } from './State';
import { Bus } from './Bus';
import _Utils from './util/index';

export const Utils = _Utils;

declare let mount: () => void;
// Mount provides runtime access to the APIs
// in the Browser Console or in the Node shell.
// This is purely for debugging purposes, not for
// creating code.
// To enable simply require('conqur').mount();
//
const result = {
  create, call, cast, destroy, GenServer, Registry, State, Bus, Utils, mount
};

mount = () => {
  Utils.mountNamespace('conqur',result);
};

export default result;