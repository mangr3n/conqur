import { Bus } from "../src/Bus";
declare var test;
declare var expect;

test('expect a handler to receive an event of the registered type', (done) => {
  Bus.handle('initialize',(v) => {
    expect(v.type).toBe('initialize');
    expect(v.value).toBe(1);
    done();
  });
  Bus.sendEvent({type:'initialize',value: 1});
});
