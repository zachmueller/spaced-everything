const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');
const { loadScheduler, calculateSchedule } = load('src/customScheduler.ts');
const method = { spacingAlgorithm: 'Custom', customScriptFileName: 'scripts/review.js' };
const input = { interval: 7, easeFactor: 2.5, reviewScore: 5 };
const run = async source => calculateSchedule(await loadScheduler(method, async () => source), input);

test('dispatches built-in and rejects unknown algorithm', async () => {
  const scheduler = await loadScheduler({ spacingAlgorithm: 'SuperMemo2.0' }, () => assert.fail('must not read a script'));
  assert.deepEqual(calculateSchedule(scheduler, input), { interval: 18.2, easeFactor: 2.6 });
  await assert.rejects(loadScheduler({ spacingAlgorithm: 'typo' }, () => {}), /Unknown spacing algorithm/);
});

test('loads each review, passes frozen numeric state, and preserves omitted ease', async () => {
  let reads = 0;
  const read = async path => {
    assert.equal(path, 'scripts/review.js');
    reads++;
    return `module.exports = input => {
      if (!Object.isFrozen(input)) throw new Error('not frozen');
      return { interval: input.interval * ${reads}, ignoredProperty: 'not persisted' };
    };`;
  };
  assert.deepEqual(calculateSchedule(await loadScheduler(method, read), input), { interval: 7, easeFactor: 2.5 });
  assert.deepEqual(calculateSchedule(await loadScheduler(method, read), input), { interval: 14, easeFactor: 2.5 });
  assert.deepEqual(input, { interval: 7, easeFactor: 2.5, reviewScore: 5 });
});

test('accepts fractional intervals, custom scores, and explicit ease', async () => {
  const scheduler = await loadScheduler(method, async () => 'module.exports = ({ reviewScore }) => ({ interval: reviewScore / 100, easeFactor: 1.1 });');
  assert.deepEqual(calculateSchedule(scheduler, { ...input, reviewScore: 25 }), { interval: 0.25, easeFactor: 1.1 });
});

test('rejects invalid paths before reading, and reports missing files', async () => {
  for (const customScriptFileName of ['', '/x.js', '../x.js', 'a/../x.js', 'a//x.js', './x.js', 'C:\\x.js', 'https://x.js', 'x.ts', 'x\n.js']) {
    await assert.rejects(loadScheduler({ ...method, customScriptFileName }, () => assert.fail('invalid path read')), /vault-relative/);
  }
  await assert.rejects(loadScheduler(method, async () => { throw new Error('File not found'); }), /scripts\/review.js.*File not found/);
});

test('rejects syntax errors, wrong exports, runtime errors, and mutation attempts', async () => {
  for (const source of ['module.exports = ;', 'module.exports = {}', 'module.exports = () => { throw new Error("oops"); }', 'module.exports = input => { input.interval = 9; return { interval: 1 }; }']) {
    await assert.rejects(run(source), /custom script|Custom script/);
  }
});

test('rejects invalid results and async returns', async () => {
  for (const result of ['null', 'undefined', '3', '[]', '{}', '{ interval: 0 }', '{ interval: -1 }', '{ interval: NaN }', '{ interval: Infinity }', '{ interval: "3" }', '{ interval: 1, easeFactor: 0 }', '{ interval: 1, easeFactor: NaN }', '{ interval: 1, easeFactor: Infinity }', '{ interval: 1, easeFactor: -1 }', '{ interval: 1, easeFactor: null }']) {
    await assert.rejects(run(`module.exports = () => (${result});`), /positive finite/);
  }
  await assert.rejects(run('module.exports = async () => ({ interval: 1 });'), /synchronously/);
  await assert.rejects(run('module.exports = async () => { throw new Error("async failure"); };'), /synchronously/);
});

test('rejects invalid inputs before calling scripts', () => {
  for (const values of [{ interval: NaN }, { interval: -1 }, { easeFactor: Infinity }, { reviewScore: NaN }]) {
    assert.throws(() => calculateSchedule(() => assert.fail('invalid input delivered'), { ...input, ...values }), /Scheduling requires/);
  }
});
