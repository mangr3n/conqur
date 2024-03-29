import { call, cast } from './core';
import { GenServer } from './GenServer';
import { Bus } from './Bus';
import { Registry } from './Registry';
import Utils from './util';

const { isNil } = Utils;

const correctIndex = (index: any) => (isNaN(parseInt(index)) ? index : parseInt(index));

const isObjectIndex = (index: any) => isNaN(parseInt(index));
const isArrayIndex = (index: any) => !isObjectIndex(index);

const assignNestedValue: (path: string[], value: any, target: any) => any = (
  remainingPath: string[],
  value: any,
  currentTarget: any,
) => {
  if (remainingPath.length === 0) {
    return value;
  } else {
    const index = correctIndex(remainingPath.shift());
    if (remainingPath.length === 0) {
      currentTarget[index] = value;
      return currentTarget;
    } else {
      return assignNestedValue(remainingPath, value, currentTarget[index]);
    }
  }
};

const deleteItemAt = (remainingPath: string[], currentTarget: any) => {
  if (currentTarget === undefined) return;
  if (remainingPath.length === 0) return;
  if (remainingPath.length === 1) {
    delete currentTarget[remainingPath[0]];
    return;
  }
  const index = correctIndex(remainingPath.shift());
  deleteItemAt(remainingPath, currentTarget[index]);
  return;
};

const getNestedValue: (x: string[], target: any) => any = (remainingPath: string[], currentTarget: any) => {
  if (currentTarget === undefined) return undefined;
  if (remainingPath.length === 0) {
    return currentTarget;
  } else {
    const index = correctIndex(remainingPath.shift());
    return getNestedValue(remainingPath, currentTarget[index]);
  }
};

const getState = (scope: string, busName: string) => {
  const busApi = Bus.getBus(busName);

  const registryName = `State[${scope}]`;
  if (isNil(Registry.lookup(registryName))) {
    const _processID = GenServer({
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
        unset: (self, state, msg) => {
          const { name } = msg;
          const oldValue = getNestedValue(name.split('.'), state);
          deleteItemAt(name.split('.'), state);
          busApi.sendEvent({ type: `${name}:removed`, oldValue });
          return;
        },
        get: (self, state, msg) => {
          const { name } = msg;
          if (isNil(name) || undefined === name || name === '' || name === '.') {
            return getNestedValue([], state);
          } else {
            const path = name.split('.');
            return getNestedValue(path, state);
          }
        },
      },
    });
    Registry.create(_processID, registryName);
  }

  return {
    getState,
    set: (name: string, value: any) => {
      call(Registry.lookup(registryName), { type: 'set', name, value });
    },
    unset: (name: string) => {
      call(Registry.lookup(registryName), { type: 'unset', name });
    },
    get: (name: string | null = null) => {
      return call(Registry.lookup(registryName), { type: 'get', name });
    },
  };
};

export const State = getState('global', 'mainBus');
