import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const projectRef = process.env.SUPABASE_PROJECT_REF ?? process.argv[2];
const outPath = process.env.SUPABASE_TYPES_OUT ?? process.argv[3] ?? 'src/app/core/types/database.types.ts';
const schema = process.env.SUPABASE_SCHEMA ?? 'public';

if (!projectRef) {
  throw new Error('Missing SUPABASE_PROJECT_REF env variable or first CLI argument.');
}

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const absoluteOutPath = resolve(outPath);

const output = execFileSync(
  npx,
  [
    'supabase',
    'gen',
    'types',
    'typescript',
    '--project-id',
    projectRef,
    '--schema',
    schema,
  ],
  {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  },
);

const normalized = output
  .replace(/^﻿/, '')
  .replace(/
/g, '
');

mkdirSync(dirname(absoluteOutPath), { recursive: true });
writeFileSync(absoluteOutPath, normalized, { encoding: 'utf8' });
console.log(`Generated Supabase types: ${absoluteOutPath}`);
