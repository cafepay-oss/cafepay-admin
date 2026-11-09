const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');

function setup(path = '/cafe/menus') {
  const calls = []; const locales = [];
  const dependencies = {
    sidebarMenu: { sidebarMenu: [] }, configs: { defaultLocale: 'fa-IR' },
    Vue: { prototype: { moment: { locale: value => locales.push(value) },
      $disconnect: () => calls.push(['disconnect']) }, filter() {} },
    window: { storage: { getItem: key => ({ token: 'test', 'default-locale': 'fa-IR' }[key]), setItem() {} } }
  };
  for (const name of ['NotificationsContainer', 'WholePageLoader', 'PrinterTemplate', 'TableDetail',
    'FooterBar', 'AsideMenu', 'NavBar']) dependencies[name] = {};
  const app = load('src/App.vue', dependencies);
  const state = { accountModule: { activeCafe: { id: 93 } },
    regionModule: { cities: [] }, tableModule: { cafeTableTokens: [{ token: '1' }] } };
  const vm = { ...app.data(), $route: { path }, $i18n: {}, $t: key => key,
    $store: { state, dispatch: (...args) => { calls.push(args); }, commit: (...args) => calls.push(args) } };
  Object.defineProperty(vm, 'activeCafe', { get: () => state.accountModule.activeCafe });
  for (const [name, method] of Object.entries(app.methods)) vm[name] = method.bind(vm);
  return { app, vm, state, calls, locales };
}

test('validated cafe starts once even when its saved ID already exists', () => {
  const { app, vm, state, calls } = setup();
  app.watch.activeCafe.call(vm, state.accountModule.activeCafe);
  app.watch.activeCafe.call(vm, { id: 93, name: 'updated' });
  assert.equal(calls.filter(([name]) => name === 'getBasicData').length, 1);
  assert.equal(calls.filter(([name]) => name === 'disconnect').length, 1);
  assert.equal(calls.some(([name]) => /regionModule|groupModule/.test(name)), false);
  state.accountModule.activeCafe = { id: 94 };
  app.watch.activeCafe.call(vm, state.accountModule.activeCafe);
  assert.equal(calls.filter(([name]) => name === 'getBasicData').length, 2);
});

test('route data loads only for the routes that use it', () => {
  const { vm, calls, state } = setup();
  vm.preloadedCafeId = 93;
  for (const [path, expected] of [
    ['/tables', []], ['/preorder', ['regionModule/getRegionPrices']],
    ['/region-prices', ['regionModule/getCities', 'regionModule/getRegionPrices']],
    ['/printer-groups', []], ['/settings', []]
  ]) {
    calls.length = 0; vm.$route.path = path; vm.loadRouteData();
    assert.deepEqual(calls.map(([name]) => name), expected);
  }
  state.regionModule.cities = [{ pk: 1 }];
  calls.length = 0; vm.$route.path = '/region-prices'; vm.loadRouteData();
  assert.deepEqual(calls.map(([name]) => name), ['regionModule/getRegionPrices']);
});

test('table object replacement reuses tokens while new table IDs fetch them', () => {
  const { app, vm, calls } = setup();
  app.watch.tables.call(vm, [{ id: 2 }, { id: 1 }]);
  app.watch.tables.call(vm, [{ id: 1 }, { id: 2 }]);
  app.watch.tables.call(vm, [{ id: 1 }, { id: 2 }, { id: 3 }]);
  assert.deepEqual(calls.map(([name]) => name), [
    'tableModule/getCafeTableTokens', 'tableModule/setEachTableToken', 'tableModule/getCafeTableTokens'
  ]);
});

test('startup restores the actual locale and token before membership requests', () => {
  const { app, vm, calls, locales } = setup();
  app.created.call(vm);
  assert.deepEqual(locales, ['fa-IR']);
  assert.equal(vm.$i18n.locale, 'fa-IR');
  assert.deepEqual(calls, [['accountModule/setToken', 'test'], ['accountModule/getUserCafeRelations']]);
});
