import * as test from 'tape';
import { Bus } from '../src/Bus';
import { State } from '../src/State';

test('State should',(t) => {
  t.test("set and return a value", t => {
    State.set('a', 1);
    t.equal(State.get('a'), 1);
    State.unset('a');
    t.end();
  });

  t.test('return the entire state', t => {
    State.set('a', 1);
    // State.set('b', 2);
    t.deepEquals(State.get(), { a: 1});
    State.unset('a');
    State.unset('b');
    t.end();
  });

  t.test('return undefined after unset', t => {
    State.set('a', 1);
    State.unset('a');
    t.equal(State.get('a'),undefined);
    t.end();
  });

  t.test('unset should succeed if the item not present',t => {
    State.unset('a');
    t.equal(State.get('a'), undefined);
    t.end();
  });

  t.test('unset should not fail on missing nested items', t => {
    State.unset('a.1');
    t.end();
  });

  t.test('unset should notify the Bus that the value was removed', t => {
    const handlerId = Bus.handle('a:removed',(event) => {
      t.equal(State.get('a'), undefined);
      t.end();
      Bus.unhandle(handlerId);
      return true;
    });
    State.unset('a');
  });

  t.test('notify the Bus that a change occured', t => {
    const handlerId = Bus.handle('a:changed',(v) => {
      t.equal(v.newValue,2);
      t.end();
      Bus.unhandle(handlerId);
      State.unset('a');
      return true;
    },{});
    State.set('a',2);
  });
});
