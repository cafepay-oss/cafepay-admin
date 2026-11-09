const assert = require('node:assert/strict');
const test = require('node:test');
const loadSource = require('./load-source.cjs');

function setup(request) {
  const table = loadSource('src/modules/table.js', {
    mixin: { methods: { request } }, Toast: { open() {} }
  });
  const context = {
    state: { ...table.state },
    rootState: { accountModule: { activeCafe: { id: 93 } } },
    dispatch(action, payload) { return table.actions[action](context, payload); }
  };
  return context;
}
const invoice = { joinId: 10, customers: [{ orders: [{ id: 22, paymentInfo: { net_amount: 25000 } }] }] };

test('closing waits for settlement and blocks duplicate submissions', async () => {
  let resolvePayment;
  const requests = [];
  const context = setup(config => {
    requests.push(config);
    return requests.length === 1 ? new Promise(resolve => { resolvePayment = resolve; }) : Promise.resolve({});
  });
  const result = context.dispatch('settleAndCloseInvoice', { table: invoice, method: '1' });
  assert.equal(requests.length, 1);
  assert.equal(await context.dispatch('settleAndCloseInvoice', { table: invoice, method: '1' }), false);
  resolvePayment({});
  assert.equal(await result, true);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url, 'api/v1/join/send/10/');
  assert.equal(context.state.invoiceClosing, false);
});

test('failed payment preserves the open invoice and allows retry', async () => {
  const requests = [];
  const context = setup(config => { requests.push(config); return Promise.reject(new Error('offline')); });
  context.state.isTableCloseInvoiceModalActive = true;
  assert.equal(await context.dispatch('settleAndCloseInvoice', { table: invoice, method: '2' }), false);
  assert.equal(requests.length, 1);
  assert.equal(context.state.isTableCloseInvoiceModalActive, true);
  assert.equal(context.state.invoiceClosing, false);
});

test('explicit close without payment sends only the close request', async () => {
  const requests = [];
  const context = setup(config => { requests.push(config); return Promise.resolve({}); });
  assert.equal(await context.dispatch('settleAndCloseInvoice', { table: invoice, method: '0' }), true);
  assert.deepEqual(requests.map(request => request.url), ['api/v1/join/send/10/']);
});
