import {
  ReportRewardEntryRow,
  ReportRewardSection,
} from '../domain/reports/report.model';
import {
  JsonRecord,
  optionalNullableNumber,
  optionalNullableText,
  optionalTextArray,
  read,
  requiredArray,
  requiredBoolean,
  requiredNullableText,
  requiredText,
} from './json-read';
import { mapNullableEffectDisplay } from './report-effect-section.mapper';

export function mapRewardSection(record: JsonRecord, field: string): ReportRewardSection {
  return {
    hasReward: requiredBoolean(read(record, 'hasReward'), `${field}.hasReward`),
    title: requiredText(read(record, 'title'), `${field}.title`),
    summary: requiredText(read(record, 'summary'), `${field}.summary`),
    sourceLabel: requiredText(read(record, 'sourceLabel'), `${field}.sourceLabel`),
    status: optionalNullableText(read(record, 'status'), `${field}.status`),
    sourceKind: optionalNullableText(read(record, 'sourceKind'), `${field}.sourceKind`),
    reason: optionalNullableText(read(record, 'reason'), `${field}.reason`),
    grantedAt: optionalNullableText(read(record, 'grantedAt'), `${field}.grantedAt`),
    entryCount: optionalNullableNumber(read(record, 'entryCount'), `${field}.entryCount`),
    entries: requiredArray(read(record, 'entries'), `${field}.entries`)
      .map((row, index) => mapRewardEntry(row, `${field}.entries[${index}]`)),
    narrativeLines: optionalTextArray(read(record, 'narrativeLines'), `${field}.narrativeLines`),
    message: optionalNullableText(read(record, 'message'), `${field}.message`),
  };
}

function mapRewardEntry(row: JsonRecord, field: string): ReportRewardEntryRow {
  return {
    entryKind: requiredText(read(row, 'entryKind'), `${field}.entryKind`),
    entryLabel: requiredText(read(row, 'entryLabel'), `${field}.entryLabel`),
    amount: optionalNullableNumber(read(row, 'amount'), `${field}.amount`),
    amountDisplay: optionalNullableText(read(row, 'amountDisplay'), `${field}.amountDisplay`),
    resourceType: optionalNullableText(read(row, 'resourceType'), `${field}.resourceType`),
    resourceLabel: optionalNullableText(read(row, 'resourceLabel'), `${field}.resourceLabel`),
    itemDisplayName: optionalNullableText(read(row, 'itemDisplayName'), `${field}.itemDisplayName`),
    effectKey: optionalNullableText(read(row, 'effectKey'), `${field}.effectKey`),
    effectLabel: optionalNullableText(read(row, 'effectLabel'), `${field}.effectLabel`),
    effectKind: optionalNullableText(read(row, 'effectKind'), `${field}.effectKind`),
    effectDisplay: mapNullableEffectDisplay(read(row, 'effectDisplay'), `${field}.effectDisplay`),
    displayValue: requiredNullableText(read(row, 'displayValue'), `${field}.displayValue`),
    summary: requiredNullableText(read(row, 'summary'), `${field}.summary`),
    playerSummary: requiredNullableText(read(row, 'playerSummary'), `${field}.playerSummary`),
    createdAt: optionalNullableText(read(row, 'createdAt'), `${field}.createdAt`),
  };
}
