import {
  GameReportItemReference,
  GameReportParticipant,
  PublicGameReportItemReference,
} from '../domain/reports/game-report.model';
import { Json } from '../types/database.types';
import {
  GameReportItemReferenceRow,
  GameReportParticipantRow,
} from '../types/game-report-rpc.types';
import {
  optionalJsonNumber,
  optionalJsonString,
  readJsonField,
  requiredJsonArray,
  requiredJsonRecord,
  requiredJsonString,
} from './game-report-json-reader';

export function parseGameReportParticipantsJson(value: Json): GameReportParticipant[] {
  return requiredJsonArray(value, 'participants_json').map((entry) => {
    const record = requiredJsonRecord(entry, 'participants_json entry');

    return {
      displayName: requiredJsonString(readJsonField(record, 'displayName'), 'displayName'),
      participantRole: requiredJsonString(
        readJsonField(record, 'participantRole'),
        'participantRole',
      ),
      sideLabel: optionalJsonString(readJsonField(record, 'sideLabel')),
      levelSnapshot: optionalJsonNumber(readJsonField(record, 'levelSnapshot')),
      sortOrder: optionalJsonNumber(readJsonField(record, 'sortOrder')) ?? 0,
    };
  }).sort((left, right) => left.sortOrder - right.sortOrder);
}

export function parseGameReportItemReferencesJson(value: Json): GameReportItemReference[] {
  return requiredJsonArray(value, 'item_references_json').map((entry) => {
    const record = requiredJsonRecord(entry, 'item_references_json entry');

    return {
      sourceKind: requiredJsonString(
        readJsonField(record, 'sourceKind'),
        'sourceKind',
      ) as GameReportItemReference['sourceKind'],
      sourceItemId: optionalJsonString(readJsonField(record, 'sourceItemId')),
      displayName: requiredJsonString(readJsonField(record, 'displayName'), 'displayName'),
      qualityKey: optionalJsonString(readJsonField(record, 'qualityKey')),
      baseId: optionalJsonString(readJsonField(record, 'baseId')),
      prefixAffixId: optionalJsonString(readJsonField(record, 'prefixAffixId')),
      suffixAffixId: optionalJsonString(readJsonField(record, 'suffixAffixId')),
      displayDetails: safeItemReferenceDisplayDetails({
        qualityKey: optionalJsonString(readJsonField(record, 'qualityKey')),
        displayDetails: optionalJsonStringArray(
          readJsonField(record, 'displayDetails'),
          'displayDetails',
        ),
      }),
      sortOrder: optionalJsonNumber(readJsonField(record, 'sortOrder')) ?? 0,
    };
  }).sort((left, right) => left.sortOrder - right.sortOrder);
}

export function parsePublicGameReportItemReferencesJson(
  value: Json,
): PublicGameReportItemReference[] {
  return parseGameReportItemReferencesJson(value).map((reference) => ({
    sourceKind: reference.sourceKind,
    displayName: reference.displayName,
    qualityKey: reference.qualityKey,
    displayDetails: reference.displayDetails,
    sortOrder: reference.sortOrder,
  }));
}

export function mapGameReportParticipantRow(
  row: GameReportParticipantRow,
): GameReportParticipant {
  return {
    displayName: row.display_name,
    participantRole: row.participant_role,
    sideLabel: row.side_label,
    levelSnapshot: row.level_snapshot,
    sortOrder: row.sort_order,
  };
}

export function mapGameReportItemReferenceRow(
  row: GameReportItemReferenceRow,
): GameReportItemReference {
  return {
    sourceKind: row.source_kind,
    sourceItemId: row.source_item_id,
    displayName: row.display_name_fallback,
    qualityKey: row.quality_key,
    baseId: row.base_id,
    prefixAffixId: row.prefix_affix_id,
    suffixAffixId: row.suffix_affix_id,
    displayDetails: safeItemReferenceDisplayDetails({
      qualityKey: row.quality_key,
      displayDetails: [],
    }),
    sortOrder: row.sort_order,
  };
}

function safeItemReferenceDisplayDetails(input: {
  qualityKey: string | null;
  displayDetails: string[];
}): string[] {
  return input.displayDetails.length > 0
    ? input.displayDetails
    : input.qualityKey ? [`Quality ${input.qualityKey}`] : [];
}

function optionalJsonStringArray(
  value: Json | undefined,
  fieldName: string,
): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  return requiredJsonArray(value, fieldName).map((entry, index) =>
    requiredJsonString(entry, `${fieldName}[${index}]`),
  );
}
