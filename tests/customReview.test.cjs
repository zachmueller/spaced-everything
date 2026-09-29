const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

function setup(source, writeError = false) {
  const notices = [], logs = [];
  const { default: Plugin } = load('src/main.ts', { obsidian: {
    Plugin: class {}, Modal: class {}, PluginSettingTab: class {}, SuggestModal: class {},
    Notice: class { constructor(message) { notices.push(message); } }
  } });
  const plugin = new Plugin();
  const initial = { 'se-interval': 7, 'se-ease': 2.5, 'se-last-reviewed': 'old', unrelated: 'keep' };
  let metadata = { ...initial }, writes = 0;
  plugin.settings = { logFilePath: 'reviews.jsonl' };
  plugin.logger = { log: (...args) => { assert.equal(writes, 1); logs.push(args); } };
  plugin.app = {
    vault: { adapter: { read: async () => { if (source === null) throw new Error('File not found'); return source; } } },
    fileManager: { processFrontMatter: async (_, callback) => {
      const draft = { ...metadata };
      callback(draft);
      await Promise.resolve();
      if (writeError) throw new Error('disk full');
      metadata = draft;
      writes++;
    } }
  };
  plugin.queueFrontmatterUpdate = () => assert.fail('review must not leave queued metadata');
  return { plugin, initial, notices, logs, metadata: () => metadata, writes: () => writes };
}
const method = { spacingAlgorithm: 'Custom', customScriptFileName: 'scripts/review.js' };

test('custom review saves allowed fields and logs only after persistence', async () => {
  const ctx = setup('module.exports = ({ interval }) => ({ interval: interval * 2, unrelated: "overwrite" });');
  await ctx.plugin.updateInterval({}, {}, 5, 'new', method);
  assert.deepEqual(ctx.metadata(), { ...ctx.initial, 'se-interval': 14, 'se-last-reviewed': 'new' });
  assert.equal(ctx.logs.length, 1);
  assert.equal(ctx.notices.length, 1);
  assert.deepEqual(ctx.logs[0][2], ctx.initial);
});

test('script errors and invalid results never save review metadata or report success', async () => {
  for (const source of [null, 'module.exports = ;', 'module.exports = {}', 'module.exports = () => { throw new Error("oops"); }', 'module.exports = () => ({ interval: NaN });', 'module.exports = async () => ({ interval: 1 });']) {
    const ctx = setup(source);
    await assert.rejects(ctx.plugin.updateInterval({}, {}, 5, 'new', method));
    assert.deepEqual(ctx.metadata(), ctx.initial);
    assert.equal(ctx.writes(), 0);
    assert.deepEqual(ctx.logs, []);
    assert.deepEqual(ctx.notices, []);
  }
});

test('write rejection does not log success or leave queued review changes', async () => {
  const ctx = setup('module.exports = () => ({ interval: 14 });', true);
  await assert.rejects(ctx.plugin.updateInterval({}, {}, 5, 'new', method), /disk full/);
  assert.deepEqual(ctx.metadata(), ctx.initial);
  assert.deepEqual(ctx.logs, []);
  assert.deepEqual(ctx.notices, []);
});
