const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-source.cjs');

function setup(request) {
  const page = load('src/views/CardTransfers.vue');
  const view = { ...page.data(), cafeId: 1, request, $route: { query: {} } };
  Object.entries(page.methods).forEach(([key, method]) => view[key] = method.bind(view));
  return { page, view };
}

test('submitted receipts are ready for preparation but remain separate from reconciled payments', () => {
  const module = load('src/modules/preorder.js');
  const order = status => ({ cardTransfer: status ? { status } : null,
    customers: [{ orders: [{ product: { name: 'Coffee' }, count: 1 }] }], paymentInfo: { net_amount: 20000 } });
  const submitted = order('submitted'), unpaid = order(null), rejected = order('rejected'), paid = order('confirmed');
  paid.paymentInfo.net_amount = 0;
  const groups = module.getters.getPreordersV2({ preorderTables: [submitted, unpaid, rejected, paid] });
  assert.deepEqual(groups.receiptPreorders, [submitted]);
  assert.deepEqual(groups.payedPreorders, [paid]);
  assert.deepEqual(groups.notPayedPreorders, [unpaid, rejected]);
  assert.equal(submitted.paymentInfo.net_amount, 20000);
});

test('late receipt responses cannot leak another cafe list after switching cafes', async () => {
  let first;
  const { view } = setup(config => config.url.includes('/cafe/1/')
    ? new Promise(resolve => { first = resolve; })
    : Promise.resolve({ data: { results: [{ uuid: 'cafe-2' }], count: 1, next: null } }));
  const old = view.loadReceipts();
  view.cafeId = 2;
  await view.loadReceipts();
  first({ data: { results: [{ uuid: 'cafe-1' }], count: 1, next: null } });
  await old;
  assert.deepEqual(view.receipts, [{ uuid: 'cafe-2' }]);
  assert.equal(view.loading, false);
});

test('receipt pagination keeps earlier entries and accepts only the current filter', async () => {
  const { view } = setup(async config => ({ data: { results: [{ uuid: 'r' + config.params.page }], count: 2,
    next: config.params.page === 1 ? '/next' : null } }));
  await view.loadReceipts();
  assert.equal(view.hasMore, true);
  await view.loadReceipts(2);
  assert.deepEqual(view.receipts.map(item => item.uuid), ['r1', 'r2']);
  assert.equal(view.hasMore, false);
});

test('repeated reconcile clicks send one write and refresh the list after success', async () => {
  let finish, writes = 0;
  const { view } = setup(async config => {
    if (config.method === 'POST') { writes++; return new Promise(resolve => { finish = resolve; }); }
    return { data: { results: [], count: 0, next: null } };
  });
  view.selected = { uuid: 'receipt', status: 'submitted' };
  const first = view.review('confirm');
  await view.review('confirm');
  assert.equal(writes, 1);
  finish({ data: { status: 'confirmed' } });
  await first;
  assert.equal(view.selected, null);
  assert.equal(view.busy, false);
  assert.ok(view.message);
});

test('reconciliation error retains the receipt and leaves the financial state unchanged', async () => {
  const { view } = setup(async () => { throw { response: { status: 409, data: { detail: 'Amount changed' } } }; });
  view.selected = { uuid: 'receipt', status: 'submitted' };
  await view.review('confirm');
  assert.equal(view.selected.status, 'submitted');
  assert.equal(view.reviewError, 'Amount changed');
  assert.equal(view.busy, false);
});

test('a rejected receipt needs an explanation for the customer', async () => {
  let called = false;
  const { view } = setup(async () => { called = true; });
  view.selected = { uuid: 'receipt', status: 'submitted' };
  await view.review('reject');
  assert.equal(called, false);
});

test('receipt badge communicates fulfillment readiness without claiming the money is verified', () => {
  const badge = load('src/components/OrderStatusBadge.vue');
  const status = badge.computed.statusKey.call({ table: { tableType: 'fill', paymentInfo: { net_amount: 20000 },
    cardTransfer: { status: 'submitted' } } });
  assert.equal(status, 'receipt-submitted');
  assert.match(badge.computed.status.call({ statusKey: status }).label, /رسید/);
});

test('repeated receipt events produce one new-order notification', () => {
  const Table = load('src/models/TableClass.js', { require: () => () => '', Enums: { TableTokenTypes: {} } });
  const table = new Table({ is_preorder: true });
  const notifications = [];
  table.init = true;
  table.notificationHandler = key => notifications.push(key);
  table.setCardTransfer({ uuid: 'receipt', status: 'submitted' });
  table.setCardTransfer({ uuid: 'receipt', status: 'submitted' });
  table.setCardTransfer({ uuid: 'receipt', status: 'confirmed' });
  assert.deepEqual(notifications, ['card_transfer']);
});

test('receipt order display and printing preserve the quoted delivery fee after regional prices change', () => {
  const table = load('src/components/Management/Cafe/Preorders/PreordersTable.vue', { RejectPreorderModal: {}, OrderStatusBadge: {} });
  const context = { $store: { getters: { 'regionModule/regionPrices': [{ region: 1, price: 9000 }] } } };
  const order = { address: { region: { pk: 1 } }, cardTransfer: { status: 'submitted', delivery_fee: 5000 } };
  assert.equal(table.methods.deliveryFee.call(context, order), 5000);
  order.cardTransfer.delivery_fee = 0;
  assert.equal(table.methods.deliveryFee.call(context, order), 0);
  order.cardTransfer = null;
  assert.equal(table.methods.deliveryFee.call(context, order), 9000);
});
