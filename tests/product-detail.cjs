const assert = require('node:assert/strict');
const test = require('node:test');
const load = require('./load-source.cjs');
const component = load('src/components/Management/Cafe/Products/ProductDetail.vue', { CardComponent: {}, cafeDefault: 'fallback.png' });
test('product detail has safe initial image data while its request is pending', async () => {
  let resolve;
  const vm = { ...component.data(), id: '12', request: () => new Promise(done => { resolve = done; }) };
  const pending = component.methods.loadProduct.call(vm);
  assert.equal(vm.loading, true);
  assert.equal(component.computed.productImage.call(vm), 'fallback.png');
  resolve({ data: { images: [{ image: 'first.png' }, { image: 'avatar.png', is_avatar: true }] } });
  await pending;
  assert.equal(vm.loading, false);
  assert.equal(component.computed.productImage.call(vm), 'avatar.png');
});
test('failed product reads show a retry state without image dereferences', async () => {
  const vm = { ...component.data(), id: '12', request: () => Promise.reject(new Error('offline')) };
  assert.equal(await component.methods.loadProduct.call(vm), false);
  assert.equal(vm.loading, false); assert.equal(vm.loadError, true);
  assert.equal(component.computed.productImage.call(vm), 'fallback.png');
});
test('a late response cannot replace the next product route', async () => {
  let resolve;
  const vm = { ...component.data(), id: '12', request: () => new Promise(done => { resolve = done; }) };
  const pending = component.methods.loadProduct.call(vm);
  vm.id = '13'; vm.product = { name: 'new route' };
  resolve({ data: { name: 'old route' } }); await pending;
  assert.equal(vm.product.name, 'new route');
});
