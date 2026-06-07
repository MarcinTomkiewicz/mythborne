import type { CombatStageViewModel } from '../domain/combat/combat-stage.model';
import type {
  PrivateReportDetailPage,
  ReportDetailCore,
} from '../domain/reports/report-detail.model';
import type {
  ReportDetailPreviewOutcomeBanner,
  ReportDetailPreviewOutcomeTone,
  ReportDetailPreviewSection,
  ReportDetailPreviewView,
} from '../domain/reports/report-detail-preview.model';
import type {
  ReportCombatSection,
} from '../domain/reports/report-section.model';
import { uniqueInOrder } from './collection';
import { mapCanonicalReportCombatStageView } from './combat-report-display.mapper';
import { mapReportHandoffActions } from './report-handoff-actions.mapper';
import { mapReportPvpRewardPreview } from './report-pvp-reward-preview.mapper';
import { presentReportSection } from './report-section-common.mapper';

export function mapReportDetailPreviewView(input: {
  detail: PrivateReportDetailPage;
  activeHeroId: string | null;
  showRewardResult: boolean;
}): ReportDetailPreviewView {
  const report = input.detail.report;

  return {
    outcomeBanner: reportOutcomeBanner(report, input.activeHeroId),
    combatStage: reportCombatStage(input),
    narrativeLines: reportNarrativeLines(report),
    sections: reportPreviewSections(report),
    rewardResult: input.showRewardResult ? requiredReportRewardResult(report) : null,
    actions: mapReportHandoffActions({
      reportId: input.detail.access.reportId,
      publicToken: report.publicToken ?? null,
    }),
  };
}

function reportCombatStage(input: {
  detail: PrivateReportDetailPage;
  activeHeroId: string | null;
}): CombatStageViewModel | null {
  return mapCanonicalReportCombatStageView(input.detail.report, {
    activeHeroId: input.activeHeroId,
    activeHeroPortraitSrc: null,
    reportId: input.detail.access.reportId,
  });
}

function reportOutcomeBanner(
  report: ReportDetailCore | null,
  activeHeroId: string | null,
): ReportDetailPreviewOutcomeBanner | null {
  const combat = presentReportSection(report?.combatSectionJson);

  return combat
    ? {
        title: combat.outcomeLabel,
        tone: combatOutcomeTone(combat, activeHeroId),
      }
    : null;
}

function combatOutcomeTone(
  section: ReportCombatSection,
  activeHeroId: string | null,
): ReportDetailPreviewOutcomeTone {
  if (!activeHeroId) {
    throw new Error(
      'Active hero id is required to resolve get_report_detail.report.combatSectionJson outcome tone.',
    );
  }

  const heroSide = section.participants.find((participant) =>
    participant.heroId === activeHeroId
  )?.side ?? null;

  if (!heroSide) {
    throw new Error(
      'get_report_detail.report.combatSectionJson.participants must include active hero participant heroId for outcome tone.',
    );
  }

  if (section.winnerSide === heroSide) {
    return 'success';
  }

  if (section.loserSide === heroSide) {
    return 'danger';
  }

  return section.winnerSide || section.loserSide ? 'neutral' : 'warning';
}

function reportNarrativeLines(report: ReportDetailCore | null): readonly string[] {
  const combat = presentReportSection(report?.combatSectionJson);

  if (combat) {
    return uniqueInOrder(combat.narrativeLines);
  }

  const trial = presentReportSection(report?.trialSectionJson);
  const encounter = presentReportSection(report?.encounterSectionJson);
  const effect = report?.effectSectionJson ?? null;

  return uniqueInOrder([
    ...(trial?.narrativeLines ?? []),
    ...(encounter?.narrativeLines ?? []),
    ...(effect?.narrativeLines ?? []),
  ]);
}

function reportPreviewSections(report: ReportDetailCore | null): readonly ReportDetailPreviewSection[] {
  if (presentReportSection(report?.combatSectionJson)) {
    return [];
  }

  const trial = presentReportSection(report?.trialSectionJson);
  const encounter = presentReportSection(report?.encounterSectionJson);
  const effect = report?.effectSectionJson ?? null;
  const sections: Array<ReportDetailPreviewSection | null> = [
    trial
      ? {
          key: 'trial',
          title: trial.title,
          summary: trial.summary,
          chips: [trial.trialLabel, trial.outcomeLabel, trial.resultLabel],
          lines: trial.descriptionLines,
        }
      : null,
    encounter
      ? {
          key: 'encounter',
          title: encounter.title,
          summary: encounter.summary,
          chips: [encounter.encounterLabel, encounter.outcomeLabel],
          lines: encounter.descriptionLines,
        }
      : null,
    effect
      ? {
          key: 'effect',
          title: effect.title,
          summary: effect.summary,
          chips: [effect.sourceLabel],
          lines: effect.narrativeLines,
        }
      : null,
  ];

  return sections.filter((section): section is ReportDetailPreviewSection => section !== null);
}

function requiredReportRewardResult(report: ReportDetailCore | null) {
  const section = presentReportSection(report?.rewardSectionJson);

  if (!section) {
    throw new Error(
      'get_report_detail.report.rewardSectionJson is required for PvP/Vicinity combat reward preview.',
    );
  }

  return mapReportPvpRewardPreview(section);
}
