import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const change = process.argv[2];
const project = resolve(process.argv[3] ?? '.');
if (!change || !/^[a-z0-9][a-z0-9-]*$/.test(change)) {
  console.error('Usage: node scripts/start.mjs <change-name> [project-directory]');
  process.exit(1);
}
if (!existsSync(project) || !statSync(project).isDirectory()) {
  console.error(`Project directory does not exist: ${project}`);
  process.exit(1);
}

const source = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'openspec', 'schemas', 'lean-tdd');
const target = join(project, 'openspec', 'schemas', 'lean-tdd');
mkdirSync(dirname(target), { recursive: true });
if (!existsSync(target)) cpSync(source, target, { recursive: true });

const result = spawnSync('openspec', ['new', 'change', change, '--schema', 'lean-tdd'], {
  cwd: project,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, OPENSPEC_TELEMETRY: '0' },
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
