const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');
const createRequester = load('src/javascripts/request.js', { setTimeout: callback => callback() });
function setup(name, request) {
  const module = load('src/modules/' + name + '.js', {
    mixin: { methods: { request } }, i18n: { t: () => 'بدون گروه' },
    setTimeout() { throw new Error('Action must not schedule recursive retries'); }
  });
  const context = { state: module.state, rootState: { accountModule: { activeCafe: { id: 1 } }, tries: 0 },
    commit(name, value) { module.mutations[name](context.state, value); },
    dispatch() { throw new Error('Action must not dispatch itself'); }
  };
  return { module, context };
}
function transportFailure(error) {
  let attempts = 0;
  const request = createRequester({
    axios: { create: () => ({ request() { attempts++; return Promise.reject(error); } }) },
    token: () => 'test', baseURL: () => '/', loading() {}, unauthorized() {}, unavailable() {}
  });
  return { request, attempts: () => attempts };
}
test('auxiliary read failures stop after bounded transport retries and release loading', async () => {
  for (const [name, action, loading, errorKey] of [
    ['region', 'getCities', null, 'citiesError'],
    ['region', 'getRegionPrices', 'localLoading', 'regionPricesError'],
    ['group', 'getGroups', 'groupsLoading', 'groupsError']
  ]) {
    const transport = transportFailure(new Error('offline'));
    const { module, context } = setup(name, transport.request);
    assert.equal(await module.actions[action](context), false);
    assert.equal(transport.attempts(), 3);
    if (loading) assert.equal(context.state[loading], false);
    assert.ok(context.state[errorKey]);
  }
});
test('authorization failures resolve safely for callers that do not await dispatch', async () => {
  for (const name of ['region', 'group']) {
    const transport = transportFailure({ response: { status: 401 } });
    const { module, context } = setup(name, transport.request);
    const action = name === 'region' ? 'getRegionPrices' : 'getGroups';
    assert.equal(await module.actions[action](context), false);
    assert.equal(transport.attempts(), 1);
  }
});
test('late cafe responses cannot replace current region prices or printing groups', async () => {
  for (const [name, action, stateKey, loading] of [
    ['region', 'getRegionPrices', 'regionPrices', 'localLoading'],
    ['group', 'getGroups', 'groups', 'groupsLoading']
  ]) {
    const settle = [];
    const { module, context } = setup(name, () => new Promise(resolve => settle.push(resolve)));
    const first = module.actions[action](context);
    context.rootState.accountModule.activeCafe = { id: 2 };
    const second = module.actions[action](context);
    settle[0]({ data: [{ pk: 1 }] });
    assert.equal(await first, false);
    assert.equal(context.state[loading], true);
    settle[1]({ data: [{ pk: 2 }] });
    assert.equal(await second, true);
    assert.equal(context.state[stateKey][0].pk, 2);
    assert.equal(context.state[loading], false);
  }
});
test('group fallback never mutates responses or duplicates the null group', () => {
  const { module, context } = setup('group', () => Promise.resolve());
  const payload = [{ pk: 1 }, { pk: null }, { pk: null }];
  const snapshot = JSON.stringify(payload);
  module.mutations.setGroups(context.state, payload);
  module.mutations.setGroups(context.state, context.state.groups);
  assert.equal(JSON.stringify(payload), snapshot);
  assert.equal(context.state.groups.filter(group => group.pk === null).length, 1);
  assert.equal(context.state.groups[0], payload[0]);
});
