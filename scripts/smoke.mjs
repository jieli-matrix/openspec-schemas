import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const project = mkdtempSync(join(tmpdir(), 'openspec-lean-tdd-'));
const sourceSchema = join(root, 'openspec', 'schemas', 'lean-tdd');
const schemaDir = join(project, 'openspec', 'schemas', 'lean-tdd');

function run(args) {
  const result = spawnSync('openspec', args, {
    cwd: project,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: { ...process.env, OPENSPEC_TELEMETRY: '0' },
  });
  if (result.error || result.status !== 0) {
    throw new Error(`openspec ${args.join(' ')} failed:\n${result.stdout ?? ''}\n${result.stderr ?? ''}\n${result.error ?? ''}`);
  }
  return result.stdout;
}

try {
  mkdirSync(join(project, 'openspec', 'schemas'), { recursive: true });
  cpSync(sourceSchema, schemaDir, { recursive: true });
  run(['schema', 'validate', 'lean-tdd']);

  const sampleDir = join(project, 'openspec', 'changes', 'sample-change');
  mkdirSync(join(project, 'openspec', 'changes'), { recursive: true });
  cpSync(join(root, 'examples', 'sample-change'), sampleDir, { recursive: true });
  run(['validate', 'sample-change', '--strict', '--no-interactive']);

  for (const artifact of ['proposal', 'specs', 'design', 'tasks']) {
    const instruction = JSON.parse(run(['instructions', artifact, '--change', 'sample-change', '--json']));
    if (!instruction || instruction.artifactId !== artifact) {
      throw new Error(`Missing ${artifact} instructions`);
    }
    if (artifact === 'tasks' && !instruction.instruction?.includes('working skeleton')) {
      throw new Error('Missing walking-skeleton task guidance');
    }
  }
  const apply = JSON.parse(run(['instructions', 'apply', '--change', 'sample-change', '--json']));
  if (!apply.instruction?.includes('baseline') || !apply.instruction.includes('bones-out')) {
    throw new Error('Missing baseline or bones-out apply guidance');
  }

  run(['new', 'change', 'pilot-change', '--schema', 'lean-tdd']);
  const pilot = readFileSync(join(project, 'openspec', 'changes', 'pilot-change', '.openspec.yaml'), 'utf8');
  if (!pilot.includes('schema: lean-tdd')) throw new Error('Per-change selection failed');

  writeFileSync(join(project, 'openspec', 'config.yaml'), readFileSync(join(root, 'examples', 'config.yaml')));
  run(['new', 'change', 'default-change']);
  const selected = readFileSync(join(project, 'openspec', 'changes', 'default-change', '.openspec.yaml'), 'utf8');
  if (!selected.includes('schema: lean-tdd')) throw new Error('Project-default selection failed');

  process.stdout.write('Lean TDD consumer smoke check passed.\n');
} finally {
  rmSync(project, { recursive: true, force: true });
}
