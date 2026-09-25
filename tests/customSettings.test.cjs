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

test('dummy example always returns one day and preserves ease', async () => {
  const { loadScheduler, calculateSchedule } = load('src/customScheduler.ts');
  const schedule = await loadScheduler(
    { spacingAlgorithm: 'Custom', customScriptFileName: 'examples/custom-scheduler.js' },
    path => require('node:fs/promises').readFile(path, 'utf8')
  );
  for (const reviewScore of [1, 3, 5, -10, 0.25]) {
    assert.deepEqual(
      calculateSchedule(schedule, { interval: 7, easeFactor: 2.5, reviewScore }),
      { interval: 1, easeFactor: 2.5 }
    );
  }
});
