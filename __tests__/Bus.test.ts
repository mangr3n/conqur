import * as test from 'tape';

import { Bus, State } from "../src/index";

test('Bus should', t => {
  t.test('register and call a handler', (t) => {
    const hID = Bus.handle('initialize', (v) => {
      t.equal(v.type, 'initialize');
      t.equal(v.value, 1);
      Bus.unhandle(hID);
      t.end();
      return true;
    }, {});
    Bus.sendEvent({ type: 'initialize', value: 1 });
  });
  t.test("defer handler processing", (t) => {
    let counter = 0;
    const hID = Bus.handle('test:retry', (v) => {
      counter++;
      if (State.get('a') !== "test") {
        t.equal(counter, 1);
        return false;
      } else {
        t.equal(counter, 2);
        t.end()
        Bus.unhandle(hID);
        return true;
      }
    }, {});
    Bus.sendEvent({ type: 'test:retry' });
    setTimeout(() => { State.set("a", "test"); }, 100);
  });
  t.test("catch errors in handlers", t => {
    const makeID = Bus.handle('make:error', (_event) => {
      throw new Error('test error');
    }, {});

    const errID = Bus.handle('error', (v) => {
      t.comment('entered error handler');
      Bus.unhandle(errID);
      Bus.unhandle(makeID);
      t.equal(v.type, 'error');
      t.end();
      return true;
    }, {});
    Bus.sendEvent({ type: 'make:error' });
  });
  t.test("continue processing when there are errors", t => {
    let counter = 0;

    const errID = Bus.handle('another:error', (v) => {
      throw new Error('test error');
    }, {});

    const testID = Bus.handle('test:retry', (v) => {
      counter++;
      // console.error('test:retry: ', State.get('b'));
      if (State.get('b') !== "test") {
        return false;
      } else {
        t.ok(counter > 1)
        Bus.unhandle(testID);
        Bus.unhandle(errID);
        t.end();
        return true;
      }
    }, {});

    Bus.sendEvent({ type: 'test:retry' });
    Bus.sendEvent({ type: 'another:error' });
    setTimeout(() => { State.set("b", "test"); }, 100);
  });
});



