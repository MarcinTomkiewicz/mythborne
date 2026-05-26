import { CombatResultDetailReadModel } from '../domain/combat/combat-live.model';
import {
  ExplorationOutcomeViewModel,
  ExplorationReportActionsViewModel,
  ExplorationResultOutcomeTone,
  ExplorationResultSourceInput,
  ExplorationResultSourceKind,
  ExplorationRewardTextViewModel,
} from '../domain/exploration/exploration-result-display.model';
import { Json } from '../types/database.types';
import {
  combatReportDirectReportId,
  combatReportNarrativeLines,
  combatReportOutcomeTitle,
  combatReportOutcomeToneText,
  combatReportPublicPath,
  combatReportPublicToken,
  combatReportSummaryText,
  combatRewardHeadingText,
  combatRewardIntroText,
} from './combat-report-text.mapper';

export function explorationResultSourceKind(
  source: ExplorationResultSourceInput | null,
): ExplorationResultSourceKind {
  if (source?.trialDefinitionId) {
    return 'trial';
  }

  if (source?.encounterDefinitionId) {
    return 'encounter';
  }

  return 'unknown';
}

export function mapExplorationOutcomeView(input: {
  detail: CombatResultDetailReadModel | null;
  rawJson: Json | undefined;
  sourceKind: ExplorationResultSourceKind;
}): ExplorationOutcomeViewModel {
  const tone = explorationResultOutcomeTone({
    detail: input.detail,
    rawJson: input.rawJson,
  });

  return {
    title: explorationResultOutcomeTitle({
      detail: input.detail,
      rawJson: input.rawJson,
      tone,
      sourceKind: input.sourceKind,
    }),
    tone,
    narrativeLines: explorationResultNarrativeLines(input.rawJson),
  };
}

export function mapExplorationRewardText(input: {
  rewardRawJson: Json | undefined;
  combatRawJson: Json | undefined;
  sourceKind: ExplorationResultSourceKind;
}): ExplorationRewardTextViewModel {
  return {
    heading: explorationRewardHeading(input),
    intro: explorationRewardIntro(input),
  };
}

export function mapExplorationReportActions(
  rawJson: Json | undefined,
): ExplorationReportActionsViewModel {
  const directReportLink = explorationDirectReportLink(rawJson);
  const publicReportPath = explorationPublicReportPath(rawJson);

  return {
    directReportLink,
    directReportLabel: explorationDirectReportLabel(directReportLink),
    publicReportPath,
    hasPublicReportLink: publicReportPath !== null,
  };
}

export function explorationResultNarrativeLines(rawJson: Json | undefined): string[] {
  const lines = combatReportNarrativeLines(rawJson);

  if (lines.length) {
    return lines;
  }

  const fallbackLine = combatReportSummaryText(rawJson);

  return fallbackLine ? [fallbackLine] : [];
}

export function explorationResultOutcomeTone(input: {
  detail: CombatResultDetailReadModel | null;
  rawJson: Json | undefined;
}): ExplorationResultOutcomeTone {
  const backendTone = combatReportOutcomeToneText(input.rawJson)?.toLowerCase();

  if (backendTone?.includes('win') || backendTone?.includes('success')) {
    return 'success';
  }

  if (backendTone?.includes('loss') || backendTone?.includes('danger')) {
    return 'danger';
  }

  if (backendTone?.includes('draw') || backendTone?.includes('warn')) {
    return 'warning';
  }

  if (input.detail?.outcome === 'draw') {
    return 'warning';
  }

  if (input.detail?.winnerSide === 'initiator') {
    return 'success';
  }

  if (input.detail?.winnerSide === 'defender') {
    return 'danger';
  }

  return 'neutral';
}

export function explorationResultOutcomeTitle(input: {
  detail: CombatResultDetailReadModel | null;
  rawJson: Json | undefined;
  sourceKind: ExplorationResultSourceKind;
  tone: ExplorationResultOutcomeTone;
}): string {
  return combatReportOutcomeTitle(input.rawJson) ?? explorationOutcomeBannerLabel({
    outcome: input.detail?.outcome ?? null,
    tone: input.tone,
    sourceKind: input.sourceKind,
  });
}

export function explorationDirectReportLink(rawJson: Json | undefined): string {
  const reportId = combatReportDirectReportId(rawJson);

  return reportId ? `/game/reports/${reportId}` : '/game/reports';
}

export function explorationDirectReportLabel(link: string): string {
  return link === '/game/reports'
    ? 'Otwórz centrum raportów'
    : 'Otwórz pełny raport';
}

export function explorationPublicReportPath(rawJson: Json | undefined): string | null {
  return combatReportPublicPath(rawJson) ?? publicReportPathFromToken(rawJson);
}

export function explorationRewardHeading(input: {
  rewardRawJson: Json | undefined;
  combatRawJson: Json | undefined;
  sourceKind: ExplorationResultSourceKind;
}): string {
  return combatRewardHeadingText(input) ??
    (
      input.sourceKind === 'trial'
        ? 'Nagroda'
        : 'Zysk wyprawy'
    );
}

export function explorationRewardIntro(input: {
  rewardRawJson: Json | undefined;
  combatRawJson: Json | undefined;
  sourceKind: ExplorationResultSourceKind;
}): string {
  return combatRewardIntroText(input) ?? (
    input.sourceKind === 'trial'
      ? 'Nagroda:'
      : 'Zysk wyprawy:'
  );
}

export function explorationReportRewardDisplay<
  TReward extends { entries: readonly { entryKind: string }[] },
>(reward: TReward | null): TReward | null {
  return reward
    ? {
        ...reward,
        entries: reward.entries.filter((entry) =>
          entry.entryKind !== 'character_points' &&
          entry.entryKind !== 'hero_points',
        ),
      }
    : null;
}

export function explorationOutcomeBannerLabel(input: {
  outcome: string | null;
  tone: ExplorationResultOutcomeTone;
  sourceKind: ExplorationResultSourceKind;
}): string {
  if (input.outcome === 'draw') {
    return 'Walka zakończona remisem';
  }

  if (input.tone === 'success') {
    return input.sourceKind === 'trial'
      ? 'Próba rozstrzygnięta'
      : 'Wyprawa zakończona zwycięstwem';
  }

  if (input.tone === 'danger') {
    return input.sourceKind === 'trial'
      ? 'Próba nieudana'
      : 'Wyprawa zakończona porażką';
  }

  return 'Wynik wyprawy';
}

function publicReportPathFromToken(rawJson: Json | undefined): string | null {
  const token = combatReportPublicToken(rawJson);

  return token ? `/report/${token}` : null;
}
