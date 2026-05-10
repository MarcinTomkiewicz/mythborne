import {
  LuckChancePreview,
  TrialPowerRead,
} from '../../../core/domain/luck/luck.model';

export interface TrialPowerComparisonRow {
  label: string;
  testedStatValue: number | null;
  luckValue: number | null;
  luckInfluence: number | null;
  trialPower: number | null;
}

export interface TrialChanceComparisonRow {
  label: string;
  luckValue: number | null;
  luckInfluence: number | null;
  opportunityChance: number | null;
  opportunityStep: number | null;
  opportunityStepCap: number | null;
  manifestationChance: number | null;
  trialPower: number | null;
}

export interface AutoResolveComparisonRow {
  label: string;
  testedStatValue: number | null;
  luckValue: number | null;
  luckInfluence: number | null;
  trialPower: number | null;
  finalChance: number | null;
  capPercent: number | null;
  rawChance: number | null;
  manualChanceReference: number | null;
}

export function toTrialPowerComparisonRow(
  label: string,
  trialPower: TrialPowerRead | null,
): TrialPowerComparisonRow {
  return {
    label,
    testedStatValue: trialPower?.testedStatValue ?? null,
    luckValue: trialPower?.luckValue ?? null,
    luckInfluence: trialPower?.luckInfluence ?? null,
    trialPower: trialPower?.trialPower ?? null,
  };
}

export function toTrialChanceComparisonRow(
  label: string,
  opportunity: LuckChancePreview | null,
  manifestation: LuckChancePreview | null,
): TrialChanceComparisonRow {
  const opportunityContext = recordContext(opportunity);

  return {
    label,
    luckValue: opportunity?.luckValue ?? manifestation?.luckValue ?? null,
    luckInfluence: opportunity?.luckInfluence ?? manifestation?.luckInfluence ?? null,
    opportunityChance: opportunity?.chancePercent ?? null,
    opportunityStep: numberContextValue(opportunityContext, 'projectedStepNumber'),
    opportunityStepCap: numberContextValue(opportunityContext, 'trialOpportunityStepCap'),
    manifestationChance: manifestation?.chancePercent ?? null,
    trialPower: manifestation?.trialPower ?? null,
  };
}

export function toAutoResolveComparisonRow(
  label: string,
  autoResolve: LuckChancePreview | null,
): AutoResolveComparisonRow {
  const context = recordContext(autoResolve);

  return {
    label,
    testedStatValue: autoResolve?.testedStatValue ?? null,
    luckValue: autoResolve?.luckValue ?? null,
    luckInfluence: autoResolve?.luckInfluence ?? null,
    trialPower: autoResolve?.trialPower ?? null,
    finalChance: autoResolve?.chancePercent ?? null,
    capPercent: numberContextValue(context, 'capPercent'),
    rawChance: numberContextValue(context, 'rawAutoResolveSuccessChance'),
    manualChanceReference: numberContextValue(context, 'manualChanceReference'),
  };
}

function recordContext(preview: LuckChancePreview | null): Record<string, unknown> {
  return preview?.contextJson &&
    typeof preview.contextJson === 'object' &&
    !Array.isArray(preview.contextJson)
    ? preview.contextJson
    : {};
}

function numberContextValue(
  context: Record<string, unknown>,
  key: string,
): number | null {
  const value = context[key];

  return typeof value === 'number' ? value : null;
}
