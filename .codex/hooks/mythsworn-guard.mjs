import { execFileSync } from 'node:child_process';
import { basename } from 'node:path';
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
const MAX_IDENTIFIER_LENGTH = 40;
const MAX_FILE_BASENAME_LENGTH = 50;
const MAX_FUNCTION_LINES = 80;
const MAX_FILE_LINES = 400;

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

function isProductionTemplate(path) {
  return path.startsWith('src/app/') && path.endsWith('.html');
}

function isSharedTemplate(path) {
  return path.includes('/shared/');
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

function declarationName(node, ts) {
  if (node.name && ts.isIdentifier(node.name)) {
    return node.name.text;
  }
  if (node.name && (ts.isStringLiteral(node.name) || ts.isNumericLiteral(node.name))) {
    return node.name.text;
  }
  return null;
}

function declarationKind(node, ts) {
  if (ts.isClassDeclaration(node)) return 'class';
  if (ts.isInterfaceDeclaration(node)) return 'interface';
  if (ts.isTypeAliasDeclaration(node)) return 'type';
  if (ts.isEnumDeclaration(node)) return 'enum';
  if (ts.isEnumMember(node)) return 'enum member';
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) return 'function';
  if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) return 'method';
  if (ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) return 'member';
  if (ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) return 'accessor';
  if (ts.isParameter(node)) return 'parameter';
  if (ts.isVariableDeclaration(node)) return 'variable';
  if (ts.isBindingElement(node)) return 'binding';
  return null;
}

function functionLineCount(node, source, ts) {
  if (!node.body || !ts.isBlock(node.body)) {
    return 0;
  }
  const start = source.getLineAndCharacterOfPosition(node.body.getStart(source)).line;
  const end = source.getLineAndCharacterOfPosition(node.body.end).line;
  return end - start + 1;
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

  function visit(node) {
    const kind = declarationKind(node, ts);
    const name = declarationName(node, ts);

    if (kind && name && name.length > MAX_IDENTIFIER_LENGTH) {
      errors.push(`${path}: ${kind} ${name} has ${name.length} characters; shorten the name or split its responsibility`);
    }

    const bodyLines = functionLineCount(node, source, ts);
    if (bodyLines > MAX_FUNCTION_LINES) {
      errors.push(`${path}: ${kind ?? 'function'} ${name ?? '<anonymous>'} has ${bodyLines} body lines; split its responsibilities`);
    }

    ts.forEachChild(node, visit);
  }

  visit(source);

  if (!ownsNamedTypes(path)) {
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
}

function auditTemplate(path, content, errors) {
  if (isSharedTemplate(path)) {
    return;
  }

  const patterns = [
    ['ng-template', /<ng-template\b/u],
    ['ng-container', /<ng-container\b/u],
    ['ngTemplateOutlet', /\bngTemplateOutlet\b/u],
    ['pTemplate', /\bpTemplate\b/u],
  ];

  for (const [label, pattern] of patterns) {
    if (pattern.test(content)) {
      errors.push(`${path}: ${label} is forbidden in feature/page templates; replace it with a dedicated shared component`);
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

    if (isProductionTemplate(path)) {
      auditTemplate(path, readFileSync(path, 'utf8'), errors);
    }

    if (!isProductionTypeScript(path)) {
      continue;
    }

    const fileName = basename(path);
    if (fileName.length > MAX_FILE_BASENAME_LENGTH) {
      errors.push(`${path}: filename has ${fileName.length} characters; shorten it or split the file responsibility`);
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
    if (lineCount >= MAX_FILE_LINES) {
      errors.push(`${path}: ${lineCount} lines; split touched-file responsibilities before completion`);
    }

    await auditTypeScript(path, content, errors, warnings);
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
