import { cast, call } from './core';
import { GenServer } from './GenServer';

const _process = GenServer({
  name: 'Registry',
  initialState: {
    processMap: {}
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
      const { process, name} = msg;
      state.processMap[name] = process;
      return state;
    },
    lookup: (self, state, msg) => {
      const { name } = msg;
      return state.processMap[name];
    }
  }
});

export const Registry = {
  create: (process, name) => {
    return call(_process, { type: 'create', process, name});
  },
  lookup: (name) => {
    return call(_process, {type: 'lookup', name});
  }
}
