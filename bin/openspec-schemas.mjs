#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const repository = 'https://github.com/jieli-matrix/openspec-schemas.git';
const catalog = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'openspec', 'schemas');
const usage = `Usage:
  openspec-schemas list
  openspec-schemas install <schema>... [--dir <project> | --user]
  openspec-schemas install --all [--dir <project> | --user]
  openspec-schemas new <schema> <change> [--dir <project>]
Source: ${repository}`;

function fail(message) {
  console.error(message);
  process.exit(1);
}

// The catalog is every folder under openspec/schemas/ that holds a schema.yaml.
function schemaNames() {
  return readdirSync(catalog, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(catalog, entry.name, 'schema.yaml')))
    .map((entry) => entry.name)
    .sort();
}

function description(name) {
  const yaml = readFileSync(join(catalog, name, 'schema.yaml'), 'utf8');
  return (yaml.match(/^description:[ \t]*(.*)$/m)?.[1] ?? '').trim().replace(/^(['"])(.*)\1$/, '$2');
}

function requireKnown(names) {
  const available = schemaNames();
  const unknown = names.filter((name) => !available.includes(name));
  if (unknown.length) fail(`Unknown schema: ${unknown.join(', ')}\nAvailable: ${available.join(', ')}`);
}

// Mirrors OpenSpec's getGlobalDataDir(), so OpenSpec resolves what --user installs.
function userSchemasDir() {
  const data = process.env.XDG_DATA_HOME
    || (process.platform === 'win32'
      ? process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local')
      : join(homedir(), '.local', 'share'));
  return join(data, 'openspec', 'schemas');
}

function projectDir(dir) {
  const project = resolve(dir ?? '.');
  if (!existsSync(project) || !statSync(project).isDirectory()) fail(`Project directory does not exist: ${project}`);
  return project;
}

// Installed schemas are never overwritten; updating them is left to the user.
function install(names, target) {
  mkdirSync(target, { recursive: true });
  for (const name of names) {
    const destination = join(target, name);
    if (existsSync(destination)) {
      console.log(`Skipped ${name}: already installed at ${destination}`);
      continue;
    }
    cpSync(join(catalog, name), destination, { recursive: true });
    console.log(`Installed ${name} to ${destination}`);
  }
}

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      all: { type: 'boolean' },
      user: { type: 'boolean' },
      dir: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
} catch (error) {
  fail(`${error.message}\n${usage}`);
}
const { values, positionals: [command, ...args] } = parsed;
if (values.help) {
  console.log(usage);
  process.exit(0);
}

if (command === 'list' && !args.length) {
  const names = schemaNames();
  const width = Math.max(...names.map((name) => name.length));
  for (const name of names) console.log(`${name.padEnd(width)}  ${description(name)}`);
} else if (command === 'install' && !(values.user && values.dir) && Boolean(values.all) !== Boolean(args.length)) {
  const names = values.all ? schemaNames() : args;
  requireKnown(names);
  install(names, values.user ? userSchemasDir() : join(projectDir(values.dir), 'openspec', 'schemas'));
} else if (command === 'new' && args.length === 2 && !values.all && !values.user && /^[a-z0-9][a-z0-9-]*$/.test(args[1])) {
  const [schema, change] = args;
  requireKnown([schema]);
  const project = projectDir(values.dir);
  const projectSchemas = join(project, 'openspec', 'schemas');
  if (![projectSchemas, userSchemasDir()].some((dir) => existsSync(join(dir, schema, 'schema.yaml')))) {
    install([schema], projectSchemas);
  }
  const result = spawnSync('openspec', ['new', 'change', change, '--schema', schema], {
    cwd: project,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, OPENSPEC_TELEMETRY: '0' },
  });
  if (result.error) console.error(result.error.message);
  process.exit(result.status ?? 1);
} else {
  fail(usage);
}
