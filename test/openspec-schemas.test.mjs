import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, relative } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = realpathSync(mkdtempSync(join(tmpdir(), 'openspec-schemas-')));
const pkg = join(root, 'pkg');
const catalog = join(pkg, 'openspec', 'schemas');
const cli = join(pkg, 'bin', 'openspec-schemas.mjs');
const stub = join(root, 'stub');
let counter = 0;

// A copy of the package whose catalog holds the real schemas plus one extra,
// so multi-schema behaviour is exercised without touching the repository.
before(() => {
  cpSync(join(repo, 'bin'), join(pkg, 'bin'), { recursive: true });
  cpSync(join(repo, 'openspec', 'schemas'), catalog, { recursive: true });
  mkdirSync(join(catalog, 'zeta-demo', 'templates'), { recursive: true });
  writeFileSync(join(catalog, 'zeta-demo', 'schema.yaml'), 'name: zeta-demo\nversion: 1\ndescription: "Fixture schema"\n');
  writeFileSync(join(catalog, 'zeta-demo', 'templates', 'spec.md'), '# Spec\n');
  mkdirSync(join(catalog, 'not-a-schema'));

  mkdirSync(stub);
  writeFileSync(join(stub, 'openspec'), '#!/bin/sh\n{ pwd -P; printf "%s\\n" "$@"; } > "$STUB_LOG"\nexit "${STUB_EXIT:-0}"\n');
  chmodSync(join(stub, 'openspec'), 0o755);
});

after(() => rmSync(root, { recursive: true, force: true }));

function setup() {
  const dir = join(root, `case-${++counter}`);
  const project = join(dir, 'project');
  const data = join(dir, 'data');
  mkdirSync(project, { recursive: true });
  const env = { ...process.env, XDG_DATA_HOME: data, STUB_LOG: join(dir, 'stub.log'), PATH: `${stub}${delimiter}${process.env.PATH}` };
  return { dir, project, data, env, log: env.STUB_LOG };
}

function run(args, { cwd, env }) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, env, encoding: 'utf8' });
}

function files(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)))
    .sort();
}

function assertSameTree(actual, expected) {
  assert.deepEqual(files(actual), files(expected));
  for (const file of files(expected)) {
    assert.deepEqual(readFileSync(join(actual, file)), readFileSync(join(expected, file)), file);
  }
}

const schemasIn = (project) => join(project, 'openspec', 'schemas');
const catalogNames = () => ['lean-tdd', 'zeta-demo'];

test('list prints every schema sorted, with its description', () => {
  const { project, env } = setup();
  const result = run(['list'], { cwd: project, env });
  assert.equal(result.status, 0, result.stderr);
  const lines = result.stdout.trim().split('\n');
  assert.deepEqual(lines.map((line) => line.split(/\s+/)[0]), catalogNames());
  assert.match(lines[0], /^lean-tdd\s+OpenSpec artifacts for a Lean TDD cycle driven by acceptance criteria$/);
  assert.match(lines[1], /^zeta-demo\s+Fixture schema$/);
});

test('install copies one schema into the current project', () => {
  const { project, env } = setup();
  const result = run(['install', 'lean-tdd'], { cwd: project, env });
  assert.equal(result.status, 0, result.stderr);
  assertSameTree(join(schemasIn(project), 'lean-tdd'), join(catalog, 'lean-tdd'));
  assert.deepEqual(readdirSync(schemasIn(project)), ['lean-tdd']);
});

test('install copies several schemas into --dir', () => {
  const { dir, project, env } = setup();
  const result = run(['install', 'lean-tdd', 'zeta-demo', '--dir', project], { cwd: dir, env });
  assert.equal(result.status, 0, result.stderr);
  for (const name of ['lean-tdd', 'zeta-demo']) assertSameTree(join(schemasIn(project), name), join(catalog, name));
});

test('install rejects a --dir that does not exist', () => {
  const { dir, env } = setup();
  const missing = join(dir, 'missing');
  const result = run(['install', 'lean-tdd', '--dir', missing], { cwd: dir, env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, new RegExp(missing));
  assert.equal(existsSync(missing), false);
});

test('install with nothing requested prints usage', () => {
  const { project, env } = setup();
  const result = run(['install'], { cwd: project, env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Usage/);
});

test('install rejects unknown names before copying anything', () => {
  const { project, env } = setup();
  const result = run(['install', 'lean-tdd', 'lean-tddd'], { cwd: project, env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /lean-tddd/);
  assert.match(result.stderr, /lean-tdd, zeta-demo/);
  assert.equal(existsSync(schemasIn(project)), false);
});

test('install --all installs every schema and skips installed ones untouched', () => {
  const { project, env } = setup();
  const edited = join(schemasIn(project), 'lean-tdd', 'schema.yaml');
  mkdirSync(dirname(edited), { recursive: true });
  writeFileSync(edited, 'local edit\n');

  const result = run(['install', '--all'], { cwd: project, env });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(edited, 'utf8'), 'local edit\n');
  assert.deepEqual(files(join(schemasIn(project), 'lean-tdd')), ['schema.yaml']);
  assert.match(result.stdout, /Skipped lean-tdd/);
  assert.deepEqual(readdirSync(schemasIn(project)).sort(), catalogNames());
  assertSameTree(join(schemasIn(project), 'zeta-demo'), join(catalog, 'zeta-demo'));
});

test('install --user copies into $XDG_DATA_HOME/openspec/schemas', () => {
  const { project, data, env } = setup();
  const result = run(['install', 'lean-tdd', '--user'], { cwd: project, env });
  assert.equal(result.status, 0, result.stderr);
  assertSameTree(join(data, 'openspec', 'schemas', 'lean-tdd'), join(catalog, 'lean-tdd'));
  assert.equal(existsSync(schemasIn(project)), false);
});

test('install --user without XDG_DATA_HOME uses ~/.local/share/openspec/schemas', { skip: process.platform === 'win32' }, () => {
  const { dir, project, env } = setup();
  delete env.XDG_DATA_HOME;
  env.HOME = join(dir, 'home');
  const result = run(['install', '--all', '--user'], { cwd: project, env });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readdirSync(join(env.HOME, '.local', 'share', 'openspec', 'schemas')).sort(), catalogNames());
});

test('install rejects --user together with --dir', () => {
  const { project, data, env } = setup();
  const result = run(['install', 'lean-tdd', '--user', '--dir', project], { cwd: project, env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Usage/);
  assert.equal(existsSync(data), false);
  assert.equal(existsSync(schemasIn(project)), false);
});

// An installed copy that differs from the catalog, including a file the
// catalog no longer has.
function installOutdated(schemas, name) {
  cpSync(join(catalog, name), join(schemas, name), { recursive: true });
  writeFileSync(join(schemas, name, 'schema.yaml'), 'old\n');
  writeFileSync(join(schemas, name, 'removed.md'), 'gone upstream\n');
}

test('update replaces an outdated project copy with the catalog', () => {
  const { project, env } = setup();
  installOutdated(schemasIn(project), 'lean-tdd');
  const result = run(['update', 'lean-tdd'], { cwd: project, env });
  assert.equal(result.status, 0, result.stderr);
  assertSameTree(join(schemasIn(project), 'lean-tdd'), join(catalog, 'lean-tdd'));
  assert.match(result.stdout, /Updated lean-tdd/);
});

test('update reports a current copy as up to date', () => {
  const { project, env } = setup();
  assert.equal(run(['install', 'lean-tdd'], { cwd: project, env }).status, 0);
  const result = run(['update', 'lean-tdd'], { cwd: project, env });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /lean-tdd is up to date/);
});

test('update --user replaces the user-level copy', () => {
  const { project, data, env } = setup();
  const schemas = join(data, 'openspec', 'schemas');
  installOutdated(schemas, 'lean-tdd');
  const result = run(['update', 'lean-tdd', '--user'], { cwd: project, env });
  assert.equal(result.status, 0, result.stderr);
  assertSameTree(join(schemas, 'lean-tdd'), join(catalog, 'lean-tdd'));
});

test('update reports a schema that is not installed', () => {
  const { project, env } = setup();
  const result = run(['update', 'lean-tdd'], { cwd: project, env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /lean-tdd is not installed.*install/);
  assert.equal(existsSync(join(schemasIn(project), 'lean-tdd')), false);
});

test('update --all updates only installed schemas', () => {
  const { project, env } = setup();
  installOutdated(schemasIn(project), 'lean-tdd');
  const result = run(['update', '--all'], { cwd: project, env });
  assert.equal(result.status, 0, result.stderr);
  assertSameTree(join(schemasIn(project), 'lean-tdd'), join(catalog, 'lean-tdd'));
  assert.deepEqual(readdirSync(schemasIn(project)), ['lean-tdd']);
});

const realOpenspec = spawnSync('openspec', ['--version'], { encoding: 'utf8' }).status === 0;

test('OpenSpec resolves a user-level install from a bare project', { skip: !realOpenspec && 'openspec not on PATH' }, () => {
  const { project, data, env } = setup();
  env.PATH = process.env.PATH;
  assert.equal(run(['install', '--all', '--user'], { cwd: project, env }).status, 0);
  const which = spawnSync('openspec', ['schema', 'which', 'lean-tdd', '--json'], { cwd: project, env, encoding: 'utf8' });
  assert.equal(which.status, 0, which.stderr);
  const resolved = JSON.parse(which.stdout);
  assert.equal(resolved.source, 'user');
  assert.equal(resolved.path, join(data, 'openspec', 'schemas', 'lean-tdd'));
});

function stubCall(log) {
  const [cwd, ...args] = readFileSync(log, 'utf8').trim().split('\n');
  return { cwd, args };
}

test('new installs a missing schema into the project, then starts the change', () => {
  const { project, env, log } = setup();
  const config = join(project, 'openspec', 'config.yaml');
  mkdirSync(dirname(config), { recursive: true });
  writeFileSync(config, 'schema: spec-driven\n');

  const result = run(['new', 'lean-tdd', 'add-login'], { cwd: project, env });
  assert.equal(result.status, 0, result.stderr);
  assertSameTree(join(schemasIn(project), 'lean-tdd'), join(catalog, 'lean-tdd'));
  assert.deepEqual(stubCall(log), { cwd: project, args: ['new', 'change', 'add-login', '--schema', 'lean-tdd'] });
  assert.equal(readFileSync(config, 'utf8'), 'schema: spec-driven\n');
});

test('new uses a user-level schema without copying it into the project', () => {
  const { dir, project, data, env, log } = setup();
  assert.equal(run(['install', 'lean-tdd', '--user'], { cwd: project, env }).status, 0);
  const result = run(['new', 'lean-tdd', 'add-login', '--dir', project], { cwd: dir, env });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(schemasIn(project)), false);
  assert.ok(existsSync(join(data, 'openspec', 'schemas', 'lean-tdd')));
  assert.deepEqual(stubCall(log).args, ['new', 'change', 'add-login', '--schema', 'lean-tdd']);
});

test('new rejects an invalid change name without installing', () => {
  const { project, env, log } = setup();
  const result = run(['new', 'lean-tdd', 'Add Login'], { cwd: project, env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Usage/);
  assert.equal(existsSync(schemasIn(project)), false);
  assert.equal(existsSync(log), false);
});

test('new rejects an unknown schema without installing', () => {
  const { project, env, log } = setup();
  const result = run(['new', 'lean-tddd', 'add-login'], { cwd: project, env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /lean-tddd/);
  assert.equal(existsSync(schemasIn(project)), false);
  assert.equal(existsSync(log), false);
});

test('new exits with the status of openspec new change', () => {
  const { project, env } = setup();
  env.STUB_EXIT = '3';
  assert.equal(run(['new', 'lean-tdd', 'add-login'], { cwd: project, env }).status, 3);
});
