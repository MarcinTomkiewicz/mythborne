import { CombatLiveParticipantReadModel } from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNumber,
  optionalText,
  read,
} from './json-read';
import { trimToNull } from './normalize-text';

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
  ))) ?? participantId;

  return {
    participantId,
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
    heroId: trimToNull(optionalText(read(record, 'heroId', 'hero_id'))),
    opponentDefinitionId: trimToNull(optionalText(read(
      record,
      'opponentDefinitionId',
      'opponent_definition_id',
    ))),
    rawJson: record as unknown as Json,
  };
}
