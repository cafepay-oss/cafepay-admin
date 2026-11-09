const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const load = require('./load-source.cjs');
const configSource = fs.readFileSync(path.join(__dirname, '../src/components/Charts/chart.config.js'), 'utf8');
const config = new Function(configSource.replace(/export (const|let) /g, '$1 ') +
  '\nreturn { chartColors, chartOptionsMain };')();
const card = load('src/components/Analysis/AnalyticsCardv2.vue', { chartConfig: config, LineChart: {} });

function setup(chartData) {
  const vm = { ...card.data.call({ $t: key => key }), chartData };
  Object.defineProperty(vm, 'labels', { get: () => card.computed.labels.call(vm) });
  return vm;
}

test('current and previous periods have Persian labels and different line and point shapes', () => {
  const periods = [[0, 7, 2], [3, 4, 1]];
  const vm = setup(periods);
  card.methods.fillChartData.call(vm);
  const [current, previous] = vm.defaultChart.chartData.datasets;
  assert.equal(current.label, 'بازهٔ فعلی');
  assert.equal(previous.label, 'بازهٔ قبلی');
  assert.notDeepEqual(current.borderDash, previous.borderDash);
  assert.notEqual(current.pointStyle, previous.pointStyle);
  assert.deepEqual(current.data, periods[0]);
  assert.deepEqual(previous.data, periods[1]);
  assert.equal(current.fill, false); assert.equal(previous.fill, false);
  assert.equal(vm.defaultChart.extraOptions.legend.display, true);
  assert.equal(vm.defaultChart.extraOptions.legend.labels.usePointStyle, true);
  assert.equal(config.chartOptionsMain.legend.display, false, 'Local legend settings must not change other charts');
});

test('empty or partially loaded periods render safely without inventing values', () => {
  for (const periods of [undefined, [], [undefined, undefined], [undefined, [4, 0]]]) {
    const vm = setup(periods);
    assert.doesNotThrow(() => card.methods.fillChartData.call(vm));
    assert.deepEqual(vm.defaultChart.chartData.datasets[0].data, []);
  }
  const vm = setup([undefined, [4, 0]]);
  card.methods.fillChartData.call(vm);
  assert.deepEqual(vm.defaultChart.chartData.datasets[1].data, [4, 0]);
  assert.equal(vm.labels.length, 2);
});

test('chart colors share the tested high-contrast semantic palette', () => {
  const styles = fs.readFileSync(path.join(__dirname, '../src/scss/_ergonomics.scss'), 'utf8');
  for (const [chartColor, token] of [['primary', 'ui-blue'], ['info', 'ui-green'], ['danger', 'ui-danger']]) {
    const match = styles.match(new RegExp('\\$' + token + ':\\s*(#[0-9a-f]{6})'));
    assert.equal(config.chartColors.default[chartColor], match[1]);
  }
});

test('line chart preserves legend options and accepts a single dataset without mutating it', () => {
  const chart = load('src/components/Charts/LineChart.js', { Line: {}, mixins: { reactiveProp: {} } });
  const options = { legend: { display: true } };
  assert.equal(chart.computed.options.call({ extraOptions: options }), options);
  const data = { datasets: [{ label: 'بازهٔ فعلی', data: [2] }] };
  const original = JSON.stringify(data); const calls = [];
  chart.mounted.call({ chartData: null, renderChart: (...args) => calls.push(args) });
  assert.equal(calls.length, 0);
  chart.mounted.call({ chartData: data, options, renderChart: (...args) => calls.push(args) });
  assert.deepEqual(calls, [[data, options]]);
  assert.equal(JSON.stringify(data), original);
});

test('pending analytics changes have a native Persian update button', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/components/Analysis/AnalyticsCardv2.vue'), 'utf8');
  assert.match(source, /<button[^>]*v-if="newData"[^>]*type="button"[^>]*@click="handleUpdateAnalyticsClicked"[\s\S]*?اعمال تغییرات[\s\S]*?<\/button>/);
  let requested = 0; const vm = { newData: true, getData: () => requested++ };
  card.methods.handleUpdateAnalyticsClicked.call(vm);
  assert.equal(requested, 1); assert.equal(vm.newData, false);
});

test('analytics API timestamps stay ASCII while the display locale stays Persian', () => {
  let displayLocale = 'fa'; const calls = [];
  function moment() {
    let locale = displayLocale; const date = new Date('2026-11-08T13:45:00Z');
    return {
      locale(value) { locale = value; return this; },
      subtract(days) { date.setUTCDate(date.getUTCDate() - days); return this; },
      format() {
        const value = date.toISOString().slice(0, 16);
        return locale === 'fa' ? value.replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[digit]) : value;
      }
    };
  }
  moment.locale = value => { displayLocale = value; };
  card.methods.getData.call({ moment, selectedPeriod: { days: 7 }, selectedScale: { hours: 24 },
    storeAction: 'analyticsModule/getSales', mutation: 'setSalesData', prevMutation: 'setSalesDataPrev',
    $store: { dispatch: (...args) => calls.push(args) } });
  assert.deepEqual(calls, [
    ['analyticsModule/getSales', { end_datetime: '2026-11-08T13:45', start_datetime: '2026-11-01T13:45', step: 24, mutation: 'setSalesData' }],
    ['analyticsModule/getSales', { end_datetime: '2026-11-01T13:45', start_datetime: '2026-10-25T13:45', step: 24, mutation: 'setSalesDataPrev' }]
  ]);
  assert.equal(displayLocale, 'fa');
});
