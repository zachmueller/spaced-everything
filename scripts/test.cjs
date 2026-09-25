// Pass explicit paths: test-directory and glob support differ between Node versions.
const { readdirSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

const root = resolve(__dirname, '..');
const files = readdirSync(join(root, 'tests'))
  .filter(name => name.endsWith('.test.cjs'))
  .sort()
  .map(name => join(root, 'tests', name));
if (files.length === 0) throw new Error('No test files found');
const result = spawnSync(process.execPath, ['--test', ...files], { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
