import { cast, call } from './core';
import { Registry } from './Registry';
import { GenServer } from './GenServer';
import { ProcessID } from './types';

declare var BusFn;

type HandlerID = number;
type EventType = string;

interface BusEvent {
  type: EventType;
  [index: string]: any;
}

type HandlerFn = (event: BusEvent) => boolean;

interface HandlerRegistration {
  event: EventType;
  handler: HandlerFn;
  options: Object;
}

interface BusAPI {
  getBus: BusFn;
  initialize: ([HandlerRegistration]) => void;
  sendEvent: (event: BusEvent) => void;
  handle: (event: EventType, handler: HandlerFn, options: Object) => HandlerID;
  handleOnce: (event: EventType, handler: HandlerFn) => HandlerID;
  unhandle: (id: HandlerID) => void;
  debug: () => boolean;
}

type BusFn = (string) => BusAPI;


let getBus = null;
getBus = (name) => {
  const _registryName = `Bus[${name}]`;
  if (Registry.lookup(_registryName) == null) {
    let bus = null;
    const debugLabel = () => `${_registryName}/[pid: ${bus}]`;
    bus = GenServer({
      initialState: {
        _handlerId: 0,
        idMap: {},
        handlers: {},
        handleQueue: [],
        _queueInProcess: [],
        _notHandledQueue: [],
        _inProcess: false,
        _pending: false
      },
      name: _registryName,
      castHandlers: {
        init: (self, state, msg) => {
          if (state.debug) {
            console.log(`${debugLabel()}/init`, { state, msg });
          }
          const { handlers } = msg;
          for (let idx = 0; idx < handlers.length; idx++) {
            const { event, options, handler } = handlers[idx];
            const handlerId = call(self(), { type: 'registerHandler', options, event, handler });
          }
          return state;
        },
        processQueue: (self, state, _msg) => {
          if (!!state.debug) {
            console.log(`${debugLabel()}/processQueue`, { state });
          }
          if (!state._inProcess && state.handleQueue.length > 0) {
            state._inProcess = true;
            // Copy the queue to _queueInProcess
            // Empty the queue to accept new events
            state._queueInProcess = state.handleQueue;
            state.handleQueue = [];
            state._notHandledQueue = [];
            while (state._queueInProcess.length > 0) {
              const handleEntry = state._queueInProcess.shift();
              const { event, handler } = handleEntry;
              const { id, options } = handler;
              const _handler = handler.handler;
              handleEntry.tries++;
              try {
                if (!_handler(event)) {
                  state._notHandledQueue.push(handleEntry);
                } else {
                  if (options.once) {
                    call(self(), {type: 'removeHandler', id});
                  }
                }
              } catch (error) {
                if (options.once) {
                  call(self(), {type: 'removeHandler', id});
                }
                call(self(), {type: 'sendEvent', event: {type:'error',error,source:handleEntry}});
              }
            }
            while (state._notHandledQueue.length > 0) {
              const handleEntry = state._notHandledQueue.shift();
              state.handleQueue.push(handleEntry);
            }
            state._inProcess = false;
            if (state._pending) {
              state._pending = false;
              cast(self(), { type: 'processQueue' });
            }
          }
          return state;
        }
      },
      callHandlers: {
        debug: (self, state, msg) => {
          if (state.debug == undefined || !state.debug) {
            state.debug = true;
          } else {
            state.debug = false;
          }
          return state.debug;
        },
        logEvents: (self, state, msg) => {
          if (state.logEvents == undefined || !state.logEvents) {
            state.logEvents = true;
          } else {
            state.logEvents = false;
          }
          return state.logEvents;
        },
        registerHandler: (self, state, msg) => {
          if (!!state.debug) {
            console.log(`${debugLabel()}/registerHandler`, { state, msg });
          }
          const { event } = msg;
          let id = state._handlerId++;
          delete msg['type'];
          const handlerEntry = {
            ...msg,
            id
          };
          state.idMap[id] = handlerEntry;
          if (!state.handlers.hasOwnProperty(event)) {
            state.handlers[event] = [];
          }
          state.handlers[event].push(handlerEntry);
          return id;
        },
        sendEvent: (self, state, msg) => {
          if (!!state.debug) {
            console.log(`${debugLabel()}/sendEvent`, { state, msg });
          }
          if (!! state.logEvents) {
            console.log(`${debugLabel()}/event: `,msg.event);
          }
          const { event } = msg;
          const { type } = event;
          if (!state.handlers.hasOwnProperty(type)) {
            if (!!state.debug) console.log(`${debugLabel()} has no handlers for '${type}'`);
          } else {
            const handlers = state.handlers[type];
            for (let idx = 0; idx < handlers.length; idx++) {
              const handlerEntry = handlers[idx];
              state.handleQueue.push({ handler: handlerEntry, event, tries: 0 });
            }
          }
          if (state._inProcess) {
            state._pending = true;
          } else {
            cast(self(), { type: 'processQueue' });
          }
          return state;
        },
        removeHandler: (self, state, msg) => {
          if (!!state.debug) {
            console.log(`${debugLabel()}/removeHandler`, { state, msg });
          }
          const { id } = msg;
          const event = state.idMap[id].event;
          delete state.idMap[id];
          const handlers = state.handlers[event];
          const newHandlers = [];
          for (let idx = 0; idx < handlers.length; idx++) {
            const entry = handlers[idx];
            if (id == entry.id) continue;
            newHandlers.push(entry);
          }
          state.handlers[event] = newHandlers;
        }
      }
    });
    Registry.create(bus, _registryName);
  }
  return {
    getBus,
    initialize: (handlers) => {
      cast(Registry.lookup(_registryName), { type: 'init', handlers });
    },
    sendEvent: (event) => {
      call(Registry.lookup(_registryName), { type: 'sendEvent', event });
      return;
    },
    handle: (event, handler, options = {}) => {
      return call(Registry.lookup(_registryName), { type: 'registerHandler', event, handler, options });
    },
    handleOnce: (event, handler) => {
      return call(Registry.lookup(_registryName), { type: 'registerHandler', event, handler, options: { once: true } });
    },
    unhandle: (handlerId) => {
      return call(Registry.lookup(_registryName), { type: 'removeHandler', id: handlerId });
    },
    debug: () => {
      return call(Registry.lookup(_registryName), { type: 'debug' });
    }, 
    logEvents: () => {
      return call(Registry.lookup(_registryName), { type: 'logEvents' });
    }
  };
};

export const Bus: BusAPI = getBus('mainBus');