import {
  CombatLiveParticipantReadModel,
  CombatResolutionPreviewReadModel,
} from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import { GetCombatResolutionPreviewRpcRow } from '../types/combat-live-rpc.types';
import {
  JsonRecord,
  jsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
} from './json-read';
import { mapParticipantStatRows } from './combat-live-participant.mapper';
import { trimToNull } from './normalize-text';
import { mapPvpCombatParticipantEffects } from './pvp-combat-context.mapper';

export function mapCombatResolutionPreview(
  row: GetCombatResolutionPreviewRpcRow,
): CombatResolutionPreviewReadModel {
  const participants = mapPreviewParticipants(row.participants_json);

  return {
    previewStatus: row.preview_status,
    decisionRequired: row.decision_required,
    canStartManual: row.can_start_manual,
    canAutoResolve: row.can_auto_resolve,
    combatSessionId: row.combat_session_id ?? null,
    sourceType: row.source_type,
    sourceEntityType: row.source_entity_type,
    sourceEntityId: row.source_entity_id,
    participants,
    updatedAt: row.updated_at,
    rawJson: row as unknown as Json,
  };
}

function mapPreviewParticipants(value: Json): CombatLiveParticipantReadModel[] {
  return Array.isArray(value)
    ? value.flatMap((entry, index) => {
        const record = jsonRecord(entry);
        const participant = record
          ? mapCombatResolutionPreviewParticipant(record, index)
          : null;

        return participant ? [participant] : [];
      })
    : [];
}

function mapCombatResolutionPreviewParticipant(
  record: JsonRecord,
  index: number,
): CombatLiveParticipantReadModel | null {
  const participantId = trimToNull(optionalText(read(
    record,
    'participantId',
    'participant_id',
  )));
  const participantKey = trimToNull(optionalText(read(
    record,
    'participantKey',
    'participant_key',
  )));
  const previewParticipantKey = trimToNull(optionalText(read(
    record,
    'previewParticipantKey',
    'preview_participant_key',
  )));
  const side = trimToNull(optionalText(read(record, 'side', 'participantSide', 'participant_side')));
  const heroId = trimToNull(optionalText(read(record, 'heroId', 'hero_id')));
  const opponentDefinitionId = trimToNull(optionalText(read(
    record,
    'opponentDefinitionId',
    'opponent_definition_id',
  )));
  const participantKind = trimToNull(optionalText(read(
    record,
    'participantKind',
    'participant_kind',
    'kind',
  )));
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
    previewParticipantKey: previewParticipantKey ??
      participantKey ??
      side ??
      `${participantKind ?? fallbackParticipantKind(heroId, opponentDefinitionId)}:${index}`,
    participantKey,
    participantKind,
    isPlayerControlled: optionalBoolean(read(
      record,
      'isPlayerControlled',
      'is_player_controlled',
    )) ?? false,
    side,
    displayName,
    statusKey: trimToNull(optionalText(read(record, 'statusKey', 'status_key', 'status'))),
    statusLabel: trimToNull(optionalText(read(record, 'statusLabel', 'status_label'))),
    currentHp: optionalNumber(read(
      record,
      'healthCurrent',
      'health_current',
      'currentHp',
      'current_hp',
    )),
    maxHp: optionalNumber(read(
      record,
      'healthMax',
      'health_max',
      'maxHp',
      'max_hp',
    )),
    baseStatRows: mapParticipantStatRows(read(record, 'baseStatRows', 'base_stat_rows')),
    combatStatRows: mapParticipantStatRows(read(record, 'combatStatRows', 'combat_stat_rows')),
    participantEffects: mapPvpCombatParticipantEffects(
      read(record, 'participantEffects', 'participant_effects'),
      'combat_resolution_preview.participants_json.participantEffects',
    ),
    heroId,
    opponentDefinitionId,
    rawJson: record as unknown as Json,
  };
}

function fallbackParticipantKind(
  heroId: string | null,
  opponentDefinitionId: string | null,
): string {
  if (heroId) {
    return 'hero';
  }

  if (opponentDefinitionId) {
    return 'opponent';
  }

  return 'participant';
}
