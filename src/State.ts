import { call, cast } from './core';
import { GenServer } from './GenServer';
import { Bus } from './Bus';
import { Registry } from './Registry';
import { isNil } from './util';

const correctIndex = (index) => isNaN(parseInt(index)) ? index : parseInt(index);

const assignNestedValue = (remainingPath, value, currentTarget) => {
  if (remainingPath.length == 0) {
    return value;
  } else {
    const index = correctIndex(remainingPath.shift());
    if (remainingPath.length == 0) {
      currentTarget[index] = value;
      return currentTarget;
    } else {
      return assignNestedValue(remainingPath, value, currentTarget[index]);
    }
  }
};

const getNestedValue = (remainingPath, currentTarget) => {
  if (remainingPath.length == 0) {
    return currentTarget;
  } else {
    const index = correctIndex(remainingPath.shift());
    return getNestedValue(remainingPath, currentTarget[index]);
  }
};

const getState = (scope, busName) => {

  const busApi = Bus.getBus(busName);

  const registryName = `State[${scope}]`;
  if (!Registry.lookup(registryName) !== null) {
    Registry.create(
      GenServer({
        name: registryName,
        initialState: {},
        castHandlers: {
          // Are there any?
        },
        callHandlers: {
          set: (self, state, msg) => {
            const { name, value } = msg;
            const oldValue = getNestedValue(name.split('.'), state);
            const path = name.split('.');
            const firstLeg = path.shift();
            state[firstLeg] = assignNestedValue(path, value, state[firstLeg]);
            busApi.sendEvent({ type: `${name}:changed`, oldValue, newValue: value });
            return;
          },
          get: (self, state, msg) => {
            const { name } = msg;
            if (isNil(name) || undefined === name || name == '' || name == '.') {
              return getNestedValue([],state);
            } else {
              const path = name.split('.');
              return getNestedValue(path, state);
            }
          }
        }
      }),
      registryName
    );
  }

  return {
    getState,
    set: (name, value) => {
      call(Registry.lookup(registryName), { type: 'set', name, value });
    },
    get: (name:string = null) => {
      return call(Registry.lookup(registryName), { type: 'get', name });
    }
  };
};

export const State  = getState('global', 'mainBus');