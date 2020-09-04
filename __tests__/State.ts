declare var expect;
declare var test;

import { State } from '../src/State';

test("expect state to accept a value and return that value", () => {
  State.set('a',1);
  expect(State.get('a')).toBe(1);
});

test('expect state to return the entire state if set is called without and argument', () => {
  State.set('a',1);
  expect(State.get()).toEqual({a: 1});
});