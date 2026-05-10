import {
  LuckChancePreview,
  LuckLabExplanationRow as DomainExplanationRow,
  LuckFormulaReference,
  TrialPowerRead,
} from '../../../core/domain/luck/luck.model';
import { Json } from '../../../core/types/database.types';
import { LuckLabExplanationRow } from './luck-lab-explanation-list';

export function trialPowerExplanationRows(input: {
  trialPower: TrialPowerRead | null;
  domainRows: readonly DomainExplanationRow[];
}): LuckLabExplanationRow[] {
  return definedRows([
    fromDomainMetadata(input.domainRows, 'preview_luck_influence_and_trial_power', {
      explanation: input.trialPower?.explanation ?? null,
      metadata: formulaReferenceMetadata([
        input.trialPower?.luckInfluenceFormula,
        input.trialPower?.trialPowerFormula,
      ]),
      formulaTargetKeys: formulaTargetKeysFromReferences([
        input.trialPower?.luckInfluenceFormula,
        input.trialPower?.trialPowerFormula,
      ]),
    }),
  ]);
}

export function trialChanceExplanationRows(input: {
  opportunity: LuckChancePreview | null;
  manifestation: LuckChancePreview | null;
  domainRows: readonly DomainExplanationRow[];
}): LuckLabExplanationRow[] {
  return definedRows([
    fromDomainMetadata(input.domainRows, 'preview_trial_opportunity_curve', {
      explanation: input.opportunity?.explanation ?? null,
      metadata: chanceFormulaMetadata(input.opportunity),
      formulaTargetKeys: formulaTargetKeysFromReferences([
        input.opportunity?.formula,
      ]),
    }),
    fromDomainMetadata(input.domainRows, 'preview_trial_manifestation_chance', {
      explanation: input.manifestation?.explanation ?? null,
      metadata: chanceFormulaMetadata(input.manifestation),
      formulaTargetKeys: formulaTargetKeysFromReferences([
        input.manifestation?.formula,
      ]),
    }),
  ]);
}

export function autoResolveExplanationRows(input: {
  preview: LuckChancePreview | null;
  domainRows: readonly DomainExplanationRow[];
}): LuckLabExplanationRow[] {
  return definedRows([
    fromDomainMetadata(
      input.domainRows,
      'preview_challenge_auto_resolve_success_chance',
      {
        explanation: input.preview?.explanation ?? null,
        metadata: chanceFormulaMetadata(input.preview),
        formulaTargetKeys: formulaTargetKeysFromReferences([input.preview?.formula]),
      },
    ),
  ]);
}

export function encounterExplanationRows(input: {
  preview: LuckChancePreview | null;
  domainRows: readonly DomainExplanationRow[];
}): LuckLabExplanationRow[] {
  return definedRows([
    fromDomainMetadata(input.domainRows, 'preview_non_trial_encounter_chance', {
      explanation: input.preview?.explanation ?? null,
      metadata: chanceFormulaMetadata(input.preview),
      formulaTargetKeys: formulaTargetKeysFromReferences([input.preview?.formula]),
    }),
  ]);
}

export function combatExplanationRows(input: {
  explanation: string | null;
  domainRows: readonly DomainExplanationRow[];
  formulaTargetKeys: readonly string[];
}): LuckLabExplanationRow[] {
  return definedRows([
    fromDomainMetadata(input.domainRows, 'preview_combat_luck_formula_context', {
      explanation: input.explanation,
      formulaTargetKeys: input.formulaTargetKeys,
    }),
  ]);
}

export function generatedItemExplanationRows(input: {
  explanation: string | null;
  domainRows: readonly DomainExplanationRow[];
  bucketMetadata: string | null;
  formulaContextJson: Json;
}): LuckLabExplanationRow[] {
  return definedRows([
    fromDomainMetadata(input.domainRows, 'preview_reward_generated_item_luck', {
      explanation: input.explanation,
      metadata: input.bucketMetadata,
      formulaTargetKeys: formulaTargetKeysFromJson(input.formulaContextJson),
    }),
  ]);
}

export function dropDistributionExplanationRows(input: {
  explanation: string | null;
  reason: string | null;
  sampleSize: number | null;
  domainRows: readonly DomainExplanationRow[];
  formulaContextJson: Json;
  summaryJson: Json;
}): LuckLabExplanationRow[] {
  return definedRows([
    fromDomainMetadata(
      input.domainRows,
      'preview_reward_generated_item_distribution_luck',
      {
        explanation: input.explanation ?? input.reason,
        metadata: input.sampleSize === null ? null : `Roll count ${input.sampleSize}`,
        formulaTargetKeys: uniqueValues([
          ...formulaTargetKeysFromJson(input.formulaContextJson),
          ...formulaTargetKeysFromJson(input.summaryJson),
        ]),
      },
    ),
  ]);
}

function fromDomainMetadata(
  rows: readonly DomainExplanationRow[],
  lookupKey: string,
  details: {
    explanation?: string | null;
    metadata?: string | null;
    formulaTargetKeys?: readonly string[];
  } = {},
): LuckLabExplanationRow | null {
  if (rows.length === 0) {
    return null;
  }

  const row = rows.find((candidate) => matchesDomainRow(candidate, lookupKey));

  if (!row) {
    return null;
  }

  const textParts = [row.description || row.reason, details.explanation]
    .filter((part): part is string => Boolean(part?.trim()));
  const metadataParts = [row.helperText || row.reason, details.metadata]
    .filter((part): part is string => Boolean(part?.trim()));

  return {
    key: `${lookupKey}:${row.surfaceKey}`,
    label: row.label,
    text: textParts.join(' '),
    metadata: metadataParts.join(' '),
    formulaTargetKeys: uniqueValues(details.formulaTargetKeys ?? []),
  };
}

function matchesDomainRow(
  row: DomainExplanationRow,
  lookupKey: string,
): boolean {
  return row.surfaceKey === lookupKey || row.lookupKeys.includes(lookupKey);
}

function chanceFormulaMetadata(preview: LuckChancePreview | null): string | null {
  return preview?.formula ? formulaReferenceMetadata([preview.formula]) : null;
}

function formulaReferenceMetadata(
  formulas: readonly (Partial<LuckFormulaReference> | null | undefined)[],
): string | null {
  const returnedFormulas = formulas
    .map((formula) => {
      if (!formula?.formulaKey) {
        return null;
      }

      return formula.formulaExpression
        ? `${formula.formulaKey}: ${formula.formulaExpression}`
        : formula.formulaKey;
    })
    .filter((formula): formula is string => formula !== null);

  return returnedFormulas.length > 0
    ? `Formula: ${returnedFormulas.join(', ')}`
    : null;
}

function formulaTargetKeysFromReferences(
  formulas: readonly (Partial<LuckFormulaReference> | null | undefined)[],
): string[] {
  return uniqueValues(
    formulas
      .map((formula) => formula?.formulaKey ?? null)
      .filter((key): key is string => Boolean(key?.trim())),
  );
}

function formulaTargetKeysFromJson(value: Json): string[] {
  const keys = new Set<string>();

  collectFormulaTargetKeys(value, null, keys);

  return Array.from(keys);
}

function collectFormulaTargetKeys(
  value: unknown,
  propertyKey: string | null,
  keys: Set<string>,
): void {
  if (typeof value === 'string') {
    if (propertyKey && isFormulaReferenceProperty(propertyKey) && isFormulaTargetKey(value)) {
      keys.add(value);
    }

    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => collectFormulaTargetKeys(entry, propertyKey, keys));
    return;
  }

  Object.entries(value).forEach(([key, entry]) =>
    collectFormulaTargetKeys(entry, key, keys),
  );
}

function isFormulaReferenceProperty(key: string): boolean {
  const normalized = key.toLowerCase();

  return (
    (normalized.includes('formula') || normalized.includes('target')) &&
    !normalized.includes('expression') &&
    !normalized.endsWith('id') &&
    !normalized.endsWith('_id')
  );
}

function isFormulaTargetKey(value: string): boolean {
  return /^[a-z][a-z0-9_:-]*$/.test(value);
}

function uniqueValues(values: readonly string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function definedRows(
  rows: readonly (LuckLabExplanationRow | null)[],
): LuckLabExplanationRow[] {
  return rows.filter((row): row is LuckLabExplanationRow => row !== null);
}
