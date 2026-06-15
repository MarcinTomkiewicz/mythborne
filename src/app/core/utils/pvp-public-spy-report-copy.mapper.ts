import {
  PvpPublicSpyOutcomeKey,
  PvpPublicSpyReportCopy,
} from '../domain/pvp/pvp-public-report-copy.model';
import {
  JsonRecord,
  requireLiteral,
  requiredBoolean,
  requiredRecord,
  requiredText,
  read,
} from './json-read';

const SPY_OUTCOMES: readonly PvpPublicSpyOutcomeKey[] = [
  'success_undetected',
  'success_detected',
  'failure_undetected',
  'failure_detected',
];

export function mapPvpPublicSpyReportCopy(record: JsonRecord): PvpPublicSpyReportCopy {
  const emptyStates = requiredRecord(
    read(record, 'emptyStates'),
    'get_public_pvp_report_copy.spyReport.emptyStates',
  );

  requireLiteral(
    requiredText(read(record, 'reportKind'), 'get_public_pvp_report_copy.spyReport.reportKind'),
    'spy',
    'get_public_pvp_report_copy.spyReport.reportKind',
  );
  requireLiteral(
    requiredText(read(record, 'viewerRole'), 'get_public_pvp_report_copy.spyReport.viewerRole'),
    'viewer',
    'get_public_pvp_report_copy.spyReport.viewerRole',
  );
  requireTrue(
    requiredBoolean(read(record, 'privateDetailsOmitted'), 'get_public_pvp_report_copy.spyReport.privateDetailsOmitted'),
    'get_public_pvp_report_copy.spyReport.privateDetailsOmitted',
  );

  return {
    reportKind: 'spy',
    viewerRole: 'viewer',
    outcomeKey: requiredUnion(
      requiredText(read(record, 'outcomeKey'), 'get_public_pvp_report_copy.spyReport.outcomeKey'),
      SPY_OUTCOMES,
      'get_public_pvp_report_copy.spyReport.outcomeKey',
    ),
    title: requiredText(read(record, 'title'), 'get_public_pvp_report_copy.spyReport.title'),
    summary: requiredText(read(record, 'summary'), 'get_public_pvp_report_copy.spyReport.summary'),
    emptyStates: {
      noBuildings: requiredText(
        read(emptyStates, 'noBuildings'),
        'get_public_pvp_report_copy.spyReport.emptyStates.noBuildings',
      ),
      noEquipment: requiredText(
        read(emptyStates, 'noEquipment'),
        'get_public_pvp_report_copy.spyReport.emptyStates.noEquipment',
      ),
      noResources: requiredText(
        read(emptyStates, 'noResources'),
        'get_public_pvp_report_copy.spyReport.emptyStates.noResources',
      ),
      noVisibleData: requiredText(
        read(emptyStates, 'noVisibleData'),
        'get_public_pvp_report_copy.spyReport.emptyStates.noVisibleData',
      ),
    },
    privateDetailsOmitted: true,
    privateDetailsOmittedLabel: requiredText(
      read(record, 'privateDetailsOmittedLabel'),
      'get_public_pvp_report_copy.spyReport.privateDetailsOmittedLabel',
    ),
  };
}

function requireTrue(value: boolean, field: string): true {
  if (value !== true) {
    throw new Error(`${field} must be true.`);
  }

  return true;
}

function requiredUnion<T extends string>(
  value: string,
  allowed: readonly T[],
  field: string,
): T {
  if (!allowed.includes(value as T)) {
    throw new Error(`${field} must be one of ${allowed.join(', ')}.`);
  }

  return value as T;
}
