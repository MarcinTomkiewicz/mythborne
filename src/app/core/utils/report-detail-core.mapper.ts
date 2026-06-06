import { ReportDetailCore } from '../domain/reports/report.model';
import {
  JsonRecord,
  read,
  requiredArray,
  requiredNullableText,
  requiredText,
} from './json-read';
import { mapCombatSection } from './report-combat-section.mapper';
import { mapEncounterSection } from './report-encounter-section.mapper';
import { mapNullableEffectSection } from './report-effect-section.mapper';
import { mapReportItemReferences } from './report-item-reference-section.mapper';
import { mapReportParticipants } from './report-participant-section.mapper';
import { mapRelatedReports } from './report-related-reports.mapper';
import { mapRewardSection } from './report-reward-section.mapper';
import { mapNullableReportSection } from './report-section-common.mapper';
import { mapSpySection } from './report-spy-section.mapper';
import { mapTrialSection } from './report-trial-section.mapper';

export function mapReportDetailCore(report: JsonRecord): ReportDetailCore {
  return {
    publicToken: requiredNullableText(
      read(report, 'publicToken'),
      'get_report_detail.report.publicToken',
    ),
    reportTypeKey: requiredText(
      read(report, 'reportTypeKey'),
      'get_report_detail.report.reportTypeKey',
    ),
    reportTypeLabel: requiredText(
      read(report, 'reportTypeLabel'),
      'get_report_detail.report.reportTypeLabel',
    ),
    reportTypeDescription: requiredNullableText(
      read(report, 'reportTypeDescription'),
      'get_report_detail.report.reportTypeDescription',
    ),
    title: requiredText(read(report, 'title'), 'get_report_detail.report.title'),
    summary: requiredNullableText(read(report, 'summary'), 'get_report_detail.report.summary'),
    sourceLabel: requiredNullableText(
      read(report, 'sourceLabel'),
      'get_report_detail.report.sourceLabel',
    ),
    sourceEntityType: requiredNullableText(
      read(report, 'sourceEntityType'),
      'get_report_detail.report.sourceEntityType',
    ),
    createdAt: requiredText(read(report, 'createdAt'), 'get_report_detail.report.createdAt'),
    participantsJson: mapReportParticipants(
      requiredArray(read(report, 'participantsJson'), 'get_report_detail.report.participantsJson'),
      'get_report_detail.report.participantsJson',
    ),
    itemReferencesJson: mapReportItemReferences(
      requiredArray(
        read(report, 'itemReferencesJson'),
        'get_report_detail.report.itemReferencesJson',
      ),
      'get_report_detail.report.itemReferencesJson',
    ),
    spySectionJson: mapNullableReportSection(
      read(report, 'spySectionJson'),
      'get_report_detail.report.spySectionJson',
      mapSpySection,
    ),
    trialSectionJson: mapNullableReportSection(
      read(report, 'trialSectionJson'),
      'get_report_detail.report.trialSectionJson',
      mapTrialSection,
    ),
    encounterSectionJson: mapNullableReportSection(
      read(report, 'encounterSectionJson'),
      'get_report_detail.report.encounterSectionJson',
      mapEncounterSection,
    ),
    combatSectionJson: mapNullableReportSection(
      read(report, 'combatSectionJson'),
      'get_report_detail.report.combatSectionJson',
      mapCombatSection,
    ),
    rewardSectionJson: mapNullableReportSection(
      read(report, 'rewardSectionJson'),
      'get_report_detail.report.rewardSectionJson',
      mapRewardSection,
    ),
    effectSectionJson: mapNullableEffectSection(
      read(report, 'effectSectionJson'),
      'get_report_detail.report.effectSectionJson',
    ),
    relatedReportsJson: mapRelatedReports(
      requiredArray(
        read(report, 'relatedReportsJson'),
        'get_report_detail.report.relatedReportsJson',
      ),
      'get_report_detail.report.relatedReportsJson',
    ),
  };
}
