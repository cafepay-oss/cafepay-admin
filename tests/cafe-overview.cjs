const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');

test('table overview renders before loading and excludes virtual tables after loading', () => {
  const component = load('src/views/CafeManagement.vue', {
    TableCardSmall: {}, TableCard: {}, ColorsGuide: {}, HeroBar: {}
  });
  const vm = { $store: { state: { tableModule: { tables: null } } } };
  assert.deepEqual(component.computed.visibleTables.call(vm), []);
  const table = { id: 18076 };
  vm.$store.state.tableModule.tables = [table, { id: 2, isPreorder: true }, { id: 3, isMenuOnly: true }];
  assert.deepEqual(component.computed.visibleTables.call(vm), [table]);
  assert.equal(vm.$store.state.tableModule.tables.length, 3);
});
