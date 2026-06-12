import type { CombatStageViewModel } from '../domain/combat/combat-stage.model';
import type {
  ExplorationResultNarrativeSnapshotV1,
} from '../domain/exploration/exploration-result-copy.model';
import type {
  PrivateReportDetailPage,
  ReportDetailCore,
} from '../domain/reports/report-detail.model';
import type {
  ReportDetailPreviewExplorationSourceKind,
  ReportDetailPreviewOutcomeBanner,
  ReportDetailPreviewOutcomeTone,
  ReportDetailPreviewSection,
  ReportDetailPreviewView,
} from '../domain/reports/report-detail-preview.model';
import type {
  ReportCombatSection,
} from '../domain/reports/report-section.model';
import { uniqueInOrder } from './collection';
import { mapNonPvpCanonicalReportCombatStageView } from './combat-report-display.mapper';
import { mapReportHandoffActions } from './report-handoff-actions.mapper';
import { mapReportPvpRewardPreview } from './report-pvp-reward-preview.mapper';
import { presentReportSection } from './report-section-common.mapper';

export function mapReportDetailPreviewView(input: {
  detail: PrivateReportDetailPage;
  activeHeroId: string | null;
  showRewardResult: boolean;
}): ReportDetailPreviewView {
  if (input.detail.domainContextJson.reportDomainKey === 'pvp') {
    throw new Error(
      'Private PvP report detail must use player.pvp.report.private copy-backed rendering.',
    );
  }

  const report = input.detail.report;
  const trialManifestationNarrative = reportTrialManifestationNarrative(report);
  const encounterCombatHandoffNarrative = reportEncounterCombatHandoffNarrative(report);
  const explorationResultNarrative = reportExplorationResultNarrative(report);
  const explorationSourceKind = reportExplorationSourceKind(report);
  const combatStage = reportCombatStage(input);
  const isExplorationSource = reportIsExplorationSource({
    report,
    reportDomainKey: input.detail.domainContextJson.reportDomainKey,
    trialManifestationNarrative,
    encounterCombatHandoffNarrative,
    explorationResultNarrative,
  });

  return {
    isExplorationSource,
    explorationSourceKind,
    trialManifestationNarrative,
    encounterCombatHandoffNarrative,
    explorationResultNarrative,
    missingExplorationNarrativeFields: isExplorationSource
      ? missingExplorationNarrativeFields({
          sourceKind: explorationSourceKind,
          combatStage,
          trialManifestationNarrative,
          encounterCombatHandoffNarrative,
          explorationResultNarrative,
        })
      : [],
    outcomeBanner: isExplorationSource ? null : reportOutcomeBanner(report, input.activeHeroId),
    combatStage,
    narrativeLines: isExplorationSource ? [] : reportNarrativeLines(report),
    sections: isExplorationSource ? [] : reportPreviewSections(report),
    rewardResult: !isExplorationSource && input.showRewardResult
      ? requiredReportRewardResult(report)
      : null,
    actions: mapReportHandoffActions({
      reportId: input.detail.access.reportId,
      publicToken: report.publicToken ?? null,
    }),
  };
}

function reportExplorationSourceKind(
  report: ReportDetailCore | null,
): ReportDetailPreviewExplorationSourceKind | null {
  if (presentReportSection(report?.trialSectionJson)) {
    return 'trial';
  }

  if (presentReportSection(report?.encounterSectionJson)) {
    return 'encounter';
  }

  return null;
}

function reportTrialManifestationNarrative(
  report: ReportDetailCore | null,
): ExplorationResultNarrativeSnapshotV1 | null {
  const trial = presentReportSection(report?.trialSectionJson);

  return trial?.trialManifestationNarrativeJson ?? null;
}

function reportEncounterCombatHandoffNarrative(
  report: ReportDetailCore | null,
): ExplorationResultNarrativeSnapshotV1 | null {
  const encounter = presentReportSection(report?.encounterSectionJson);

  return encounter?.encounterCombatHandoffNarrativeJson ?? null;
}

function reportExplorationResultNarrative(
  report: ReportDetailCore | null,
): ExplorationResultNarrativeSnapshotV1 | null {
  const trial = presentReportSection(report?.trialSectionJson);
  const encounter = presentReportSection(report?.encounterSectionJson);

  return trial?.resultNarrativeJson ?? encounter?.resultNarrativeJson ?? null;
}

function reportIsExplorationSource(input: {
  report: ReportDetailCore | null;
  reportDomainKey: string | null;
  trialManifestationNarrative: ExplorationResultNarrativeSnapshotV1 | null;
  encounterCombatHandoffNarrative: ExplorationResultNarrativeSnapshotV1 | null;
  explorationResultNarrative: ExplorationResultNarrativeSnapshotV1 | null;
}): boolean {
  return (
    input.reportDomainKey === 'exploration' ||
    input.report?.trialSectionJson !== null && input.report?.trialSectionJson !== undefined ||
    input.report?.encounterSectionJson !== null && input.report?.encounterSectionJson !== undefined ||
    Boolean(input.trialManifestationNarrative) ||
    Boolean(input.encounterCombatHandoffNarrative) ||
    Boolean(input.explorationResultNarrative)
  );
}

function missingExplorationNarrativeFields(input: {
  sourceKind: ReportDetailPreviewExplorationSourceKind | null;
  combatStage: CombatStageViewModel | null;
  trialManifestationNarrative: ExplorationResultNarrativeSnapshotV1 | null;
  encounterCombatHandoffNarrative: ExplorationResultNarrativeSnapshotV1 | null;
  explorationResultNarrative: ExplorationResultNarrativeSnapshotV1 | null;
}): readonly string[] {
  const missing: string[] = [];

  if (input.sourceKind === 'trial' && !input.explorationResultNarrative) {
    missing.push('report.trialSectionJson.resultNarrativeJson');
  }

  if (input.sourceKind === 'encounter' && !input.explorationResultNarrative) {
    missing.push('report.encounterSectionJson.resultNarrativeJson');
  }

  if (!input.combatStage) {
    return missing;
  }

  if (input.sourceKind === 'trial' && !input.trialManifestationNarrative) {
    missing.push('report.trialSectionJson.trialManifestationNarrativeJson');
  }

  if (input.sourceKind === 'encounter' && !input.encounterCombatHandoffNarrative) {
    missing.push('report.encounterSectionJson.encounterCombatHandoffNarrativeJson');
  }

  return missing;
}

function reportCombatStage(input: {
  detail: PrivateReportDetailPage;
  activeHeroId: string | null;
}): CombatStageViewModel | null {
  return mapNonPvpCanonicalReportCombatStageView(input.detail.report, {
    activeHeroId: input.activeHeroId,
    activeHeroPortraitSrc: null,
    combatResultId: input.detail.domainContextJson.combat?.combatResultId ?? null,
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
      'get_report_detail.report.rewardSectionJson is required for combat reward preview.',
    );
  }

  return mapReportPvpRewardPreview(section);
}
