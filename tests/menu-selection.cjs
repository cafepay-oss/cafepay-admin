const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');

function setup(menus = []) {
  const dependencies = {};
  for (const name of ['CardComponent', 'MenuDetail', 'MenuModal', 'LineChart', 'ModalBox', 'HeroBar', 'Tiles']) {
    dependencies[name] = {};
  }
  const component = load('src/views/Cafe/Menus.vue', dependencies);
  const calls = [];
  const vm = { ...component.data(), $store: {
    state: { menuModule: { menus }, accountModule: { activeCafe: { id: 93 } } },
    dispatch: (...args) => calls.push(args)
  } };
  return { component, vm, calls };
}

test('menu display order leaves shared store order unchanged', () => {
  const menus = [{ id: 8 }, { id: 2 }];
  const { component, vm } = setup(menus);
  assert.deepEqual(component.computed.cafeMenus.call(vm).map(menu => menu.id), [2, 8]);
  assert.deepEqual(menus.map(menu => menu.id), [8, 2]);
});

test('selection follows replacement objects and recovers from removal or cafe changes', () => {
  const { component, vm } = setup();
  const reconcile = menus => component.watch.cafeMenus.handler.call(vm, menus);
  const first = { id: 2 }; const active = { id: 8, isActive: true };
  reconcile([first, active]); assert.equal(vm.selectedMenu, active);
  vm.selectedMenu = first;
  const replacement = { id: 2, name: 'updated' };
  reconcile([replacement, active]); assert.equal(vm.selectedMenu, replacement);
  reconcile([active]); assert.equal(vm.selectedMenu, active);
  component.watch.activeCafeId.call(vm); assert.equal(vm.selectedMenu, null);
  reconcile([{ id: 12 }]); assert.equal(vm.selectedMenu.id, 12);
  reconcile([]); assert.equal(vm.selectedMenu, null);
});

test('menu actions safely handle empty selection and edit the selected menu ID', () => {
  const { component, vm, calls } = setup();
  component.methods.editMenu.call(vm);
  component.methods.sendActiveMenu.call(vm);
  component.methods.trashConfirm.call(vm);
  assert.equal(calls.length, 0);
  vm.selectedMenu = { id: 8 };
  component.methods.editMenu.call(vm);
  assert.equal(vm.url, 'api/v1/menu/8/');
});
