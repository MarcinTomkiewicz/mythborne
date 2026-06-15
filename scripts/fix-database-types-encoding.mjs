import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = resolve(process.argv[2] ?? 'src/app/core/types/database.types.ts');
const bytes = readFileSync(filePath);

let text;

if (bytes[0] === 0xff && bytes[1] === 0xfe) {
  text = bytes.toString('utf16le');
} else if (bytes[0] === 0xfe && bytes[1] === 0xff) {
  throw new Error(
    'UTF-16BE is not supported. Re-generate database.types.ts with tools/generate-db-types.mjs.',
  );
} else {
  text = bytes.toString('utf8');
}

const normalized = text
  .replace(/^\uFEFF/, '')
  .replace(/\r\n?/g, '\n');

writeFileSync(filePath, normalized, { encoding: 'utf8' });

console.log(`Rewritten as UTF-8 LF: ${filePath}`);