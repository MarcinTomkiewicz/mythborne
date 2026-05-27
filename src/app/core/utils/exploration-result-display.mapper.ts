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
  gameReportSummaryText,
} from './game-report-text.mapper';
import { jsonRecord, optionalText, read } from './json-read';
import { normalizeKeyText } from './normalize-text';

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
    sourceKind: input.sourceKind,
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
  sourceKind: ExplorationResultSourceKind;
}): ExplorationResultOutcomeTone {
  const backendTone = semanticOutcomeTone(
    gameReportOutcomeToneText(input.rawJson),
    input.sourceKind,
  );

  if (backendTone) {
    return backendTone;
  }

  return combatOutcomeTone(input.rawJson, input.sourceKind) ?? 'neutral';
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
      input.sourceKind !== 'encounter'
        ? 'Nagroda'
        : 'Zysk wyprawy'
    );
}

export function explorationRewardIntro(input: {
  rewardRawJson: Json | undefined;
  reportRawJson: Json | undefined;
  sourceKind: ExplorationResultSourceKind;
}): string {
  return (
    input.sourceKind !== 'encounter'
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
    return input.sourceKind === 'encounter'
      ? 'Walka zakończona zwycięstwem'
      : 'Próba zakończona sukcesem';
  }

  if (input.tone === 'danger') {
    return input.sourceKind === 'encounter'
      ? 'Walka zakończona porażką'
      : 'Próba nieudana';
  }

  if (input.tone === 'warning') {
    return input.sourceKind === 'encounter'
      ? 'Walka nierozstrzygnięta'
      : 'Próba nierozstrzygnięta';
  }

  return input.sourceKind === 'encounter'
    ? 'Wynik walki'
    : 'Wynik próby';
}

function publicReportPathFromToken(rawJson: Json | undefined): string | null {
  const token = gameReportPublicToken(rawJson);

  return token ? `/report/${token}` : null;
}

function semanticOutcomeTone(
  value: string | null,
  sourceKind: ExplorationResultSourceKind,
): ExplorationResultOutcomeTone | null {
  switch (normalizeKeyText(value)) {
    case 'success':
    case 'victory':
    case 'win':
    case 'hero_victory':
    case 'hero_win':
      return 'success';
    case 'danger':
    case 'defeat':
    case 'loss':
    case 'hero_defeat':
    case 'hero_loss':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'draw':
    case 'tie':
    case 'stalemate':
      return sourceKind === 'encounter' ? 'warning' : 'danger';
    case 'neutral':
      return 'neutral';
    default:
      return null;
  }
}

function combatOutcomeTone(
  rawJson: Json | undefined,
  sourceKind: ExplorationResultSourceKind,
): ExplorationResultOutcomeTone | null {
  const raw = jsonRecord(rawJson);
  const section = jsonRecord(read(
    raw,
    'combatSection',
    'combat_section',
    'combatSectionJson',
    'combat_section_json',
  ));
  const participants = read(section, 'participants');
  const winnerSide = normalizeKeyText(optionalText(read(section, 'winnerSide', 'winner_side')));
  const loserSide = normalizeKeyText(optionalText(read(section, 'loserSide', 'loser_side')));
  let heroSide = '';

  if (Array.isArray(participants)) {
    for (const participant of participants) {
      const record = jsonRecord(participant);
      const kind = normalizeKeyText(optionalText(read(record, 'participantKind', 'participant_kind', 'kind')));
      const side = normalizeKeyText(optionalText(read(record, 'side')));

      if (kind === 'hero' && side) {
        heroSide = side;
        break;
      }
    }
  }

  if (heroSide && winnerSide && heroSide === winnerSide) {
    return 'success';
  }

  if (heroSide && loserSide && heroSide === loserSide) {
    return 'danger';
  }

  if (winnerSide || loserSide) {
    return null;
  }

  switch (normalizeKeyText(optionalText(read(section, 'outcome', 'outcome_key')))) {
    case 'draw':
    case 'tie':
    case 'stalemate':
      return sourceKind === 'encounter' ? 'warning' : 'danger';
    default:
      return null;
  }
}
