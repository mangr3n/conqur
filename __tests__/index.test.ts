import * as test from 'tape';
import { Message } from '../src/GenServer';
import { GenServer, create, cast, call, destroy } from '../src/index';

test('expect create to return a process id', (t) => {
  const processId = create({
    name: "TestCreateProcess", 
    self: () => processId,
    handleCast: (msg) => {
      return;
    }
  });
  t.ok(Number.isInteger(processId));
  destroy(processId);
  t.end();
});

test('expect cast to invoke handleCast', (t) => {
  const processDef = { 
    name: 'TestCast',
    self: () => processId, 
    handleCast: (msg:Message) => {
      t.equal(msg,1);
      t.end();
    }
  };
  const processId = create(processDef);
  cast(processId,1);
});

test('expect call to invoke handleCall', t => {
  const processDef = {
    name: 'TestCall',
    self: () => processId,
    handleCast: () => null,
    handleCall: (msg:any) => msg
  };
  const processId = create(processDef);
  t.equal(call(processId,1),1);
  t.end();
});

test('expect a GenServer to maintain internal state', t => {
  const processId = GenServer({
    name: 'GenServerTest',
    initialState: { count: 0 },
    castHandlers: {
      inc: (_self, state, _) => {
        state.count = state.count+1;
        return state;
      },
      dec: (_self, state, _) => {
        return {
          count: state.count - 1
        };
      }
    },
    callHandlers: {
      inc: (_self, state, _) => {
        state.count = state.count+1;
        return state.count;
      },
      dec: (_self, state, _) => {
        state.count = state.count - 1;
        return state.count;
      },
      count: (_self,state, _) => {
        return state.count;
      }
    }
  });

  t.equal(call(processId,{type: 'inc'}),1);
  t.equal(call(processId, {type: 'dec'}),0);

  cast(processId,{type: 'inc', done: () => {
    t.equal(call(processId, {type: 'count'}),1);
  }});
  cast(processId, {type: 'dec', done: () => {
    t.equal(call(processId, {type: 'count'}),0);
    t.end();
  }});
});
