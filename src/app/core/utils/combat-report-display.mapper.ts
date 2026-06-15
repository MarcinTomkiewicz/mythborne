import { CombatResultDetailReadModel } from '../domain/combat/combat-live.model';
import { CombatStageViewModel } from '../domain/combat/combat-stage.model';
import type { PvpCombatContextPresentation } from '../domain/pvp/pvp-combat-context.model';
import {
  ReportDetailCore,
  ReportShellContext,
} from '../domain/reports/report-detail.model';
import { ReportCombatSection } from '../domain/reports/report-section.model';
import type { Json } from '../types/database.types';
import { mapCompletedCombatStageView } from './combat-stage-display.mapper';
import { mapCompletedCombatLogGroups } from './combat-report-log.mapper';
import {
  combatParticipantPair,
  mapCompletedCombatParticipants,
} from './combat-report-participant.mapper';

export function mapPvpAttackCombatStageView(input: {
  report: ReportDetailCore | null;
  shell: ReportShellContext;
  combatResultId?: string | null;
  activeHeroId?: string | null;
  activeHeroPortraitSrc?: string | null;
  pvpCombatContext?: PvpCombatContextPresentation | null;
},
): CombatStageViewModel | null {
  const { report, shell } = input;
  const section = presentReportCombatSection(report);
  const detail = report && section && input.combatResultId
    ? combatDetailFromCanonicalReport(
        report,
        section,
        input.combatResultId,
      )
    : null;

  if (!detail) {
    return null;
  }

  const participants = mapCompletedCombatParticipants({
    detail,
    liveParticipants: [],
    activeHeroId: input.activeHeroId ?? null,
    activeHeroPortraitSrc: input.activeHeroPortraitSrc ?? null,
  });
  const pair = combatParticipantPair(participants);

  const stage = mapCompletedCombatStageView({
    ariaLabel: shell.title,
    leftParticipant: pair.left,
    rightParticipant: pair.right,
    emptyParticipants: {
      leftTitle: shell.title,
      leftText: shell.summary,
      rightTitle: shell.title,
      rightText: shell.summary,
    },
    log: {
      title: shell.eventType.label,
      subtitle: shell.source.label,
      emptyText: shell.summary ?? '',
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
    centerPanel: pvpPrivateAttackCombatCenterPanel(input.pvpCombatContext ?? null),
  };
}

export function mapNonPvpCanonicalReportCombatStageView(
  report: ReportDetailCore | null,
  context: {
    activeHeroId?: string | null;
    activeHeroPortraitSrc?: string | null;
    combatResultId?: string | null;
  } = {},
): CombatStageViewModel | null {
  const section = presentReportCombatSection(report);
  const detail = report && section && context.combatResultId
    ? combatDetailFromCanonicalReport(report, section, context.combatResultId)
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

function combatDetailFromCanonicalReport(
  report: ReportDetailCore,
  section: ReportCombatSection,
  combatResultId: string,
): CombatResultDetailReadModel | null {
  return {
    combatResultId,
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

function pvpPrivateAttackCombatCenterPanel(
  pvpCombatContext: PvpCombatContextPresentation | null,
): CombatStageViewModel['centerPanel'] {
  const richTextRows = pvpCombatContext?.participantEffects
    .map((effect) => effect.summaryRichText) ?? [];

  return richTextRows.length
    ? {
        state: 'report_result',
        contextLabel: null,
        title: null,
        helperText: null,
        detailText: null,
        richTextRows,
      }
    : null;
}

function canonicalReportCombatCenterPanel(
  report: ReportDetailCore,
  section: ReportCombatSection,
): CombatStageViewModel['centerPanel'] {
  return {
    state: 'report_result',
    contextLabel: section.sourceLabel,
    title: section.outcomeLabel,
    helperText: section.summary,
    detailText: null,
  };
}

function presentReportCombatSection(report: ReportDetailCore | null): ReportCombatSection | null {
  const section = report?.combatSectionJson;

  return section && !('missing' in section) ? section : null;
}
