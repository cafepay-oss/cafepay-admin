const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-source.cjs');
const badge = load('src/components/OrderStatusBadge.vue');
const stateFor = values => badge.computed.statusKey.call({ colorState: null, state: null, table: null, ...values });
const presentationFor = values => badge.computed.status.call({ statusKey: stateFor(values) });

test('invoice badges preserve payment and kitchen status from the existing invoice view', () => {
  const view = load('src/views/Invoices.vue', {
    InvoicesTable: {}, CardComponent: {}, ColorsGuide: {}, HeroBar: {},
  });
  const invoices = [
    { paymentInfo: { netAmount: 0 }, state: false, expected: 'ready' },
    { paymentInfo: { netAmount: 100 }, state: false, expected: 'new' },
    { paymentInfo: { netAmount: 100 }, state: true, expected: 'unpaid' },
    { paymentInfo: { netAmount: 0 }, state: true, expected: 'complete' },
  ];
  const result = view.computed.activeInvoices.call({
    $store: { getters: { 'tableModule/activeInvoices': invoices } },
  });
  result.forEach(row => assert.equal(stateFor({ colorState: row.colorState }), row.expected));
  const symbols = result.map(row => presentationFor({ colorState: row.colorState }).icon);
  assert.equal(new Set(symbols).size, 4, 'each workflow state has a distinct symbol');
  assert.notEqual(presentationFor({ state: 'paid' }).label, presentationFor({ state: 'complete' }).label);
});

test('mixed-order table badges preserve the existing card color priority without changing orders', () => {
  const card = load('src/components/Management/Table/TableCardSmall.vue', {
    TableTokenModal: {}, Tiles: {}, OrderStatusBadge: badge,
  });
  const colors = { green: 'complete', yellow: 'ready', blue: 'new', red: 'unpaid' };
  const orders = [
    { paymentInfo: { net_amount: 0 }, sentToKitchen: true },
    { paymentInfo: { net_amount: 0 }, sentToKitchen: false },
    { paymentInfo: { net_amount: 100 }, sentToKitchen: false },
    { paymentInfo: { net_amount: 100 }, sentToKitchen: true },
  ];
  for (const first of orders) for (const second of orders) {
    const table = { tableType: 'fill', paymentInfo: {}, customers: [{ orders: [first, second] }] };
    const before = JSON.stringify(table);
    const color = card.computed.backgroundColor.call({ tableDetail: table });
    assert.equal(stateFor({ table }), colors[color]);
    assert.equal(JSON.stringify(table), before);
  }
});

test('empty and loading tables never show a completed-order label', () => {
  assert.equal(stateFor({ table: { tableType: 'free' } }), 'free');
  assert.equal(stateFor({ table: { tableType: 'merged' } }), 'merged');
  assert.equal(stateFor({ table: { tableType: 'fill' } }), 'unknown');
  assert.equal(stateFor({ colorState: 99 }), 'unknown');
});
