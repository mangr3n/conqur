import { isNil } from "./util";
import {create } from './core';
import { ProcessAccessor } from "./types";

interface State {
  [index: string]: any;
}

interface Message {
  [index: string]: any;
  type: string;
  done: () => void;
};

type CastHandler = (self: ProcessAccessor, state: State, msg: Message) => any;
type CallHandler = (self: ProcessAccessor, state: State, msg: Message) => any;

interface CastHandlerMap {
  [index: string]: CastHandler
}

interface CallHandlerMap {
  [index: string]: CallHandler
}

interface GenServerDefinition {
  name: string;
  initialState: any;
  castHandlers?: CastHandlerMap;
  callHandlers?: CallHandlerMap;
}

export const GenServer = ({name, castHandlers, callHandlers, initialState}:GenServerDefinition) => {
  let state = initialState;


  let me = null;
  const self = () => me;

  function handleCall(msg:Message) {
    const {type} = msg
    if (isNil(callHandlers[type])) {
      throw new Error(`Unknown call message type '${type}'`);
    } else {
      const handler = callHandlers[type];
      return handler(self,state,msg);
    }
  }

  const processDef = {
    name,
    self,
    handleCast: (msg) => {
      const { type } = msg;
      if (isNil(castHandlers[type])) {
        throw new Error(`Unknown cast message type '${type}'`);
      } else {
        const handler = castHandlers[type];
        state = handler(self, state, msg);
        if (msg.done) msg.done();
      }
    },
    handleCall
  };
  me = create(processDef);
  return me;
};

