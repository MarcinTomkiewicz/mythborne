import {
  CombatLiveParticipantReadModel,
  CombatLiveParticipantStatRow,
} from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  mapJsonArray,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
} from './json-read';
import { trimToNull } from './normalize-text';
import {
  displayScalar,
  displayText,
  sortBySortOrder,
} from './stat-row-display';
import { statTone } from './stat-tone-class';
import { mapPvpCombatParticipantEffects } from './pvp-combat-context.mapper';

export function mapParticipant(record: JsonRecord): CombatLiveParticipantReadModel | null {
  const participantId = trimToNull(optionalText(read(
    record,
    'participantId',
    'participant_id',
  )));

  if (!participantId) {
    return null;
  }

  const displayName = trimToNull(optionalText(read(
    record,
    'displayName',
    'display_name',
  )));

  if (!displayName) {
    return null;
  }

  return {
    participantId,
    previewParticipantKey: participantId,
    participantKey: participantId,
    participantKind: trimToNull(optionalText(read(record, 'participantKind', 'participant_kind', 'kind'))),
    isPlayerControlled: optionalBoolean(read(
      record,
      'isPlayerControlled',
      'is_player_controlled',
    )) ?? false,
    side: trimToNull(optionalText(read(record, 'side', 'participantSide', 'participant_side'))),
    displayName,
    statusKey: trimToNull(optionalText(read(record, 'statusKey', 'status_key', 'status'))),
    statusLabel: trimToNull(optionalText(read(record, 'statusLabel', 'status_label'))),
    currentHp: optionalNumber(read(
      record,
      'healthCurrent',
      'health_current',
    )),
    maxHp: optionalNumber(read(
      record,
      'healthMax',
      'health_max',
    )),
    baseStatRows: mapParticipantStatRows(read(record, 'baseStatRows', 'base_stat_rows')),
    combatStatRows: mapParticipantStatRows(read(record, 'combatStatRows', 'combat_stat_rows')),
    participantEffects: mapPvpCombatParticipantEffects(
      read(record, 'participantEffects', 'participant_effects'),
      'combat_live.participants_json.participantEffects',
    ),
    heroId: trimToNull(optionalText(read(record, 'heroId', 'hero_id'))),
    opponentDefinitionId: trimToNull(optionalText(read(
      record,
      'opponentDefinitionId',
      'opponent_definition_id',
    ))),
    rawJson: record as unknown as Json,
  };
}

export function mapParticipantStatRows(value: Json | undefined): CombatLiveParticipantStatRow[] {
  return sortBySortOrder(
    mapJsonArray(value, mapParticipantStatRow)
      .filter((row): row is CombatLiveParticipantStatRow => row !== null),
  );
}

function mapParticipantStatRow(record: JsonRecord): CombatLiveParticipantStatRow | null {
  const key = trimToNull(optionalText(read(record, 'key')));
  const label = trimToNull(optionalText(read(record, 'label')));
  const value = displayScalar(read(record, 'value'));

  if (
    !key ||
    !label ||
    value === null
  ) {
    return null;
  }

  return {
    key,
    label,
    value,
    displayValue: trimToNull(optionalText(read(record, 'displayValue', 'display_value'))) ??
      displayText(value),
    sortOrder: optionalNumber(read(record, 'sortOrder', 'sort_order')) ?? 0,
    kind: trimToNull(optionalText(read(record, 'kind'))) ?? 'stat',
    tone: statTone(read(record, 'tone')),
    colorableFinalValue: optionalBoolean(read(
      record,
      'colorableFinalValue',
      'colorable_final_value',
    )) ?? false,
    maxValue: optionalNumber(read(record, 'maxValue', 'max_value')),
    unit: trimToNull(optionalText(read(record, 'unit'))),
  };
}
