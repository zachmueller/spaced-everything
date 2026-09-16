const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

test('review integration preserves defaults, frontmatter fields, logging and notices', async () => {
  const notices = [];
  const { default: Plugin } = load('src/main.ts', {
    obsidian: {
      Plugin: class {}, Modal: class {}, PluginSettingTab: class {}, SuggestModal: class {},
      Notice: class { constructor(message) { notices.push(message); } }
    }
  });
  const cases = [
    { fields: { 'se-interval': '7', 'se-ease': '2.5' }, defaults: {}, score: 5, interval: 18.2, ease: 2.6, previous: 7 },
    { fields: {}, defaults: { defaultInterval: 3, defaultEaseFactor: 2 }, score: 4, interval: 6, ease: 2, previous: 3 },
    { fields: {}, defaults: {}, score: 4, interval: 2.5, ease: 2.5, previous: 1 },
    { fields: { 'se-interval': 0, 'se-ease': 0 }, defaults: { defaultInterval: 3, defaultEaseFactor: 2 }, score: 4, interval: 6, ease: 2, previous: 3 },
    { fields: { 'se-interval': 30, 'se-ease': 2.5 }, defaults: {}, score: 1, interval: 1, ease: 1.96, previous: 30 }
  ];
  for (const c of cases) {
    const plugin = new Plugin();
    const file = { path: 'note.md' };
    const metadata = { ...c.fields, unrelated: 'preserved' };
    const initial = { ...metadata };
    const logs = [];
    let persisted = false;
    plugin.settings = { logFilePath: 'reviews.jsonl' };
    plugin.logger = { log: (...args) => { assert.ok(persisted); logs.push(args); } };
    plugin.app = { fileManager: { processFrontMatter: async (target, callback) => {
      assert.equal(target, file);
      callback(metadata);
      persisted = true;
    } } };
    const result = await plugin.updateInterval(file, {}, c.score, '2026-09-16', { ...c.defaults, spacingAlgorithm: 'SuperMemo2.0' });
    assert.deepEqual(result, { newInterval: c.interval, newEaseFactor: c.ease });
    assert.deepEqual(metadata, { ...initial,
      'se-interval': c.interval, 'se-ease': c.ease, 'se-last-reviewed': '2026-09-16'
    });
    assert.deepEqual(logs, [['review', file, initial, c.score, c.interval, c.ease]]);
    assert.equal(notices.pop(), `Interval updated from ${c.previous} to ${c.interval}`);
  }
});
