#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = 'https://github.com/jieli-matrix/openspec-schemas.git';
const change = process.argv[2];
const project = resolve(process.argv[3] ?? '.');
if (!change || !/^[a-z0-9][a-z0-9-]*$/.test(change)) {
  console.error(`Usage: openspec-lean-tdd your-openspec-change [project-directory]\nSource: ${repository}`);
  process.exit(1);
}
if (!existsSync(project) || !statSync(project).isDirectory()) {
  console.error(`Project directory does not exist: ${project}`);
  process.exit(1);
}

const source = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'openspec', 'schemas', 'lean-tdd');
const target = join(project, 'openspec', 'schemas', 'lean-tdd');
mkdirSync(dirname(target), { recursive: true });
if (!existsSync(target)) {
  cpSync(source, target, { recursive: true });
  console.log(`Installed lean-tdd from ${repository}`);
}

const result = spawnSync('openspec', ['new', 'change', change, '--schema', 'lean-tdd'], {
  cwd: project,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, OPENSPEC_TELEMETRY: '0' },
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
