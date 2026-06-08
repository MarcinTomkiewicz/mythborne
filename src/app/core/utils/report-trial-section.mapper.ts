import { ReportTrialSection } from '../domain/reports/report.model';
import { mapOptionalExplorationResultNarrativeSnapshot } from './exploration-result-copy.mapper';
import {
  JsonRecord,
  optionalNullableBoolean,
  optionalNullableNumber,
  optionalNullableText,
  read,
  requiredBoolean,
  requiredText,
  requiredTextArray,
} from './json-read';

export function mapTrialSection(record: JsonRecord, field: string): ReportTrialSection {
  return {
    trialKey: requiredText(read(record, 'trialKey'), `${field}.trialKey`),
    trialLabel: requiredText(read(record, 'trialLabel'), `${field}.trialLabel`),
    sourceLabel: requiredText(read(record, 'sourceLabel'), `${field}.sourceLabel`),
    minigameKey: optionalNullableText(read(record, 'minigameKey'), `${field}.minigameKey`),
    difficultyKey: optionalNullableText(read(record, 'difficultyKey'), `${field}.difficultyKey`),
    status: requiredText(read(record, 'status'), `${field}.status`),
    trialManifested: requiredBoolean(read(record, 'trialManifested'), `${field}.trialManifested`),
    manifestationStatus: requiredText(read(record, 'manifestationStatus'), `${field}.manifestationStatus`),
    resultKind: requiredText(read(record, 'resultKind'), `${field}.resultKind`),
    resultKey: requiredText(read(record, 'resultKey'), `${field}.resultKey`),
    outcomeKind: requiredText(read(record, 'outcomeKind'), `${field}.outcomeKind`),
    title: requiredText(read(record, 'title'), `${field}.title`),
    summary: requiredText(read(record, 'summary'), `${field}.summary`),
    outcomeLabel: requiredText(read(record, 'outcomeLabel'), `${field}.outcomeLabel`),
    resultLabel: requiredText(read(record, 'resultLabel'), `${field}.resultLabel`),
    narrativeLines: requiredTextArray(read(record, 'narrativeLines'), `${field}.narrativeLines`),
    descriptionLines: requiredTextArray(read(record, 'descriptionLines'), `${field}.descriptionLines`),
    success: optionalNullableBoolean(read(record, 'success'), `${field}.success`),
    completionMode: optionalNullableText(read(record, 'completionMode'), `${field}.completionMode`),
    score: optionalNullableNumber(read(record, 'score'), `${field}.score`),
    performanceRating: optionalNullableText(read(record, 'performanceRating'), `${field}.performanceRating`),
    testedStatKey: optionalNullableText(read(record, 'testedStatKey'), `${field}.testedStatKey`),
    testedStatLabel: optionalNullableText(read(record, 'testedStatLabel'), `${field}.testedStatLabel`),
    createdAt: optionalNullableText(read(record, 'createdAt'), `${field}.createdAt`),
    completedAt: optionalNullableText(read(record, 'completedAt'), `${field}.completedAt`),
    trialManifestationNarrativeJson: mapOptionalExplorationResultNarrativeSnapshot(
      read(record, 'trialManifestationNarrativeJson', 'trial_manifestation_narrative_json'),
      `${field}.trialManifestationNarrativeJson`,
    ),
    resultNarrativeJson: mapOptionalExplorationResultNarrativeSnapshot(
      read(record, 'resultNarrativeJson', 'result_narrative_json'),
      `${field}.resultNarrativeJson`,
    ),
  };
}
