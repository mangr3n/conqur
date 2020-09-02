import {Registry} from '../src/Registry';

declare var expect;
declare var test;

test('Registry should store a pid for lookup by a string name', () => {
  Registry.create(1,'David');
  expect(Registry.lookup('David')).toBe(1);
});