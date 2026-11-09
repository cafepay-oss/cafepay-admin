const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');
function setup({ print = () => Promise.resolve(true), acknowledge = () => Promise.resolve({}), delivered = [] } = {}) {
  const storage = new Map([['printer-delivered-job-ids', JSON.stringify(delivered)]]);
  const module = load('src/modules/printer.js', {
    window: { isElectron: true, storage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
      posPrint: print, printTest: print, getPrinterList: () => Promise.resolve({ machineId: 'machine', printers: [{ name: 'test' }] }) },
    mixin: { methods: { request: acknowledge } }, Toast: { open() {} }
  });
  const context = { state: module.state, getters: {},
    dispatch(name, value) { return module.actions[name](context, value); },
    commit(name, value) { module.mutations[name](context.state, value); }
  };
  return { context, storage };
}
const job = pk => ({ pk, raw_data: 'receipt', printer: { pk: 1, name: 'test' }, is_done: false });

test('queue awaits physical delivery and acknowledgement before processing the next job', async () => {
  const finish = []; const printed = []; const acknowledged = [];
  const { context } = setup({ print: () => new Promise(resolve => { printed.push(true); finish.push(resolve); }),
    acknowledge: config => { acknowledged.push(config); return Promise.resolve({}); } });
  const first = job(1); const second = job(2);
  const running = context.dispatch('handlePrintJobs', [first, second]);
  assert.equal(printed.length, 1); assert.equal(acknowledged.length, 0);
  assert.equal(context.state.isRunningJobs, true);
  await context.dispatch('handlePrintJobs', [job(1)]);
  finish.shift()(true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(printed.length, 2); assert.equal(acknowledged.length, 1);
  finish.shift()(true); await running;
  assert.equal(acknowledged.length, 2); assert.equal(context.state.done.length, 2);
  assert.equal(context.state.isRunningJobs, false);
});
test('failed acknowledgement retries without a second physical print', async () => {
  let prints = 0; let ack = 0;
  const { context } = setup({ print: async () => { prints++; return true; },
    acknowledge: async () => { if (++ack === 1) throw new Error('offline'); return {}; } });
  const receipt = job(1);
  await context.dispatch('handlePrintJobs', [receipt]);
  assert.equal(receipt.is_done, false); assert.equal(receipt.failureStage, 'acknowledgement');
  assert.deepEqual(context.state.deliveredJobIds, [1]);
  await context.dispatch('retryFailedJobs');
  assert.equal(prints, 1); assert.equal(ack, 2); assert.equal(receipt.is_done, true);
  assert.deepEqual(context.state.deliveredJobIds, []);
});
test('failed physical delivery remains pending until explicit retry', async () => {
  let prints = 0; let acknowledgements = 0;
  const { context } = setup({ print: async () => { prints++; throw new Error('printer offline'); },
    acknowledge: async () => { acknowledgements++; } });
  await context.dispatch('handlePrintJobs', [job(1)]);
  await context.dispatch('handlePrintJobs', [job(1)]);
  assert.equal(prints, 1); assert.equal(acknowledgements, 0);
  assert.equal(context.state.failedJobs[0].failureStage, 'delivery');
  assert.equal(context.state.done.length, 0);
});
test('delivery journal survives a reload and completed cache stays bounded', async () => {
  let prints = 0;
  const { context } = setup({ delivered: [1], print: async () => { prints++; return true; } });
  context.state.done = Array.from({ length: 200 }, (_, index) => job(index + 10));
  await context.dispatch('handlePrintJobs', [job(1)]);
  assert.equal(prints, 0); assert.equal(context.state.done.length, 200);
});
test('native printer discovery updates the store before matching machine jobs', async () => {
  let prints = 0;
  const { context } = setup({ print: async () => { prints++; return true; } });
  context.state.lastCloudJobs = [{ uid: 'machine', jobs: [job(1)] }];
  await context.dispatch('getLocalPrinters');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.state.machineId, 'machine');
  assert.deepEqual(context.state.localPrinters, [{ name: 'test' }]);
  assert.equal(prints, 1);
});
test('optional browser discovery stays silent and settings retry clears its error', async () => {
  let requests = 0; const toasts = [];
  const module = load('src/modules/printer.js', {
    window: { isElectron: false, storage: { getItem: () => null, setItem() {} } },
    axios: { create: () => ({ request: async () => {
      if (++requests === 1) throw new Error('service unavailable');
      return { data: { machineId: 'machine', printers: [{ name: 'available' }] } };
    } }) },
    mixin: { methods: { request: async () => ({}) } }, Toast: { open: value => toasts.push(value) }
  });
  const context = { state: module.state, getters: {},
    commit(name, value) { module.mutations[name](context.state, value); },
    dispatch(name, value) { return module.actions[name](context, value); }
  };
  assert.equal(await context.dispatch('getLocalPrinters'), false);
  assert.equal(toasts.length, 0);
  assert.ok(context.state.printerDiscoveryError);
  assert.equal(context.state.printerLoading, false);
  assert.equal(await context.dispatch('getLocalPrinters'), true);
  assert.equal(context.state.printerDiscoveryError, null);
  assert.deepEqual(context.state.localPrinters, [{ name: 'available' }]);
});
