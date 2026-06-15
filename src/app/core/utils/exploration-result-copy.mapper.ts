import {
  ExplorationResultNarrativeMetadata,
  ExplorationResultNarrativeSnapshot,
  ExplorationRichTextFragmentKind,
} from '../domain/exploration/exploration-result-copy.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNullableBoolean,
  optionalNullableText,
  read,
  requiredRecord,
  requiredText,
} from './json-read';
import {
  mapOptionalRichTextFragments,
  mapRichTextFragments,
  requireRichTextTone,
} from './rich-text.mapper';

export function mapOptionalExplorationResultNarrativeSnapshot(
  value: Json | undefined,
  field: string,
): ExplorationResultNarrativeSnapshot | null {
  if (value === undefined || value === null) {
    return null;
  }

  const record = requiredRecord(value, field);
  const contractVersion = requiredText(read(record, 'contractVersion'), `${field}.contractVersion`);

  if (contractVersion !== 'exploration_result_narrative_snapshot_v1') {
    throw new Error(`${field}.contractVersion has unsupported value: ${contractVersion}.`);
  }

  return {
    contractVersion,
    locale: requiredText(read(record, 'locale'), `${field}.locale`),
    selectedCopyKey: requiredText(read(record, 'selectedCopyKey'), `${field}.selectedCopyKey`),
    sourceKind: requiredText(read(record, 'sourceKind'), `${field}.sourceKind`),
    resultKind: requiredText(read(record, 'resultKind'), `${field}.resultKind`),
    eyebrow: requiredText(read(record, 'eyebrow'), `${field}.eyebrow`),
    title: requiredText(read(record, 'title'), `${field}.title`),
    titleTone: requireRichTextTone(
      requiredText(read(record, 'titleTone'), `${field}.titleTone`),
      `${field}.titleTone`,
    ),
    narrativePlainText: requiredText(read(record, 'narrativePlainText'), `${field}.narrativePlainText`),
    narrativeRichText: mapRichTextFragments(
      read(record, 'narrativeRichText'),
      `${field}.narrativeRichText`,
      requireRichTextFragmentKind,
    ),
    rewardPlainText: optionalNullableText(read(record, 'rewardPlainText'), `${field}.rewardPlainText`),
    rewardRichText: mapOptionalRichTextFragments(
      read(record, 'rewardRichText'),
      `${field}.rewardRichText`,
      requireRichTextFragmentKind,
    ),
    effectPlainText: optionalNullableText(read(record, 'effectPlainText'), `${field}.effectPlainText`),
    effectRichText: mapOptionalRichTextFragments(
      read(record, 'effectRichText'),
      `${field}.effectRichText`,
      requireRichTextFragmentKind,
    ),
    metadata: mapResultNarrativeMetadata(
      requiredRecord(read(record, 'metadata'), `${field}.metadata`),
      `${field}.metadata`,
    ),
  };
}

function mapResultNarrativeMetadata(
  record: JsonRecord,
  field: string,
): ExplorationResultNarrativeMetadata {
  return {
    trialKey: optionalNullableText(read(record, 'trialKey'), `${field}.trialKey`),
    patronKey: optionalNullableText(read(record, 'patronKey'), `${field}.patronKey`),
    encounterKey: optionalNullableText(read(record, 'encounterKey'), `${field}.encounterKey`),
    encounterKind: optionalNullableText(read(record, 'encounterKind'), `${field}.encounterKind`),
    rewardEligibility: optionalNullableText(read(record, 'rewardEligibility'), `${field}.rewardEligibility`),
    completionMode: optionalNullableText(read(record, 'completionMode'), `${field}.completionMode`),
    success: optionalNullableBoolean(read(record, 'success'), `${field}.success`),
    sourceId: optionalNullableText(read(record, 'sourceId'), `${field}.sourceId`),
  };
}

function requireRichTextFragmentKind(
  value: string,
  field: string,
): ExplorationRichTextFragmentKind {
  if (
    value === 'text' ||
    value === 'patronRef' ||
    value === 'trialTitleRef' ||
    value === 'experience' ||
    value === 'resource' ||
    value === 'itemRef' ||
    value === 'effect' ||
    value === 'stat' ||
    value === 'value'
  ) {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}
