import { CombatLiveEventReadModel } from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
} from './json-read';
import { trimToNull } from './normalize-text';

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
    label: trimToNull(optionalText(read(record, 'label'))) ?? 'Zdarzenie walki',
    eventLabel: trimToNull(optionalText(read(record, 'eventLabel', 'event_label'))),
    detailText: trimToNull(optionalText(read(record, 'detailText', 'detail_text'))),
    displayText: trimToNull(optionalText(read(
      record,
      'displayText',
      'display_text',
      'summary',
    ))),
    damageDisplay: trimToNull(optionalText(read(record, 'damageDisplay', 'damage_display'))),
    attackSourceLabel: trimToNull(optionalText(read(
      record,
      'attackSourceLabel',
      'attack_source_label',
    ))),
    presentationKind: trimToNull(optionalText(read(
      record,
      'presentationKind',
      'presentation_kind',
    ))),
    timingHit: optionalBoolean(read(record, 'timingHit', 'timing_hit')),
    evaded: optionalBoolean(read(record, 'evaded')),
    critical: optionalBoolean(read(record, 'critical')),
    actorDisplayName: trimToNull(optionalText(read(
      record,
      'actorDisplayName',
      'actor_display_name',
      'attackerDisplayName',
      'attacker_display_name',
      'actorName',
      'actor_name',
    ))),
    targetDisplayName: trimToNull(optionalText(read(
      record,
      'targetDisplayName',
      'target_display_name',
      'defenderDisplayName',
      'defender_display_name',
      'targetName',
      'target_name',
    ))),
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
    roundLabel: trimToNull(optionalText(read(record, 'roundLabel', 'round_label'))),
    turnLabel: trimToNull(optionalText(read(record, 'turnLabel', 'turn_label'))),
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
