import * as test from 'tape';
import { State } from '../src/State';

test('State should',(t) => {
  t.test("set and return a value", t => {
    State.set('a', 1);
    t.equal(State.get('a'), 1);
    t.end();
  });

  t.test('return the entire state', t => {
    State.set('a', 1);
    t.deepEquals(State.get(), { a: 1, b: 'test' });
    t.end();
  })
});
