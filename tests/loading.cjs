const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');
function setup() {
  const timers = new Map(); const notices = []; const dispatched = []; let nextTimer = 0;
  const Vue = { use() {}, prototype: {} };
  const dependencies = { Vue, Vuex: { Store: class { constructor(options) { return options; } } },
    navigator: { userAgent: 'test' }, window: { storage: { getItem: () => null } },
    configs: {}, Enums: { TableTokenTypes: { SELF_PICKUP: '2', PAYMENT_ONLY: '4' } },
    i18n: { t: text => text }, Toast: { open: value => notices.push(value) },
    setTimeout: (callback, delay) => { timers.set(++nextTimer, { callback, delay }); return nextTimer; },
    clearTimeout: id => timers.delete(id)
  };
  for (const name of ['manualInvoice', 'notification', 'Subscription', 'analytics', 'category', 'preorder',
    'printer', 'support', 'product', 'region', 'account', 'group', 'table', 'cafe', 'post', 'menu']) dependencies[name + 'Module'] = {};
  const store = load('src/store.js', dependencies);
  Object.assign(store.state, { accountModule: { activeCafe: { id: 93 }, user: { token: 'test' } },
    tableModule: { tables: [{ id: 1, watchTableDetailData() {} }] },
    productModule: { newProduct: true }, categoryModule: { newCategory: true } });
  store.dispatch = (...args) => dispatched.push(args);
  const socket = { send() {} };
  const open = () => store.mutations.SOCKET_ONOPEN.call(store, store.state, { currentTarget: socket });
  const message = (source, status = 200) => store.mutations.SOCKET_ONMESSAGE.call(store, store.state, {
    data: JSON.stringify({ type: 'response', message: { source, status_code: status, data: [] } })
  });
  return { store, open, message, timers, notices, dispatched, Vue };
}
test('startup loader clears when initial snapshots arrive without a fixed delay', () => {
  const { store, open, message, timers } = setup();
  open();
  assert.equal(store.state.loadWholePage, true);
  assert.deepEqual([...timers.values()].map(timer => timer.delay), [15000]);
  message('table.1.join.simple.by-id.');
  message('cafe.93.tables.join.simple.2.');
  assert.equal(store.state.loadWholePage, true);
  message('cafe.93.tables.join.simple.4.');
  assert.equal(store.state.loadWholePage, false);
  assert.equal(store.state.socket.initializedCafeId, 93);
  assert.equal(timers.size, 0);
});
test('reconnections keep cached screens usable and recover after failure', () => {
  const { store, open } = setup();
  store.state.socket.initializedCafeId = 93;
  store.mutations.SOCKET_ONCLOSE(store.state, {});
  assert.equal(store.state.loadWholePage, false);
  store.mutations.SOCKET_RECONNECT(store.state, 1);
  assert.equal(store.state.loadWholePage, false);
  open(); assert.equal(store.state.loadWholePage, false);
  store.mutations.SOCKET_RECONNECT_ERROR(store.state);
  assert.equal(store.state.loadWholePage, false);
});
test('old snapshots and old timeout callbacks cannot clear a new cafe loader', () => {
  const { store, open, message, timers } = setup();
  open(); const timeout = [...timers.values()][0].callback;
  store.state.accountModule.activeCafe.id = 94;
  store.state.loadWholePage = true;
  timeout(); message('cafe.93.tables.join.simple.2.');
  assert.equal(store.state.loadWholePage, true);
});
test('missing or failed snapshots release the loader with an error', () => {
  const first = setup(); first.open();
  [...first.timers.values()][0].callback();
  assert.equal(first.store.state.loadWholePage, false);
  assert.equal(first.notices.length, 1);
  const second = setup(); second.open(); second.message('cafe.93.tables.join.simple.2.', 403);
  assert.equal(second.store.state.loadWholePage, false);
  assert.equal(second.store.state.socket.initializedCafeId, null);
});
test('core loading preserves printer groups and defers delivery data', () => {
  const { store, dispatched } = setup();
  store.state.menuModule = {};
  store.actions.getBasicData({ state: store.state, rootState: store.state, dispatch: store.dispatch });
  assert.deepEqual(dispatched.map(([name]) => name), [
    'accountModule/getActiveCafeBasicInfo', 'productModule/getProducts',
    'categoryModule/getCategories', 'menuModule/getMenus', 'tableModule/getTables', 'groupModule/getGroups'
  ]);
});
