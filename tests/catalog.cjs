const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');
const toast = { open() {} };
test('failed menu and category creation never remove existing entries', async () => {
  const requests = [];
  const module = load('src/modules/menu.js', { mixin: { methods: { request(config) { requests.push(config); return Promise.reject(new Error('offline')); } } }, Toast: toast });
  const category = { id: 1 }; const menu = { id: 2, categories: [category] };
  const context = { state: { menus: [menu] }, rootState: { errors: {}, accountModule: { activeCafe: { id: 93 } } } };
  await module.actions.createMenu(context, { name: 'new' });
  assert.deepEqual(context.state.menus, [menu]);
  await module.actions.createCategoryToMenu(context, { menu, category: {} });
  assert.deepEqual(menu.categories, [category]);
  assert.equal(requests[1].url, 'api/v1/cafe/93/category/add/');
});
test('failed activation handles a cafe without a previous active menu', async () => {
  const module = load('src/modules/menu.js', { mixin: { methods: { request: () => Promise.reject(new Error('offline')) } }, Toast: toast });
  const menu = { id: 2, isActive: false };
  await module.actions.sendActiveMenu({ state: { menus: [menu] } }, menu);
  assert.equal(menu.isActive, false);
});
test('failed reorder restores model instances and the correct category', async () => {
  const module = load('src/modules/category.js', { Toast: toast });
  class Product { edit() {} }
  const first = new Product(); const second = new Product();
  const category = { products: [first, second] }; const state = {};
  module.mutations.localUpdateCategoryProductsOrder(state, { category, products: [second, first] });
  module.mutations.localWithdrawCategoryProductsOrderUpdate(state, category);
  assert.deepEqual(category.products, [first, second]);
  assert.equal(category.products[0], first);
  assert.equal(typeof category.products[0].edit, 'function');
});
test('failed product edit restores the model rather than the plain form payload', async () => {
  const Product = load('src/models/ProductClass.js');
  const product = new Product({ pk: 1, name: 'original', category: { pk: 2 } });
  const category = { id: 2, products: [product] };
  const module = load('src/modules/product.js', { mixin: { methods: { request: () => Promise.reject(new Error('offline')) } }, Toast: toast });
  const context = { state: { products: [product] }, rootState: { errors: {}, accountModule: { activeCafe: { id: 93 } }, categoryModule: { categories: [category] } } };
  await module.actions.editProduct(context, { product: { id: 1, name: 'changed', category: 2 }, image: null });
  assert.equal(product.name, 'original');
});
