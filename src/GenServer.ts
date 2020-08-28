import { isNil } from "./util";
import { create } from './index';

type ProcessID = number;

interface Message {
  [index: string]: any;
  type: string;
};

type ProcessAccessor = () => ProcessID;

type CastHandler = (self: ProcessAccessor, state: any, msg: Message) => any;
type CallHandler = (self: ProcessAccessor, state: any, msg: Message) => Promise<any>;

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

  async function handleCall(msg:Message) {
    const {type} = msg
    if (isNil(callHandlers[type])) {
      throw new Error(`Unknown call message type '${type}'`);
    } else {
      const handler = callHandlers[type];
      return await handler(self,state,msg);
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
      }
    },
    handleCall
  };
  me = create(processDef);
};

