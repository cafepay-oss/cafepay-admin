const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../src/scss/_ergonomics.scss'), 'utf8');
function color(name, styles = source) {
  const match = styles.match(new RegExp('\\$' + name + ':\\s*(#[0-9a-f]{6})\\s*;', 'i'));
  assert.ok(match, `Missing shared palette value: ${name}`);
  return match[1];
}
function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(foreground, background) {
  const first = luminance(foreground); const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
function atLeast(foreground, background, minimum, description) {
  const ratio = contrast(foreground, background);
  assert.ok(ratio >= minimum, `${description}: ${foreground}/${background} is ${ratio.toFixed(2)}:1, below ${minimum}:1`);
}

test('normal text and semantic labels reach 4.5:1 on actual light surfaces', () => {
  const surfaces = ['#ffffff', '#f5f7fa', '#f8fafc', '#f7f9fc', '#f4f9fc', '#f4faf7',
    '#edf5ff', '#eef8f2', '#fffaeb', '#fff1f2'];
  for (const token of ['ui-text', 'ui-muted', 'ui-blue', 'ui-green', 'ui-danger']) {
    for (const surface of surfaces) atLeast(color(token), surface, 4.5, token);
  }
  atLeast(color('ui-disabled-text'), '#e9edf2', 4.5, 'Disabled button label');
});

test('inverse button labels and control marks reach 4.5:1', () => {
  for (const token of ['ui-blue', 'ui-green', 'ui-danger']) {
    atLeast('#ffffff', color(token), 4.5, token);
  }
});

test('Bulma tags, notices, and controls share the accessible semantic palette', () => {
  const bulma = fs.readFileSync(path.join(__dirname, '../src/scss/_variables.scss'), 'utf8');
  for (const [framework, shared] of [['primary', 'ui-blue'], ['secondary', 'ui-danger'],
    ['green', 'ui-green'], ['success', 'ui-green'], ['danger', 'ui-danger']]) {
    assert.equal(color(framework, bulma), color(shared), `${framework} must match ${shared}`);
  }
  atLeast(color('warning-invert', bulma), color('warning', bulma), 4.5, 'Warning notice text');
});

test('input boundaries and focus rings reach 3:1 against form surfaces', () => {
  for (const surface of ['#ffffff', '#f5f7fa', '#f8fafc', '#f7f9fc', '#e9edf2']) {
    atLeast(color('ui-border'), surface, 3, 'Input boundary');
    atLeast(color('ui-blue'), surface, 3, 'Focus ring');
  }
});

test('legacy payment colors cannot override the contrast-safe palette', () => {
  for (const [selector, token] of [['net-amount', 'ui-danger'], ['payed', 'ui-green']]) {
    const rules = [...source.matchAll(new RegExp('[^{}]*\\.' + selector + '[^{}]*\\{([^{}]*)\\}', 'g'))];
    assert.ok(rules.some(rule => new RegExp('color:\\s*\\$' + token + '\\s*!important').test(rule[1])),
      `${selector} must override legacy component !important declarations`);
  }
});

test('active navigation has a high-contrast marker beyond its fill color', () => {
  const activeRule = source.match(/&\.is-active\s*\{([^{}]*)\}/);
  assert.ok(activeRule, 'Missing active navigation state');
  const marker = activeRule[1].match(/box-shadow:\s*inset\s+-?([\d.]+)px\s+0\s+0\s+(#[0-9a-f]{3,6})/i);
  assert.ok(marker && Number(marker[1]) >= 3, 'Active navigation needs a visible edge marker');
  const markerColor = marker[2].length === 4
    ? '#' + marker[2].slice(1).split('').map(channel => channel + channel).join('') : marker[2];
  atLeast(markerColor, color('ui-blue'), 3, 'Active navigation marker');
  atLeast(markerColor, '#243447', 3, 'Navigation marker against sidebar');
});
