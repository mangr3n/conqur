import {Registry} from '../src/Registry';

import * as test from 'tape';

test('Registry should', t => {
  t.test('lookup a pid by name', (t) => {
    Registry.create(1, 'David');
    t.equal(Registry.lookup('David'), 1);
    t.end();
  });
});
