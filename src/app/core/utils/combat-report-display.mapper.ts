import { CombatResultDetailReadModel } from '../domain/combat/combat-live.model';
import { CombatStageViewModel } from '../domain/combat/combat-stage.model';
import { PrivateGameReportDetail } from '../domain/reports/game-report.model';
import { ReportDetailCore } from '../domain/reports/report-detail.model';
import { ReportCombatSection } from '../domain/reports/report-section.model';
import type { Json } from '../types/database.types';
import { uniqueInOrder } from './collection';
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
  const emptyText = report.summary ?? report.title;

  return mapCompletedCombatStageView({
    ariaLabel: report.title,
    leftParticipant: pair.left,
    rightParticipant: pair.right,
    emptyParticipants: {
      leftTitle: report.title,
      leftText: emptyText,
      rightTitle: report.title,
      rightText: emptyText,
    },
    log: {
      title: report.title,
      subtitle: report.sourceLabel,
      emptyText,
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
  const section = presentReportCombatSection(report);
  const detail = report && section && context.reportId
    ? combatDetailFromCanonicalReport(report, section, context.reportId)
    : null;

  if (!detail || !report || !section) {
    return null;
  }

  const participants = mapCompletedCombatParticipants({
    detail,
    liveParticipants: [],
    activeHeroId: context.activeHeroId ?? null,
    activeHeroPortraitSrc: context.activeHeroPortraitSrc ?? null,
  });
  const pair = combatParticipantPair(participants);

  const stage = mapCompletedCombatStageView({
    ariaLabel: section.title,
    leftParticipant: pair.left,
    rightParticipant: pair.right,
    emptyParticipants: {
      leftTitle: section.title,
      leftText: section.summary,
      rightTitle: section.title,
      rightText: section.summary,
    },
    log: {
      title: section.title,
      subtitle: section.sourceLabel,
      emptyText: section.summary,
      groups: mapCompletedCombatLogGroups({
        detail,
        liveEvents: [],
        liveParticipants: [],
        displayParticipants: participants,
        liveEventMapper: () => [],
      }),
    },
  });

  return {
    ...stage,
    centerPanel: canonicalReportCombatCenterPanel(report, section),
  };
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
  section: ReportCombatSection,
  reportId: string,
): CombatResultDetailReadModel | null {
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

function canonicalReportCombatCenterPanel(
  report: ReportDetailCore,
  section: ReportCombatSection,
): CombatStageViewModel['centerPanel'] {
  const effect = report.effectSectionJson;
  const detailText = uniqueInOrder([
    ...section.narrativeLines,
    ...(effect?.hasEffects ? [effect.summary, ...effect.narrativeLines] : []),
    report.summary,
  ]).join(' ');

  return {
    state: 'completed',
    contextLabel: section.sourceLabel,
    title: section.outcomeLabel,
    helperText: section.summary,
    detailText: detailText || null,
  };
}

function presentReportCombatSection(report: ReportDetailCore | null): ReportCombatSection | null {
  const section = report?.combatSectionJson;

  return section && !('missing' in section) ? section : null;
}
