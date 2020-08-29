import { doesNotMatch } from "assert";
import { GenServer } from '../src/genserver';

declare var require;
const { create, cast, call, destroy } = require('../src/index');

declare var expect;
declare var test;

test('expect create to return a process id', () => {
  expect(Number.isInteger(create({name: "TestCreateProcess",handleCast: (msg) => {
    return;
  }}))).toBe(true);
});

test('expect cast to invoke handleCast', (done) => {
  const processDef = { 
    name: 'TestCast', 
    handleCast: (msg) => {
      expect(msg).toBe(1);
      done()
    }
  };
  const processId = create(processDef);
  cast(processId,1);
});

test('expect call to invoke handleCall', () => {
  const processDef = {
    name: 'TestCall',
    handleCall: (msg) => msg
  };
  const processId = create(processDef);
  expect(call(processId,1)).toBe(1);
});

test('expect a GenServer to maintain internal state', () => {
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

  expect(call(processId,{type: 'inc'})).toBe(1);
  expect(call(processId, {type: 'dec'})).toBe(0);

  cast(processId,{type: 'inc', done: () => {
    expect(call(processId, {type: 'count'})).toBe(1);
  }});
  cast(processId, {type: 'dec', done: () => {
    expect(call(processId, {type: 'count'})).toBe(0);
  }});
});