import { ReportsCenterEventTypeCopy } from '../domain/reports/reports-center-copy.model';
import { ReportsCenterListRow } from '../domain/reports/reports-center.model';
import { semanticIconToneClass } from './semantic-icon-class';

const RESOURCE_EVENT_TYPE_KEYS = new Set([
  'resource',
  'encounter_resource',
  'encounter_resources',
]);

const BUFF_EVENT_TYPE_KEYS = new Set([
  'buff',
  'encounter_buff',
]);

const DEBUFF_EVENT_TYPE_KEYS = new Set([
  'debuff',
  'encounter_debuff',
]);

const TRIAL_EVENT_TYPE_KEYS = new Set([
  'trial',
  'trial_result',
  'trial_manifested',
  'trial_not_manifested',
  'trial_resolved_success',
  'trial_resolved_failure',
]);

const TRIAL_SUCCESS_EVENT_TYPE_KEYS = new Set([
  'trial_manifested',
  'trial_resolved_success',
]);

const TRIAL_DANGER_EVENT_TYPE_KEYS = new Set([
  'trial_not_manifested',
  'trial_resolved_failure',
]);

const COMBAT_EVENT_TYPE_KEYS = new Set([
  'combat',
  'combat_result',
  'encounter_combat',
  'pvp_combat',
]);

export function reportsCenterMarkerToneClass(
  report: ReportsCenterListRow,
  eventTypeCopy: ReportsCenterEventTypeCopy,
): string {
  const eventTypeKey = report.eventType.key;

  if (RESOURCE_EVENT_TYPE_KEYS.has(eventTypeKey)) {
    return 'color-heading';
  }

  if (BUFF_EVENT_TYPE_KEYS.has(eventTypeKey)) {
    return semanticIconToneClass('success');
  }

  if (DEBUFF_EVENT_TYPE_KEYS.has(eventTypeKey)) {
    return semanticIconToneClass('danger');
  }

  if (TRIAL_SUCCESS_EVENT_TYPE_KEYS.has(eventTypeKey)) {
    return semanticIconToneClass('success');
  }

  if (TRIAL_DANGER_EVENT_TYPE_KEYS.has(eventTypeKey)) {
    return semanticIconToneClass('danger');
  }

  if (TRIAL_EVENT_TYPE_KEYS.has(eventTypeKey)) {
    return outcomeToneClass(report, semanticIconToneClass('danger'));
  }

  if (COMBAT_EVENT_TYPE_KEYS.has(eventTypeKey)) {
    return outcomeToneClass(report, semanticIconToneClass(eventTypeCopy.tone));
  }

  return semanticIconToneClass(eventTypeCopy.tone);
}

function outcomeToneClass(
  report: ReportsCenterListRow,
  neutralClassName: string,
): string {
  if (report.preview.outcomeStatus.tone === 'positive') {
    return semanticIconToneClass('success');
  }

  if (report.preview.outcomeStatus.tone === 'negative') {
    return semanticIconToneClass('danger');
  }

  return neutralClassName;
}
