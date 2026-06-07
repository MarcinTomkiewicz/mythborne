import { KeyLabel } from '../domain/common/key-label.model';
import {
  ReportsCenterAccessPreviewV1,
  ReportsCenterAddressV1,
  ReportsCenterCombatPreviewV1,
  ReportsCenterMarkerV1,
  ReportsCenterOpponentTargetV1,
  ReportsCenterOutcomeStatusV1,
  ReportsCenterPreviewDiagnosticsV1,
  ReportsCenterPreviewResourceRowV1,
  ReportsCenterPreviewRewardEntryV1,
  ReportsCenterPreviewRewardV1,
  ReportsCenterPreviewV1,
  ReportsCenterPublicAccessV1,
  ReportsCenterReportDateV1,
} from '../domain/reports/reports-center.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNullableText,
  read,
  requiredArray,
  requiredBoolean,
  requiredNullableNumber,
  requiredNullableText,
  requiredNumber,
  requiredRecord,
  requiredText,
  requireFalse,
  requireLiteral,
} from './json-read';

export function mapNullablePreview(
  value: Json | undefined,
  field: string,
): ReportsCenterPreviewV1 | null {
  if (value === null) {
    return null;
  }

  return mapPreview(requiredRecord(value, field), field);
}

export function mapPreview(record: JsonRecord, field: string): ReportsCenterPreviewV1 {
  return {
    contractVersion: requireLiteral(
      requiredText(read(record, 'contractVersion'), `${field}.contractVersion`),
      'reports_center_preview_v1',
      `${field}.contractVersion`,
    ),
    reportId: requiredText(read(record, 'reportId'), `${field}.reportId`),
    title: requiredText(read(record, 'title'), `${field}.title`),
    summary: requiredNullableText(read(record, 'summary'), `${field}.summary`),
    source: mapKeyLabel(requiredRecord(read(record, 'source'), `${field}.source`), `${field}.source`),
    eventType: mapKeyLabel(
      requiredRecord(read(record, 'eventType'), `${field}.eventType`),
      `${field}.eventType`,
    ),
    reportDate: mapReportDate(
      requiredRecord(read(record, 'reportDate'), `${field}.reportDate`),
      `${field}.reportDate`,
    ),
    outcomeStatus: mapOutcomeStatus(
      requiredRecord(read(record, 'outcomeStatus'), `${field}.outcomeStatus`),
      `${field}.outcomeStatus`,
    ),
    opponentTarget: mapOpponentTarget(
      requiredRecord(read(record, 'opponentTarget'), `${field}.opponentTarget`),
      `${field}.opponentTarget`,
    ),
    address: mapAddress(
      requiredRecord(read(record, 'address'), `${field}.address`),
      `${field}.address`,
    ),
    combat: mapCombat(
      requiredRecord(read(record, 'combat'), `${field}.combat`),
      `${field}.combat`,
    ),
    reward: mapReward(
      requiredRecord(read(record, 'reward'), `${field}.reward`),
      `${field}.reward`,
    ),
    access: mapAccess(
      requiredRecord(read(record, 'access'), `${field}.access`),
      `${field}.access`,
    ),
    publicAccess: mapPublicAccess(
      requiredRecord(read(record, 'publicAccess'), `${field}.publicAccess`),
      `${field}.publicAccess`,
    ),
    marker: mapMarker(
      requiredRecord(read(record, 'marker'), `${field}.marker`),
      `${field}.marker`,
    ),
    diagnostics: mapDiagnostics(
      requiredRecord(read(record, 'diagnostics'), `${field}.diagnostics`),
      `${field}.diagnostics`,
    ),
  };
}

export function mapKeyLabel(record: JsonRecord, field: string): KeyLabel {
  return {
    key: requiredText(read(record, 'key'), `${field}.key`),
    label: requiredText(read(record, 'label'), `${field}.label`),
  };
}

export function mapReportDate(
  record: JsonRecord,
  field: string,
): ReportsCenterReportDateV1 {
  return {
    value: requiredText(read(record, 'value'), `${field}.value`),
    displayValue: requiredNullableText(read(record, 'displayValue'), `${field}.displayValue`),
  };
}

export function mapMarker(record: JsonRecord, field: string): ReportsCenterMarkerV1 {
  return {
    markerKey: requiredText(read(record, 'markerKey'), `${field}.markerKey`),
    markerLabel: requiredText(read(record, 'markerLabel'), `${field}.markerLabel`),
    iconKey: requiredText(read(record, 'iconKey'), `${field}.iconKey`),
    domainKey: requiredText(read(record, 'domainKey'), `${field}.domainKey`),
    eventTypeKey: requiredText(read(record, 'eventTypeKey'), `${field}.eventTypeKey`),
  };
}

function mapOutcomeStatus(record: JsonRecord, field: string): ReportsCenterOutcomeStatusV1 {
  return {
    key: requiredNullableText(read(record, 'key'), `${field}.key`),
    label: requiredNullableText(read(record, 'label'), `${field}.label`),
    tone: requiredText(read(record, 'tone'), `${field}.tone`),
  };
}

function mapOpponentTarget(record: JsonRecord, field: string): ReportsCenterOpponentTargetV1 {
  return {
    name: requiredNullableText(read(record, 'name'), `${field}.name`),
    roleKey: requiredNullableText(read(record, 'roleKey'), `${field}.roleKey`),
  };
}

function mapAddress(record: JsonRecord, field: string): ReportsCenterAddressV1 {
  return {
    displayValue: requiredNullableText(read(record, 'displayValue'), `${field}.displayValue`),
    districtCode: requiredNullableText(read(record, 'districtCode'), `${field}.districtCode`),
    addressNumber: requiredNullableNumber(read(record, 'addressNumber'), `${field}.addressNumber`),
  };
}

function mapCombat(record: JsonRecord, field: string): ReportsCenterCombatPreviewV1 {
  return {
    combatResultId: requiredNullableText(read(record, 'combatResultId'), `${field}.combatResultId`),
    turnCount: requiredNullableNumber(read(record, 'turnCount'), `${field}.turnCount`),
    attackCount: requiredNumber(read(record, 'attackCount'), `${field}.attackCount`),
  };
}

function mapReward(record: JsonRecord, field: string): ReportsCenterPreviewRewardV1 {
  const resources = requiredRecord(read(record, 'resources'), `${field}.resources`);

  return {
    summary: requiredNullableText(read(record, 'summary'), `${field}.summary`),
    entryCount: requiredNumber(read(record, 'entryCount'), `${field}.entryCount`),
    entriesPreview: requiredArray(read(record, 'entriesPreview'), `${field}.entriesPreview`)
      .map((entry, index) => mapRewardEntry(entry, `${field}.entriesPreview[${index}]`)),
    resourcesSummary: requiredNullableText(
      read(record, 'resourcesSummary'),
      `${field}.resourcesSummary`,
    ),
    resources: {
      summary: requiredNullableText(read(resources, 'summary'), `${field}.resources.summary`),
      rows: requiredArray(read(resources, 'rows'), `${field}.resources.rows`)
        .map((row, index) => mapResourceRow(row, `${field}.resources.rows[${index}]`)),
    },
  };
}

function mapRewardEntry(
  record: JsonRecord,
  field: string,
): ReportsCenterPreviewRewardEntryV1 {
  return {
    kind: requiredNullableText(read(record, 'kind'), `${field}.kind`),
    label: requiredNullableText(read(record, 'label'), `${field}.label`),
    displayValue: requiredText(read(record, 'displayValue'), `${field}.displayValue`),
    amount: requiredNullableNumber(read(record, 'amount'), `${field}.amount`),
    amountDisplay: requiredNullableText(read(record, 'amountDisplay'), `${field}.amountDisplay`),
    resourceType: requiredNullableText(read(record, 'resourceType'), `${field}.resourceType`),
    sourceKind: requiredNullableText(read(record, 'sourceKind'), `${field}.sourceKind`),
  };
}

function mapResourceRow(
  record: JsonRecord,
  field: string,
): ReportsCenterPreviewResourceRowV1 {
  return {
    resourceType: requiredNullableText(read(record, 'resourceType'), `${field}.resourceType`),
    label: requiredNullableText(read(record, 'label'), `${field}.label`),
    displayValue: requiredText(read(record, 'displayValue'), `${field}.displayValue`),
    amount: requiredNullableNumber(read(record, 'amount'), `${field}.amount`),
    gainAmount: requiredNullableNumber(read(record, 'gainAmount'), `${field}.gainAmount`),
    lossAmount: requiredNullableNumber(read(record, 'lossAmount'), `${field}.lossAmount`),
    sinkAmount: requiredNullableNumber(read(record, 'sinkAmount'), `${field}.sinkAmount`),
  };
}

function mapAccess(record: JsonRecord, field: string): ReportsCenterAccessPreviewV1 {
  return {
    visibility: requiredText(read(record, 'visibility'), `${field}.visibility`),
    accessRole: requiredText(read(record, 'accessRole'), `${field}.accessRole`),
    isUnread: requiredBoolean(read(record, 'isUnread'), `${field}.isUnread`),
    readAt: requiredNullableText(read(record, 'readAt'), `${field}.readAt`),
  };
}

function mapPublicAccess(record: JsonRecord, field: string): ReportsCenterPublicAccessV1 {
  return {
    hasPublicToken: requiredBoolean(read(record, 'hasPublicToken'), `${field}.hasPublicToken`),
    publicToken: requiredNullableText(read(record, 'publicToken'), `${field}.publicToken`),
    publicPath: requiredNullableText(read(record, 'publicPath'), `${field}.publicPath`),
    privatePath: requiredText(read(record, 'privatePath'), `${field}.privatePath`),
  };
}

function mapDiagnostics(record: JsonRecord, field: string): ReportsCenterPreviewDiagnosticsV1 {
  return {
    previewWarnings: requiredArray(read(record, 'previewWarnings'), `${field}.previewWarnings`)
      .map((warning, index) => {
        const message = optionalNullableText(
          read(warning, 'message'),
          `${field}.previewWarnings[${index}].message`,
        );

        return {
          key: requiredText(read(warning, 'key'), `${field}.previewWarnings[${index}].key`),
          ...(message ? { message } : {}),
        };
      }),
    usesFullReportDetail: requireFalse(
      read(record, 'usesFullReportDetail'),
      `${field}.usesFullReportDetail`,
    ),
    usesPrivateDomainRpc: requireFalse(
      read(record, 'usesPrivateDomainRpc'),
      `${field}.usesPrivateDomainRpc`,
    ),
    legacyTitle: requiredNullableText(read(record, 'legacyTitle'), `${field}.legacyTitle`),
    legacySummary: requiredNullableText(read(record, 'legacySummary'), `${field}.legacySummary`),
  };
}
