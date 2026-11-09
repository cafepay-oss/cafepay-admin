const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const load = require('./load-source.cjs');

const file = 'src/components/Management/Table/TableTransfer.vue';
const component = load(file);
const template = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').split('</template>')[0];
const handler = template.match(/@click="([^"]+)"/)[1];

function setup() {
  const transfers = [];
  const vm = { table: { id: 1, transferTable: target => transfers.push(target) } };
  for (const [name, method] of Object.entries(component.methods)) vm[name] = method.bind(vm);
  return { vm, transfers, click: target => new Function('tbl', `with (this) { ${handler}; }`).call(vm, target) };
}

test('the transfer button invokes the selected table transfer handler', () => {
  const { transfers, click } = setup();
  const destination = { id: 2, name: 'میز دوم' };
  click(destination);
  assert.deepEqual(transfers, [destination]);
});

test('the transfer handler ignores the current table', () => {
  const { vm, transfers, click } = setup();
  click(vm.table);
  assert.deepEqual(transfers, []);
});
