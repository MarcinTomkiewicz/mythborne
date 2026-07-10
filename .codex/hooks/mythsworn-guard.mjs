import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const GENERATED_TYPES_PATH = 'src/app/core/types/database.types.ts';
const STATUS_DOCS = new Set([
  'docs/current-todo.md',
  'docs/current-state-summary.md',
]);
const TYPE_OWNERSHIP_SEGMENTS = [
  '/core/domain/',
  '/core/interfaces/',
  '/core/types/',
];

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function lines(value) {
  return value ? value.split(/\r?\n/u).filter(Boolean) : [];
}

function normalizePath(path) {
  return path.replaceAll('\\', '/');
}

function readHookInput() {
  if (process.stdin.isTTY) {
    return null;
  }

  try {
    const input = readFileSync(0, 'utf8').trim();
    return input ? JSON.parse(input) : null;
  } catch {
    return null;
  }
}

function isProductionTypeScript(path) {
  return (
    path.startsWith('src/app/') &&
    path.endsWith('.ts') &&
    !path.endsWith('.spec.ts') &&
    path !== GENERATED_TYPES_PATH
  );
}

function ownsNamedTypes(path) {
  const wrapped = `/${path}`;
  return TYPE_OWNERSHIP_SEGMENTS.some((segment) => wrapped.includes(segment));
}

function isLiteralUnion(typeNode, ts) {
  const nodes = ts.isUnionTypeNode(typeNode) ? typeNode.types : [typeNode];
  return nodes.length > 0 && nodes.every((node) => ts.isLiteralTypeNode(node));
}

function isObjectShapeAlias(typeNode, ts) {
  if (ts.isTypeLiteralNode(typeNode) || ts.isMappedTypeNode(typeNode)) {
    return true;
  }

  if (ts.isUnionTypeNode(typeNode) || ts.isIntersectionTypeNode(typeNode)) {
    return typeNode.types.some((node) => isObjectShapeAlias(node, ts));
  }

  if (ts.isTypeReferenceNode(typeNode)) {
    const name = typeNode.typeName.getText();
    return ['Omit', 'Partial', 'Pick', 'Readonly', 'Record', 'Required'].includes(name);
  }

  return false;
}

async function auditTypeScript(path, content, errors, warnings) {
  let ts;

  try {
    const typescriptModule = await import('typescript');
    ts = typescriptModule.default ?? typescriptModule;
  } catch {
    if (/^\s*(?:export\s+)?interface\s+[A-Za-z_$]/mu.test(content)) {
      errors.push(`${path}: local interface declaration outside type ownership`);
    }
    if (/^\s*(?:export\s+)?type\s+[A-Za-z_$][\w$]*(?:<[^>]+>)?\s*=\s*\{/mu.test(content)) {
      errors.push(`${path}: local object-shape type declaration outside type ownership`);
    }
    warnings.push(`${path}: TypeScript package unavailable; guard used regex fallback`);
    return;
  }

  const source = ts.createSourceFile(
    path,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  for (const statement of source.statements) {
    if (ts.isInterfaceDeclaration(statement)) {
      errors.push(`${path}: interface ${statement.name.text} must move to core/interfaces or domain ownership`);
      continue;
    }

    if (ts.isTypeAliasDeclaration(statement)) {
      if (isObjectShapeAlias(statement.type, ts)) {
        errors.push(`${path}: object-shape type ${statement.name.text} must move to core/types or domain ownership`);
      } else if (!isLiteralUnion(statement.type, ts)) {
        warnings.push(`${path}: review local type alias ${statement.name.text}; only trivial implementation literal unions may stay local`);
      }
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          /^[A-Z][A-Z0-9_]+$/u.test(declaration.name.text)
        ) {
          warnings.push(`${path}: review local constant ${declaration.name.text} for core/config ownership`);
        }
      }
    }
  }
}

function formatSection(label, values) {
  if (values.length === 0) {
    return [];
  }
  return [label, ...values.map((value) => `- ${value}`)];
}

function respondToHook(hookInput, errors, warnings) {
  if (errors.length === 0) {
    process.stdout.write('{}');
    return;
  }

  const reason = [
    'Mythsworn guard found blocking violations:',
    ...errors.map((error) => `- ${error}`),
    ...formatSection('Warnings:', warnings),
    'Fix the violations and run `npm run codex:guard` again.',
  ].join('\n');

  if (hookInput?.stop_hook_active) {
    process.stdout.write(JSON.stringify({ systemMessage: reason }));
    return;
  }

  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
}

async function main() {
  const hookInput = readHookInput();
  const root = git(['rev-parse', '--show-toplevel']);
  process.chdir(root);

  const changed = new Set([
    ...lines(git(['diff', 'HEAD', '--name-only', '--diff-filter=ACMR'])),
    ...lines(git(['ls-files', '--others', '--exclude-standard'])),
  ].map(normalizePath));

  const errors = [];
  const warnings = [];

  for (const path of [...changed].sort()) {
    if (path === GENERATED_TYPES_PATH) {
      errors.push(`${path}: generated types are user/Migrator-owned and must not be edited by Codex`);
      continue;
    }

    if (STATUS_DOCS.has(path)) {
      warnings.push(`${path}: status document changed; user approval is required`);
    }

    if (path.endsWith('.scss') && path.startsWith('src/app/')) {
      warnings.push(`${path}: justify local SCSS and verify that no existing utility/pattern covers it`);
    }

    if (!isProductionTypeScript(path)) {
      continue;
    }

    const content = readFileSync(path, 'utf8');

    if (/\$any\s*\(/u.test(content)) {
      errors.push(`${path}: $any(...) is forbidden`);
    }

    if (
      /\.from\s*\([^)]*\)[\s\S]{0,400}\.(?:delete|insert|update|upsert)\s*\(/u.test(content)
    ) {
      errors.push(`${path}: direct table mutation detected; use the canonical RPC/domain workflow`);
    }

    const lineCount = content.split(/\r?\n/u).length;
    if (lineCount >= 400) {
      warnings.push(`${path}: ${lineCount} lines; AGENTS.md requires an explicit cleanup/splitting decision`);
    }

    if (!ownsNamedTypes(path)) {
      await auditTypeScript(path, content, errors, warnings);
    }
  }

  if (hookInput) {
    respondToHook(hookInput, errors, warnings);
    return;
  }

  for (const line of formatSection('BLOCKERS', errors)) {
    console.error(line);
  }
  for (const line of formatSection('WARNINGS', warnings)) {
    console.warn(line);
  }

  if (errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(
    warnings.length > 0
      ? 'Mythsworn guard passed with warnings.'
      : 'Mythsworn guard passed.',
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Mythsworn guard failed: ${message}`);
  process.exitCode = 1;
});
