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
  gameReportDirectReportId,
  gameReportNarrativeLines,
  gameReportOutcomeTitle,
  gameReportOutcomeToneText,
  gameReportPublicPath,
  gameReportPublicToken,
  gameReportRewardHeadingText,
  gameReportRewardIntroText,
  gameReportSummaryText,
} from './game-report-text.mapper';

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
  rawJson: Json | undefined;
  sourceKind: ExplorationResultSourceKind;
}): ExplorationOutcomeViewModel {
  const tone = explorationResultOutcomeTone({
    rawJson: input.rawJson,
  });

  return {
    title: explorationResultOutcomeTitle({
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
  reportRawJson: Json | undefined;
  sourceKind: ExplorationResultSourceKind;
}): ExplorationRewardTextViewModel {
  return {
    heading: explorationRewardHeading(input),
    intro: explorationRewardIntro(input),
  };
}

export function mapExplorationReportActions(input: {
  rawJson: Json | undefined;
  directReportId?: string | null;
  publicReportPathFromDetail?: string | null;
}): ExplorationReportActionsViewModel {
  const directReportId = input.directReportId ?? explorationDirectReportId(input.rawJson);
  const directReportLink = directReportId ? `/game/reports/${directReportId}` : '/game/reports';
  const publicReportPath = explorationPublicReportPath(input.rawJson)
    ?? input.publicReportPathFromDetail
    ?? null;

  return {
    directReportId,
    directReportLink,
    directReportLabel: explorationDirectReportLabel(directReportLink),
    publicReportPath,
    publicReportCopyLabel: publicReportPath
      ? 'Kopiuj link do raportu'
      : 'Link publiczny niedostępny',
    publicReportCopyDisabled: publicReportPath === null,
    publicReportUnavailableMessage: publicReportPath === null
      ? 'Publiczny link raportu nie jest dostępny w bieżącym odczycie raportu.'
      : null,
  };
}

export function explorationResultNarrativeLines(rawJson: Json | undefined): string[] {
  const lines = gameReportNarrativeLines(rawJson);

  if (lines.length) {
    return lines;
  }

  const fallbackLine = gameReportSummaryText(rawJson);

  return fallbackLine ? [fallbackLine] : [];
}

export function explorationResultOutcomeTone(input: {
  rawJson: Json | undefined;
}): ExplorationResultOutcomeTone {
  const backendTone = gameReportOutcomeToneText(input.rawJson)?.toLowerCase();

  if (backendTone?.includes('win') || backendTone?.includes('success')) {
    return 'success';
  }

  if (backendTone?.includes('loss') || backendTone?.includes('danger')) {
    return 'danger';
  }

  if (backendTone?.includes('draw') || backendTone?.includes('warn')) {
    return 'warning';
  }

  return 'neutral';
}

export function explorationResultOutcomeTitle(input: {
  rawJson: Json | undefined;
  sourceKind: ExplorationResultSourceKind;
  tone: ExplorationResultOutcomeTone;
}): string {
  return gameReportOutcomeTitle(input.rawJson) ?? explorationOutcomeBannerLabel({
    tone: input.tone,
    sourceKind: input.sourceKind,
  });
}

export function explorationDirectReportId(rawJson: Json | undefined): string | null {
  return gameReportDirectReportId(rawJson);
}

export function explorationDirectReportLabel(link: string): string {
  return link === '/game/reports'
    ? 'Otwórz centrum raportów'
    : 'Otwórz pełny raport';
}

export function explorationPublicReportPath(rawJson: Json | undefined): string | null {
  return gameReportPublicPath(rawJson) ?? publicReportPathFromToken(rawJson);
}

export function explorationRewardHeading(input: {
  rewardRawJson: Json | undefined;
  reportRawJson: Json | undefined;
  sourceKind: ExplorationResultSourceKind;
}): string {
  return gameReportRewardHeadingText({
    rewardRawJson: input.rewardRawJson,
    reportRawJson: input.reportRawJson,
  }) ??
    (
      input.sourceKind === 'trial'
        ? 'Nagroda'
        : 'Zysk wyprawy'
    );
}

export function explorationRewardIntro(input: {
  rewardRawJson: Json | undefined;
  reportRawJson: Json | undefined;
  sourceKind: ExplorationResultSourceKind;
}): string {
  return gameReportRewardIntroText({
    rewardRawJson: input.rewardRawJson,
    reportRawJson: input.reportRawJson,
  }) ?? (
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
  tone: ExplorationResultOutcomeTone;
  sourceKind: ExplorationResultSourceKind;
}): string {
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

  if (input.tone === 'warning') {
    return 'Wynik nierozstrzygnięty';
  }

  return 'Wynik wyzwania';
}

function publicReportPathFromToken(rawJson: Json | undefined): string | null {
  const token = gameReportPublicToken(rawJson);

  return token ? `/report/${token}` : null;
}
