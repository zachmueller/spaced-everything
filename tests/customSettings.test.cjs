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


test('switching to SuperMemo requires correcting all incompatible review scores', async () => {
  const notices = [], settings = [], elements = [];
  let saves = 0;
  function element() {
    const el = { style: {}, createDiv: () => element(), createEl: () => element() };
    elements.push(el);
    return el;
  }
  class Control {
    setPlaceholder() { return this; }
    setValue(value) { this.value = value; return this; }
    onChange(fn) { this.change = fn; return this; }
    addOptions() { return this; }
    setIcon() { return this; }
    setTooltip() { return this; }
    setButtonText() { return this; }
    onClick() { return this; }
  }
  class Setting {
    constructor() { this.descEl = element(); this.texts = []; settings.push(this); }
    setName(name) { this.name = name; return this; }
    setDesc() { return this; }
    setHeading() { return this; }
    addText(fn) { const c = new Control(); this.texts.push(c); fn(c); return this; }
    addDropdown(fn) { this.dropdown = new Control(); fn(this.dropdown); return this; }
    addButton(fn) { fn(new Control()); return this; }
    addExtraButton(fn) { fn(new Control()); return this; }
  }
  const { SpacedEverythingSettingTab: Tab } = load('src/settings.ts', { obsidian: {
    PluginSettingTab: class {}, Modal: class {}, Setting,
    Notice: class { constructor(message) { notices.push(message); } }
  } });
  const option = { name: 'Continue', score: 25 };
  const method = { name: 'Test', spacingAlgorithm: 'Custom', defaultInterval: 1,
    customScriptFileName: 'scripts/test.js', reviewOptions: [option] };
  const plugin = { settings: { spacingMethods: [method] }, saveSettings: async () => { saves++; } };
  const tab = new Tab({}, plugin);
  tab.renderSpacingMethodSetting(element(), method, 0);
  const dropdown = settings.find(s => s.name === 'Spacing algorithm').dropdown;
  const score = settings.find(s => s.name === '(1)').texts[1];
  const visibility = elements.map(el => el.style.display);
  for (const invalid of [25, -1, NaN, Infinity]) {
    option.score = invalid;
    dropdown.setValue('SuperMemo2.0');
    await dropdown.change('SuperMemo2.0');
    assert.equal(method.spacingAlgorithm, 'Custom');
    assert.equal(dropdown.value, 'Custom');
    assert.equal(saves, 0);
    assert.match(notices.pop(), /Correct all review scores.*0 to 5/);
    assert.deepEqual(elements.map(el => el.style.display), visibility);
  }
  await score.change('5');
  dropdown.setValue('SuperMemo2.0');
  await dropdown.change('SuperMemo2.0');
  assert.equal(method.spacingAlgorithm, 'SuperMemo2.0');
  assert.equal(saves, 2);
  await score.change('25');
  assert.equal(option.score, 5);
  await dropdown.change('Custom');
  await score.change('25');
  assert.equal(option.score, 25);
});
