export { create, call, cast, destroy } from './core';
export { Process, ProcessID, ProcessAccessor } from './types';
export { GenServer } from './GenServer';
export { Registry } from './Registry';
export { State } from './State';
export { Bus } from './Bus';


// Mount provides runtime access to the APIs
// in the Browser Console or in the Node shell.
// This is purely for debugging purposes, not for
// creating code.
// To enable simply require('conqur').mount();
//
export const mount = () => {
  const Utils = require('./util/index').default;
  Utils.mountNamespace('conqur',require('./index'));
  Utils.mountNamespace('conqur.Utils',Utils);
};