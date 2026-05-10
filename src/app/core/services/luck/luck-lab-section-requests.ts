import { forkJoin, map, Observable } from 'rxjs';
import {
  LuckInfluencePreview,
  LuckLabInputState,
  LuckLabPreviewResult,
  TrialPowerRead,
} from '../../domain/luck/luck.model';
import { RequestToken } from '../../utils/request-token';
import { LuckLabPreviews } from './luck-lab-previews';

export type LuckLabPreviewSection =
  | 'surfaces'
  | 'trialPower'
  | 'chancePreviews'
  | 'combat'
  | 'rewardProfile'
  | 'generatedItem'
  | 'dropDistribution';

export type SectionRecord<T> = Record<LuckLabPreviewSection, T>;

export const PREVIEW_SECTIONS: readonly LuckLabPreviewSection[] = [
  'surfaces',
  'trialPower',
  'chancePreviews',
  'combat',
  'rewardProfile',
  'generatedItem',
  'dropDistribution',
];

export const FAST_PREVIEW_SECTIONS: readonly LuckLabPreviewSection[] =
  PREVIEW_SECTIONS.filter(
    (section) => section !== 'surfaces' && section !== 'dropDistribution',
  );
export const DROP_DISTRIBUTION_DEBOUNCE_MS = 900;

export function createSectionRecord<T>(value: T): SectionRecord<T> {
  return PREVIEW_SECTIONS.reduce(
    (record, section) => ({
      ...record,
      [section]: value,
    }),
    {} as SectionRecord<T>,
  );
}

export function createSectionTokens(): SectionRecord<RequestToken> {
  return PREVIEW_SECTIONS.reduce(
    (record, section) => ({
      ...record,
      [section]: new RequestToken(),
    }),
    {} as SectionRecord<RequestToken>,
  );
}

export function luckLabSectionRequest(
  previews: LuckLabPreviews,
  section: LuckLabPreviewSection,
  input: LuckLabInputState,
): Observable<unknown> {
  switch (section) {
    case 'surfaces':
      return previews.getSurfaces();
    case 'trialPower':
      return previews.previewTrialPower(input);
    case 'chancePreviews':
      return forkJoin([
        previews.previewTrialOpportunity(input),
        previews.previewTrialManifestation(input),
        previews.previewChallengeAutoResolve(input),
        previews.previewNonTrialEncounter(input),
        previews.previewExplorationRngChain(input),
      ]).pipe(map((rows) => rows.flat()));
    case 'combat':
      return previews.previewCombat(input);
    case 'rewardProfile':
      return previews.previewRewardProfile(input);
    case 'generatedItem':
      return previews.previewGeneratedItem(input);
    case 'dropDistribution':
      return previews.previewDropDistribution(input);
  }
}

export function luckLabSectionPatch(
  section: LuckLabPreviewSection,
  value: unknown,
): Partial<Pick<
  LuckLabPreviewResult,
  | 'surfaces'
  | 'luckInfluence'
  | 'trialPower'
  | 'chancePreviews'
  | 'combatPreview'
  | 'rewardRangePreviews'
  | 'generatedItemPreviews'
  | 'dropDistribution'
>> {
  switch (section) {
    case 'surfaces':
      return { surfaces: value as LuckLabPreviewResult['surfaces'] };
    case 'trialPower': {
      const rows = value as TrialPowerRead[];
      const trialPower = rows[0] ?? null;

      return {
        luckInfluence: trialPower ? toLuckInfluencePreview(trialPower) : null,
        trialPower,
      };
    }
    case 'chancePreviews':
      return { chancePreviews: value as LuckLabPreviewResult['chancePreviews'] };
    case 'combat': {
      const rows = value as NonNullable<LuckLabPreviewResult['combatPreview']>[];

      return { combatPreview: rows[0] ?? null };
    }
    case 'rewardProfile':
      return {
        rewardRangePreviews: value as LuckLabPreviewResult['rewardRangePreviews'],
      };
    case 'generatedItem':
      return {
        generatedItemPreviews: value as LuckLabPreviewResult['generatedItemPreviews'],
      };
    case 'dropDistribution':
      return { dropDistribution: value as LuckLabPreviewResult['dropDistribution'] };
  }
}

function toLuckInfluencePreview(trialPower: TrialPowerRead): LuckInfluencePreview {
  return {
    luckValue: trialPower.luckValue,
    luckInfluence: trialPower.luckInfluence,
    formula: trialPower.luckInfluenceFormula,
    explanation: trialPower.explanation,
  };
}
