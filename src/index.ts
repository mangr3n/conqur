import { 
  create as _create, 
  call as _call, 
  cast as _cast, 
  destroy as _destroy 
} from './core';
export type { Process, ProcessID, ProcessAccessor } from './types';
import { GenServer as _GenServer } from './GenServer';
import { Registry as _Registry } from './Registry';
import { State as _State} from './State';
import { Bus as _Bus } from './Bus';
import _Utils from './util/index';

export const Utils = _Utils;
export const create = _create;
export const call = _call;
export const cast = _cast;
export const destroy = _destroy;
export const GenServer = _GenServer;
export const Registry = _Registry;
export const State = _State;
export const Bus = _Bus;


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