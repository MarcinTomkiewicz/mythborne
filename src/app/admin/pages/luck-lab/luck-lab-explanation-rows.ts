import {
  LuckChancePreview,
  LuckLabExplanationRow as DomainExplanationRow,
  LuckFormulaReference,
  TrialPowerRead,
} from '../../../core/domain/luck/luck.model';
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
    }),
    fromDomainMetadata(input.domainRows, 'preview_trial_manifestation_chance', {
      explanation: input.manifestation?.explanation ?? null,
      metadata: chanceFormulaMetadata(input.manifestation),
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
    }),
  ]);
}

export function combatExplanationRows(input: {
  explanation: string | null;
  domainRows: readonly DomainExplanationRow[];
}): LuckLabExplanationRow[] {
  return definedRows([
    fromDomainMetadata(input.domainRows, 'preview_combat_luck_formula_context', {
      explanation: input.explanation,
    }),
  ]);
}

export function generatedItemExplanationRows(input: {
  explanation: string | null;
  domainRows: readonly DomainExplanationRow[];
  bucketMetadata: string | null;
}): LuckLabExplanationRow[] {
  return definedRows([
    fromDomainMetadata(input.domainRows, 'preview_reward_generated_item_luck', {
      explanation: input.explanation,
      metadata: input.bucketMetadata,
    }),
  ]);
}

export function dropDistributionExplanationRows(input: {
  explanation: string | null;
  reason: string | null;
  sampleSize: number | null;
  domainRows: readonly DomainExplanationRow[];
}): LuckLabExplanationRow[] {
  return definedRows([
    fromDomainMetadata(
      input.domainRows,
      'preview_reward_generated_item_distribution_luck',
      {
        explanation: input.explanation ?? input.reason,
        metadata: input.sampleSize === null ? null : `Roll count ${input.sampleSize}`,
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

function definedRows(
  rows: readonly (LuckLabExplanationRow | null)[],
): LuckLabExplanationRow[] {
  return rows.filter((row): row is LuckLabExplanationRow => row !== null);
}
