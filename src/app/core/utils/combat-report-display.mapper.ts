import { CombatResultDetailReadModel } from '../domain/combat/combat-live.model';
import { CombatStageViewModel } from '../domain/combat/combat-stage.model';
import { PrivateGameReportDetail } from '../domain/reports/game-report.model';
import { ReportDetailCore } from '../domain/reports/report-detail.model';
import { Json } from '../types/database.types';
import { mapCompletedCombatStageView } from './combat-stage-display.mapper';
import { mapCompletedCombatLogGroups } from './combat-report-log.mapper';
import {
  combatParticipantPair,
  mapCompletedCombatParticipants,
} from './combat-report-participant.mapper';

export * from './combat-report-log.mapper';
export * from './combat-report-participant.mapper';
export * from './combat-report-text.mapper';

export function mapCompletedCombatReportStageView(
  report: PrivateGameReportDetail | null,
  context: {
    activeHeroId?: string | null;
    activeHeroPortraitSrc?: string | null;
  } = {},
): CombatStageViewModel | null {
  const detail = report ? combatDetailFromReport(report) : null;

  if (!detail || !report) {
    return null;
  }

  const participants = mapCompletedCombatParticipants({
    detail,
    liveParticipants: [],
    activeHeroId: context.activeHeroId ?? null,
    activeHeroPortraitSrc: context.activeHeroPortraitSrc ?? null,
  });
  const pair = combatParticipantPair(participants);

  return mapCompletedCombatStageView({
    ariaLabel: 'Raport walki',
    leftParticipant: pair.left,
    rightParticipant: pair.right,
    emptyParticipants: {
      leftTitle: 'Brak uczestnika',
      leftText: 'Raport walki nie zawiera danych bohatera.',
      rightTitle: 'Brak przeciwnika',
      rightText: 'Raport walki nie zawiera danych przeciwnika.',
    },
    log: {
      title: 'Przebieg walki',
      subtitle: null,
      emptyText: 'Raport walki nie zawiera przebiegu starcia.',
      groups: mapCompletedCombatLogGroups({
        detail,
        liveEvents: [],
        liveParticipants: [],
        displayParticipants: participants,
        liveEventMapper: () => [],
      }),
    },
  });
}

export function mapCanonicalReportCombatStageView(
  report: ReportDetailCore | null,
  context: {
    activeHeroId?: string | null;
    activeHeroPortraitSrc?: string | null;
    reportId?: string | null;
  } = {},
): CombatStageViewModel | null {
  const detail = report && context.reportId
    ? combatDetailFromCanonicalReport(report, context.reportId)
    : null;

  if (!detail || !report) {
    return null;
  }

  const participants = mapCompletedCombatParticipants({
    detail,
    liveParticipants: [],
    activeHeroId: context.activeHeroId ?? null,
    activeHeroPortraitSrc: context.activeHeroPortraitSrc ?? null,
  });
  const pair = combatParticipantPair(participants);

  return mapCompletedCombatStageView({
    ariaLabel: 'Raport walki',
    leftParticipant: pair.left,
    rightParticipant: pair.right,
    emptyParticipants: {
      leftTitle: 'Brak uczestnika',
      leftText: 'Raport nie zawiera danych pierwszej strony.',
      rightTitle: 'Brak przeciwnika',
      rightText: 'Raport nie zawiera danych drugiej strony.',
    },
    log: {
      title: 'Przebieg walki',
      subtitle: null,
      emptyText: 'Raport nie zawiera przebiegu starcia.',
      groups: mapCompletedCombatLogGroups({
        detail,
        liveEvents: [],
        liveParticipants: [],
        displayParticipants: participants,
        liveEventMapper: () => [],
      }),
    },
  });
}

function combatDetailFromReport(
  report: PrivateGameReportDetail,
): CombatResultDetailReadModel | null {
  const section = report.combatSection;

  if (!section) {
    return null;
  }

  return {
    combatResultId: report.sourceEntityId,
    outcome: section.outcome,
    winnerSide: section.winnerSide,
    loserSide: section.loserSide,
    turnsCompleted: section.turnsCompleted ?? 0,
    startedAt: section.startedAt ?? report.createdAt,
    completedAt: section.completedAt ?? report.createdAt,
    participants: section.participants as unknown as Json,
    attacks: section.attacks as unknown as Json,
    rawJson: report.rawJson,
  };
}

function combatDetailFromCanonicalReport(
  report: ReportDetailCore,
  reportId: string,
): CombatResultDetailReadModel | null {
  const section = report.combatSectionJson;

  if (!section || 'missing' in section) {
    return null;
  }

  return {
    combatResultId: reportId,
    outcome: section.outcome,
    winnerSide: section.winnerSide,
    loserSide: section.loserSide,
    turnsCompleted: section.turnsCompleted,
    startedAt: section.startedAt ?? report.createdAt,
    completedAt: section.completedAt ?? report.createdAt,
    participants: section.participants as unknown as Json,
    attacks: section.attacks as unknown as Json,
    rawJson: null,
  };
}
