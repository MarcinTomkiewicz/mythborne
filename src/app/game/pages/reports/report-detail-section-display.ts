import {
  ReportDetailCore,
  ReportPageCopy,
} from '../../../core/domain/reports/report.model';
import {
  ReportDetailSectionEntry,
  ReportDetailSectionView,
} from '../../../core/domain/reports/report-section-display.model';
import { reportCombatEntries } from './report-combat-display';
import { reportEffectEntries } from './report-effect-display';
import { reportEncounterEntries } from './report-encounter-display';
import { reportItemReferenceEntries } from './report-item-references-display';
import { reportParticipantEntries } from './report-participants-display';
import { reportRelatedReportEntries } from './report-related-reports-display';
import { reportRewardEntries } from './report-reward-display';
import { reportSpyEntries } from './report-spy-display';
import { reportTrialEntries } from './report-trial-display';

export function buildReportDetailSections(
  report: ReportDetailCore,
  sections: ReportPageCopy['detail']['sections'],
  empty: ReportPageCopy['detail']['empty'],
): readonly ReportDetailSectionView[] {
  return [
    sectionView('participants', sections.participants, reportParticipantEntries(report.participantsJson), empty.participants),
    sectionView('itemReferences', sections.itemReferences, reportItemReferenceEntries(report.itemReferencesJson), empty.itemReferences),
    sectionView('spy', sections.spy, reportSpyEntries(report.spySectionJson), null),
    sectionView('trial', sections.trial, reportTrialEntries(report.trialSectionJson), null),
    sectionView('encounter', sections.encounter, reportEncounterEntries(report.encounterSectionJson), null),
    sectionView('combat', sections.combat, reportCombatEntries(report.combatSectionJson), null),
    sectionView('rewards', sections.rewards, reportRewardEntries(report.rewardSectionJson), empty.rewards),
    sectionView('effects', sections.effects, reportEffectEntries(report.effectSectionJson), null),
    sectionView('relatedReports', sections.relatedReports, reportRelatedReportEntries(report.relatedReportsJson), empty.relatedReports),
  ].filter((section) => section.entries.length > 0 || section.emptyLabel);
}

function sectionView(
  key: string,
  title: string,
  entries: readonly ReportDetailSectionEntry[],
  emptyLabel: string | null,
): ReportDetailSectionView {
  return {
    key,
    title,
    emptyLabel: entries.length > 0 ? null : emptyLabel,
    entries,
  };
}
