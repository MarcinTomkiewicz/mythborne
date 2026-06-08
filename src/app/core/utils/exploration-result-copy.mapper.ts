import {
  ExplorationResultNarrativeMetadata,
  ExplorationResultNarrativeSnapshotV1,
  ExplorationRichTextFragment,
  ExplorationRichTextFragmentKind,
  ExplorationRichTextTone,
} from '../domain/exploration/exploration-result-copy.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNullableBoolean,
  optionalNullableNumber,
  optionalNullableText,
  read,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapOptionalExplorationResultNarrativeSnapshot(
  value: Json | undefined,
  field: string,
): ExplorationResultNarrativeSnapshotV1 | null {
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
    narrativeRichText: mapRichTextFragments(read(record, 'narrativeRichText'), `${field}.narrativeRichText`),
    rewardPlainText: optionalNullableText(read(record, 'rewardPlainText'), `${field}.rewardPlainText`),
    rewardRichText: mapOptionalRichTextFragments(read(record, 'rewardRichText'), `${field}.rewardRichText`),
    effectPlainText: optionalNullableText(read(record, 'effectPlainText'), `${field}.effectPlainText`),
    effectRichText: mapOptionalRichTextFragments(read(record, 'effectRichText'), `${field}.effectRichText`),
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

function mapOptionalRichTextFragments(
  value: Json | undefined,
  field: string,
): ExplorationRichTextFragment[] | null {
  return value === undefined || value === null
    ? null
    : mapRichTextFragments(value, field);
}

function mapRichTextFragments(
  value: Json | undefined,
  field: string,
): ExplorationRichTextFragment[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value.map((entry, index) =>
    mapRichTextFragment(requiredRecord(entry, `${field}[${index}]`), `${field}[${index}]`),
  );
}

function mapRichTextFragment(
  record: JsonRecord,
  field: string,
): ExplorationRichTextFragment {
  return {
    kind: requireRichTextFragmentKind(requiredText(read(record, 'kind'), `${field}.kind`), `${field}.kind`),
    text: requiredText(read(record, 'text'), `${field}.text`),
    tone: mapOptionalTone(read(record, 'tone'), `${field}.tone`),
    token: optionalNullableText(read(record, 'token'), `${field}.token`) ?? undefined,
    value: optionalNullableNumber(read(record, 'value'), `${field}.value`) ?? undefined,
    displayValue: optionalNullableText(read(record, 'displayValue'), `${field}.displayValue`) ?? undefined,
    resourceKey: optionalNullableText(read(record, 'resourceKey'), `${field}.resourceKey`) ?? undefined,
    statKey: optionalNullableText(read(record, 'statKey'), `${field}.statKey`) ?? undefined,
    effectKey: optionalNullableText(read(record, 'effectKey'), `${field}.effectKey`) ?? undefined,
    effectKind: optionalNullableText(read(record, 'effectKind'), `${field}.effectKind`) ?? undefined,
    itemId: optionalNullableText(read(record, 'itemId'), `${field}.itemId`) ?? undefined,
    itemName: optionalNullableText(read(record, 'itemName'), `${field}.itemName`) ?? undefined,
    itemPublicToken: optionalNullableText(read(record, 'itemPublicToken'), `${field}.itemPublicToken`),
    metadata: mapMetadata(read(record, 'metadata'), `${field}.metadata`),
  };
}

function mapMetadata(
  value: Json | undefined,
  field: string,
): Record<string, unknown> | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return requiredRecord(value, field) as Record<string, unknown>;
}

function mapOptionalTone(
  value: Json | undefined,
  field: string,
): ExplorationRichTextTone | undefined {
  return value === undefined || value === null
    ? undefined
    : requireRichTextTone(requiredText(value, field), field);
}

function requireRichTextTone(
  value: string,
  field: string,
): ExplorationRichTextTone {
  if (
    value === 'heading' ||
    value === 'info' ||
    value === 'warn' ||
    value === 'success' ||
    value === 'danger'
  ) {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
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
