import { CombatResultDetailReadModel } from '../domain/combat/combat-live.model';
import { CombatStageViewModel } from '../domain/combat/combat-stage.model';
import {
  PvpPrivateAttackReportAvailableCopy,
} from '../domain/pvp/pvp-private-report-copy.model';
import { ReportDetailCore } from '../domain/reports/report-detail.model';
import { ReportCombatSection } from '../domain/reports/report-section.model';
import type { Json } from '../types/database.types';
import { mapCompletedCombatStageView } from './combat-stage-display.mapper';
import { mapCompletedCombatLogGroups } from './combat-report-log.mapper';
import {
  combatParticipantPair,
  mapCompletedCombatParticipants,
} from './combat-report-participant.mapper';

export function mapPrivatePvpAttackCombatStageView(input: {
  report: ReportDetailCore | null;
  copy: PvpPrivateAttackReportAvailableCopy;
  combatResultId?: string | null;
  activeHeroId?: string | null;
  activeHeroPortraitSrc?: string | null;
},
): CombatStageViewModel | null {
  const { report, copy } = input;
  const section = presentReportCombatSection(report);
  const detail = report && section && input.combatResultId
    ? combatDetailFromCanonicalReport(
        report,
        section,
        input.combatResultId,
      )
    : null;
  const attack = copy.attackReport;

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
    ariaLabel: copy.shell.title,
    leftParticipant: pair.left,
    rightParticipant: pair.right,
    emptyParticipants: {
      leftTitle: copy.shell.title,
      leftText: copy.shell.summary,
      rightTitle: copy.shell.title,
      rightText: copy.shell.summary,
    },
    log: {
      title: copy.sections.combat,
      subtitle: copy.shell.sourceLabel,
      emptyText: attack.result.narrativePlainText,
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
    centerPanel: pvpPrivateAttackCombatCenterPanel(copy),
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
  copy: PvpPrivateAttackReportAvailableCopy,
): CombatStageViewModel['centerPanel'] {
  return {
    state: 'report_result',
    contextLabel: copy.sections.result,
    title: copy.attackReport.result.title,
    helperText: copy.attackReport.result.narrativePlainText,
    detailText: null,
  };
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
