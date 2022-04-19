import { cast, call } from './core';
import { GenServer } from './GenServer';
import { Process, ProcessID } from './types';
import { getSelf } from './util/self';

const _self: any = getSelf();
if (!_self.hasOwnProperty('_registry')) {
  _self._registry = GenServer({
    name: 'Registry',
    initialState: {
      processMap: {},
    },
    castHandlers: {
      create: (self, state, msg) => {
        const { process, name } = msg;
        state.processMap[name] = process;
        return state;
      },
    },
    callHandlers: {
      create: (self, state, msg) => {
        const { process, name } = msg;
        state.processMap[name] = process;
        return state;
      },
      lookup: (self, state, msg) => {
        const { name } = msg;
        return state.processMap[name];
      },
    },
  });
}

export const Registry = {
  create: (process: ProcessID, name: string) => {
    return call(_self._registry, { type: 'create', process, name });
  },
  lookup: (name: string) => {
    return call(_self._registry, { type: 'lookup', name });
  },
};
