import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const projectRef = 'acxrgywwpzlhuoklpxrn';
const outPath =
  process.env.SUPABASE_TYPES_OUT ??
  process.argv[3] ??
  'src/app/core/types/database.types.ts';
const schema = process.env.SUPABASE_SCHEMA ?? 'public';

if (!projectRef) {
  throw new Error('Missing SUPABASE_PROJECT_REF env variable or first CLI argument.');
}

const absoluteOutPath = resolve(outPath);

function shellQuote(value) {
  return `"${String(value).replace(/"/g, '\\"')}"`;
}

const command = [
  'npx',
  'supabase',
  'gen',
  'types',
  'typescript',
  '--project-id',
  shellQuote(projectRef),
  '--schema',
  shellQuote(schema),
].join(' ');

const output = execSync(command, {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  stdio: ['ignore', 'pipe', 'inherit'],
  shell: true,
});

const normalized = output
  .replace(/^\uFEFF/, '')
  .replace(/\r\n?/g, '\n');

mkdirSync(dirname(absoluteOutPath), { recursive: true });
writeFileSync(absoluteOutPath, normalized, { encoding: 'utf8' });

console.log(`Generated Supabase types: ${absoluteOutPath}`);
