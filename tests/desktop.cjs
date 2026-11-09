const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('public/desktop.js', 'utf8');
function setup(desktop) {
  const data = new Map();
  const localStorage = {getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key), clear: () => data.clear()};
  const window = {cafepayDesktop: desktop};
  const load = () => vm.runInNewContext(source, {window, localStorage});
  load();
  return {window, data, load};
}
test('browser mode uses ordinary storage without Node access', () => {
  const {window} = setup();
  assert.equal(window.isElectron, false);
  window.storage.setItem('token', 'test');
  assert.equal(window.storage.getItem('token'), 'test');
});
test('logout never imports legacy credentials again', () => {
  let reads = 0;
  const {window, load} = setup({legacyPreferences: () => { reads++; return {token: 'legacy'}; }});
  assert.equal(window.storage.getItem('token'), 'legacy');
  window.storage.clear();
  load();
  assert.equal(reads, 1);
  assert.equal(window.storage.getItem('token'), null);
});
test('printer bridge propagates actual asynchronous results', async () => {
  const {window} = setup({legacyPreferences: () => ({}), print: async input => {
    assert.equal(input.deviceName, 'printer');
    throw new Error('Printer offline');
  }});
  await assert.rejects(window.posPrint('printer', '<p>رسید</p>'), /Printer offline/);
});
