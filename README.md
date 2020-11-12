# conqur
conqur (concur(rent) and conquer) is a Project to provide erlang style processes in JavaScript (Typescript...).
The goal is to bring a proven, battle-tested asynchronous message passing paradigm into JavaScript (the browser specifically) to address some specific performance issues my applications are facing.  In particular when I use higher-order functional programming practices (ramdaJS) I face performance issues at scale (1000s of entities+) that block the primary loop.

## Installation
`npm -i --save conqur`

In your code:
`import * as conqur from 'conqur';`

## Usage

### Create a process and cast (async) a message to that process
```
  const self = () => me;
  let me = conqur.create({
    name: 'LogProcess',
    self,
    handleCast: (msg) => {
      console.log('LogProcess: ', msg);
    }
  });

  conqur.cast(me,{a: 1});  // cast returns a message id...
```
  output: `LogProcess: { a: 1 }`

### Call returns a value synchronously
```
  const self = () => me;
  const me = conqur.create({
    name: 'IncProcess',
    self,
    handleCast: (_msg) => { return; },
    handleCall: (value) => {
      return value+1;
    }
  });

  conqur.call(me, 1)
```
Return value: `2`


### GenServer 
GenServer provides a simple abstraction for building a stateful process that responds to a set of messages

```
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

  call(processId,  {type: 'inc'}); ## returns 1
  call(processId, {type: 'dec'}); ## returns 0
  cast(processId, {type: 'inc', done: () => {
    console.log('result: ',call(processId, {type:'count'})); # outputs 'result: 1' to console
  }});
  call(processId, {type: 'count'}); ## returns 0 or 1;
```

### Build APIs that invoke messages
Given the above GenServer it makes sense to actually expose an API like this:
```
const CounterAPI = (counterName) => {
  const name = `Counter[${counterName}]`;
  let _counter = Registry.lookup(name);
  if (Registry.lookup(name) == null) {
    Registry.create(GenServer({
      name: `Counter[${counterName}]`,
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
    }),name);
  };
  return {
    new: CounterAPI,
    inc: () => {
      return call(_counter,{type:'inc'});
    },
    dec: () => {
      return call(_counter, {type: 'dec'});
    },
    count: () => {
      return call(_counter, {type: 'count'});
    }
  };
};

export Counter = CounterAPI('default'); 
```

Now this may seem like overkill.  However, by using this pattern, we can build APIs that allow for responsive interleaving of execution.  
The key is to avoid synchronous execution of long running operations.

Future plans include building a functional API that uses GenServer processes under the covers to allow for responsive long running higher order functions on complex data structures without blocking the single thread of a JavaScript runtime.  This provides an alternate path to highly responsive concurrency in a single threaded context.  Instead of a return value from the `reduce` function we would pass a callback which would catch the result from the process.  That callback might send a message to another Process.