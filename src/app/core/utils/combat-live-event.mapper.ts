import { CombatLiveEventReadModel } from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNumber,
  optionalText,
  read,
} from './json-read';
import {
  humanizeKey,
  trimToNull,
} from './normalize-text';

export function mapEvent(record: JsonRecord): CombatLiveEventReadModel | null {
  const index = optionalNumber(read(record, 'eventIndex', 'event_index'));

  if (index === null) {
    return null;
  }

  const eventKind = trimToNull(optionalText(read(record, 'eventKind', 'event_kind')))
    ?? 'event';

  return {
    eventIndex: Math.floor(index),
    eventKind,
    label: trimToNull(optionalText(read(record, 'label')))
      ?? humanizeKey(eventKind, 'Event'),
    actorParticipantId: trimToNull(optionalText(read(
      record,
      'actorParticipantId',
      'actor_participant_id',
    ))),
    targetParticipantId: trimToNull(optionalText(read(
      record,
      'targetParticipantId',
      'target_participant_id',
    ))),
    roundNumber: optionalNumber(read(record, 'roundNumber', 'round_number')),
    actionIndex: optionalNumber(read(record, 'actionIndex', 'action_index')),
    happenedAt: trimToNull(optionalText(read(
      record,
      'happenedAt',
      'happened_at',
      'createdAt',
      'created_at',
    ))),
    details: eventDetails(record),
    rawJson: record as unknown as Json,
  };
}

function eventDetails(record: JsonRecord): string[] {
  const details = read(record, 'details', 'detailRows', 'detail_rows');

  return Array.isArray(details)
    ? details
        .map((entry) => typeof entry === 'string' ? entry : null)
        .filter((entry): entry is string => Boolean(entry))
    : [];
}
