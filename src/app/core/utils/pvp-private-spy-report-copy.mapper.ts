import {
  PvpPrivateSpyReportCopy,
  PvpPrivateSpyViewerRole,
} from '../domain/pvp/pvp-private-report-copy.model';
import {
  JsonRecord,
  requireLiteral,
  requiredBoolean,
  requiredRecord,
  requiredText,
  read,
} from './json-read';

const SPY_VIEWER_ROLES: readonly PvpPrivateSpyViewerRole[] = [
  'spy_owner',
  'target',
  'viewer',
];

export function mapPrivateSpyReportCopy(record: JsonRecord): PvpPrivateSpyReportCopy {
  if (read(record, 'reportKind') !== undefined) {
    requireLiteral(
      requiredText(read(record, 'reportKind'), 'get_pvp_report_copy.spyReport.reportKind'),
      'spy',
      'get_pvp_report_copy.spyReport.reportKind',
    );
  }

  const result = requiredRecord(
    read(record, 'result'),
    'get_pvp_report_copy.spyReport.result',
  );
  const emptyStates = requiredRecord(
    read(record, 'emptyStates'),
    'get_pvp_report_copy.spyReport.emptyStates',
  );

  return {
    outcomeKey: requiredText(read(record, 'outcomeKey'), 'get_pvp_report_copy.spyReport.outcomeKey'),
    viewerRole: requiredUnion(
      requiredText(read(record, 'viewerRole'), 'get_pvp_report_copy.spyReport.viewerRole'),
      SPY_VIEWER_ROLES,
      'get_pvp_report_copy.spyReport.viewerRole',
    ),
    success: requiredBoolean(read(record, 'success'), 'get_pvp_report_copy.spyReport.success'),
    detected: requiredBoolean(read(record, 'detected'), 'get_pvp_report_copy.spyReport.detected'),
    result: {
      title: requiredText(read(result, 'title'), 'get_pvp_report_copy.spyReport.result.title'),
      summary: requiredText(read(result, 'summary'), 'get_pvp_report_copy.spyReport.result.summary'),
    },
    emptyStates: {
      noResources: requiredText(
        read(emptyStates, 'noResources'),
        'get_pvp_report_copy.spyReport.emptyStates.noResources',
      ),
      noBuildings: requiredText(
        read(emptyStates, 'noBuildings'),
        'get_pvp_report_copy.spyReport.emptyStates.noBuildings',
      ),
      noEquipment: requiredText(
        read(emptyStates, 'noEquipment'),
        'get_pvp_report_copy.spyReport.emptyStates.noEquipment',
      ),
      noVisibleData: requiredText(
        read(emptyStates, 'noVisibleData'),
        'get_pvp_report_copy.spyReport.emptyStates.noVisibleData',
      ),
    },
  };
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
