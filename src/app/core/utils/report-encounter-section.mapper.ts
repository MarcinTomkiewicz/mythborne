import { ReportEncounterSection } from '../domain/reports/report.model';
import {
  JsonRecord,
  optionalNullableBoolean,
  optionalNullableText,
  read,
  requiredText,
  requiredTextArray,
} from './json-read';

export function mapEncounterSection(record: JsonRecord, field: string): ReportEncounterSection {
  return {
    encounterKey: optionalNullableText(read(record, 'encounterKey'), `${field}.encounterKey`),
    encounterLabel: requiredText(read(record, 'encounterLabel'), `${field}.encounterLabel`),
    sourceLabel: requiredText(read(record, 'sourceLabel'), `${field}.sourceLabel`),
    encounterKind: requiredText(read(record, 'encounterKind'), `${field}.encounterKind`),
    minigameKey: optionalNullableText(read(record, 'minigameKey'), `${field}.minigameKey`),
    difficultyKey: optionalNullableText(read(record, 'difficultyKey'), `${field}.difficultyKey`),
    outcomeKind: optionalNullableText(read(record, 'outcomeKind'), `${field}.outcomeKind`),
    status: optionalNullableText(read(record, 'status'), `${field}.status`),
    resolvedAt: optionalNullableText(read(record, 'resolvedAt'), `${field}.resolvedAt`),
    noRewardReason: optionalNullableText(read(record, 'noRewardReason'), `${field}.noRewardReason`),
    noEffectReason: optionalNullableText(read(record, 'noEffectReason'), `${field}.noEffectReason`),
    noReportReason: optionalNullableText(read(record, 'noReportReason'), `${field}.noReportReason`),
    challengeKind: optionalNullableText(read(record, 'challengeKind'), `${field}.challengeKind`),
    success: optionalNullableBoolean(read(record, 'success'), `${field}.success`),
    completionMode: optionalNullableText(read(record, 'completionMode'), `${field}.completionMode`),
    createdAt: optionalNullableText(read(record, 'createdAt'), `${field}.createdAt`),
    completedAt: optionalNullableText(read(record, 'completedAt'), `${field}.completedAt`),
    title: requiredText(read(record, 'title'), `${field}.title`),
    summary: requiredText(read(record, 'summary'), `${field}.summary`),
    outcomeLabel: requiredText(read(record, 'outcomeLabel'), `${field}.outcomeLabel`),
    narrativeLines: requiredTextArray(read(record, 'narrativeLines'), `${field}.narrativeLines`),
    descriptionLines: requiredTextArray(read(record, 'descriptionLines'), `${field}.descriptionLines`),
  };
}
