const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup() {
  const handlers = {}, notifications = [], opened = [];
  vm.runInNewContext(fs.readFileSync('public/serviceWorker.js', 'utf8'), {
    URL, self: {location: {origin: 'https://admin.example'}, addEventListener: (name, fn) => { handlers[name] = fn; },
      registration: {showNotification: (...args) => { notifications.push(args); return Promise.resolve(); }}},
    clients: {openWindow: url => { opened.push(url); return Promise.resolve(); }}
  });
  return {handlers, notifications, opened};
}
test('malformed pushes do not crash the worker', () => {
  const {handlers, notifications} = setup();
  handlers.push({data: {json: () => { throw new Error('Invalid JSON'); }}});
  assert.equal(notifications.length, 0);
});
test('notification links remain within the admin origin', async () => {
  const {handlers, notifications} = setup();
  let pending;
  handlers.push({data: {json: () => ({title: 'سفارش', url: 'https://other.example'})}, waitUntil: promise => { pending = promise; }});
  await pending;
  assert.equal(notifications[0][1].data.url, 'https://admin.example/cafe-management');
});
test('clicking the notification body opens the order page and extends worker lifetime', async () => {
  const {handlers, opened} = setup();
  let closed = false, pending;
  handlers.notificationclick({action: '', notification: {close: () => { closed = true; }, data: {url: '/cafe-management'}},
    waitUntil: promise => { pending = promise; }});
  assert.equal(closed, true);
  assert(pending);
  await pending;
  assert.deepEqual(opened, ['https://admin.example/cafe-management']);
});
