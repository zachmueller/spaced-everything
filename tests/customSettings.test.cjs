const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

test('review score settings accept finite custom scores but keep SuperMemo range', async () => {
  const controls = [], notices = [];
  class Control {
    setPlaceholder() { return this; }
    setValue() { return this; }
    onChange(fn) { this.change = fn; return this; }
    setIcon() { return this; }
    setTooltip() { return this; }
    onClick() { return this; }
  }
  class Setting {
    setName() { return this; }
    addText(callback) { const control = new Control(); controls.push(control); callback(control); return this; }
    addExtraButton(callback) { callback(new Control()); return this; }
  }
  const { SpacedEverythingSettingTab: Tab } = load('src/settings.ts', { obsidian: {
    PluginSettingTab: class {}, Modal: class {}, Setting, Notice: class { constructor(message) { notices.push(message); } }
  } });
  const option = { name: 'Continue', score: 1 };
  const method = { spacingAlgorithm: 'Custom', reviewOptions: [option] };
  const plugin = { settings: { spacingMethods: [method] }, saveSettings: async () => {} };
  const tab = new Tab({}, plugin);
  tab.renderReviewOptionSetting({ createDiv: () => ({}) }, option, 0, 0);
  const scoreControl = controls[1];
  for (const value of ['25', '-3', '0.25']) {
    await scoreControl.change(value);
    assert.equal(option.score, Number(value));
  }
  for (const value of ['', ' ', 'Infinity', 'NaN', '2abc']) {
    await scoreControl.change(value);
    assert.equal(option.score, 0.25);
  }
  method.spacingAlgorithm = 'SuperMemo2.0';
  await scoreControl.change('5');
  assert.equal(option.score, 5);
  await scoreControl.change('25');
  assert.equal(option.score, 5);
  assert.match(notices.pop(), /0 to 5/);
});

test('Evergreen example matches documented policy and caps long intervals', async () => {
  const { loadScheduler } = load('src/customScheduler.ts');
  const schedule = await loadScheduler(
    { spacingAlgorithm: 'Custom', customScriptFileName: 'examples/evergreen.js' },
    path => require('node:fs/promises').readFile(path, 'utf8')
  );
  assert.deepEqual(schedule({ interval: 7, reviewScore: 1 }), { interval: 1 });
  assert.deepEqual(schedule({ interval: 7, reviewScore: 3 }), { interval: 10.5 });
  assert.deepEqual(schedule({ interval: 7, reviewScore: 5 }), { interval: 14 });
  assert.deepEqual(schedule({ interval: 80, reviewScore: 5 }), { interval: 90 });
  assert.deepEqual(schedule({ interval: 0.25, reviewScore: 3 }), { interval: 1 });
  assert.throws(() => schedule({ interval: 7, reviewScore: 4 }), /expects scores/);
});
