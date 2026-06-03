import {
  CombatLiveEventReadModel,
  CombatLogActionSegmentReadModel,
  CombatLogResultRowReadModel,
  CombatLogSecondaryRowReadModel,
} from '../domain/combat/combat-live.model';
import type { CombatDisplayValueTone } from '../domain/combat/combat-display.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  jsonRecord,
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
  const presentationKind = trimToNull(optionalText(read(
    record,
    'presentationKind',
    'presentation_kind',
  )));

  return {
    eventIndex: Math.floor(index),
    eventKind,
    label: trimToNull(optionalText(read(record, 'label'))) ?? 'Zdarzenie walki',
    actionText: trimToNull(optionalText(read(record, 'actionText', 'action_text'))),
    actionSegments: logActionSegments(read(record, 'actionSegments', 'action_segments')),
    resultRows: logResultRows(read(record, 'resultRows', 'result_rows')),
    secondaryLogRows: secondaryLogRows(read(
      record,
      'secondaryLogRows',
      'secondary_log_rows',
      'secondaryRows',
      'secondary_rows',
    )),
    eventLabel: trimToNull(optionalText(read(record, 'eventLabel', 'event_label'))),
    detailText: trimToNull(optionalText(read(record, 'detailText', 'detail_text'))),
    displayText: trimToNull(optionalText(read(
      record,
      'displayText',
      'display_text',
      'summary',
    ))),
    damageDisplay: trimToNull(optionalText(read(record, 'damageDisplay', 'damage_display'))),
    resultDisplay: trimToNull(optionalText(read(record, 'resultDisplay', 'result_display'))),
    healingDisplay: trimToNull(optionalText(read(record, 'healingDisplay', 'healing_display'))),
    attackSourceLabel: trimToNull(optionalText(read(
      record,
      'attackSourceLabel',
      'attack_source_label',
    ))),
    presentationKind,
    tone: combatDisplayTone(read(record, 'tone')) ?? combatPresentationTone(presentationKind),
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

function logActionSegments(value: Json | undefined): CombatLogActionSegmentReadModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (typeof entry === 'string') {
      const text = trimToNull(entry);
      return text ? [{ kind: null, text, tone: null }] : [];
    }

    const record = jsonRecord(entry);
    const text = trimToNull(optionalText(read(record, 'text', 'label', 'displayText', 'display_text')));

    return record && text
      ? [{
          kind: trimToNull(optionalText(read(record, 'kind', 'segmentKind', 'segment_kind'))),
          text,
          tone: combatDisplayTone(read(record, 'tone')),
        }]
      : [];
  });
}

function logResultRows(value: Json | undefined): CombatLogResultRowReadModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (typeof entry === 'string') {
      const text = trimToNull(entry);
      return text ? [{ text, tone: null }] : [];
    }

    const record = jsonRecord(entry);
    const text = trimToNull(optionalText(read(
      record,
      'text',
      'label',
      'displayText',
      'display_text',
      'resultDisplay',
      'result_display',
      'damageDisplay',
      'damage_display',
      'healingDisplay',
      'healing_display',
    )));

    const presentationKind = trimToNull(optionalText(read(record, 'presentationKind', 'presentation_kind')));

    return record && text
      ? [{
          text,
          tone: combatDisplayTone(read(record, 'tone')) ?? combatPresentationTone(presentationKind),
        }]
      : [];
  });
}

function secondaryLogRows(value: Json | undefined): CombatLogSecondaryRowReadModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry, index) => {
    const record = jsonRecord(entry);

    const presentationKind = trimToNull(optionalText(read(record, 'presentationKind', 'presentation_kind')));

    return record
      ? [{
          id: trimToNull(optionalText(read(record, 'id', 'rowId', 'row_id'))) ?? String(index),
          actorDisplayName: trimToNull(optionalText(read(
            record,
            'actorDisplayName',
            'actor_display_name',
            'actorLabel',
            'actor_label',
          ))),
          actionText: trimToNull(optionalText(read(record, 'actionText', 'action_text'))),
          actionSegments: logActionSegments(read(record, 'actionSegments', 'action_segments')),
          resultRows: logResultRows(read(record, 'resultRows', 'result_rows')),
          eventLabel: trimToNull(optionalText(read(record, 'eventLabel', 'event_label'))),
          detailText: trimToNull(optionalText(read(record, 'detailText', 'detail_text'))),
          displayText: trimToNull(optionalText(read(record, 'displayText', 'display_text'))),
          damageDisplay: trimToNull(optionalText(read(record, 'damageDisplay', 'damage_display'))),
          resultDisplay: trimToNull(optionalText(read(record, 'resultDisplay', 'result_display'))),
          healingDisplay: trimToNull(optionalText(read(record, 'healingDisplay', 'healing_display'))),
          attackSourceLabel: trimToNull(optionalText(read(record, 'attackSourceLabel', 'attack_source_label'))),
          presentationKind,
          tone: combatDisplayTone(read(record, 'tone')) ?? combatPresentationTone(presentationKind),
          details: eventDetails(record),
        }]
      : [];
  });
}

function combatDisplayTone(value: Json | undefined): CombatDisplayValueTone | null {
  switch (trimToNull(optionalText(value))?.toLowerCase()) {
    case 'danger':
      return 'danger';
    case 'golden':
      return 'golden';
    case 'info':
      return 'info';
    case 'success':
      return 'success';
    case 'muted':
      return 'muted';
    default:
      return null;
  }
}

function combatPresentationTone(value: string | null): CombatDisplayValueTone | null {
  switch (value?.toLowerCase()) {
    case 'miss':
    case 'evade':
    case 'no_damage':
      return 'info';
    case 'critical_hit':
    case 'critical':
    case 'lethal':
    case 'danger':
      return 'danger';
    case 'heal':
    case 'healing':
    case 'success':
      return 'success';
    case 'hit':
    case 'damage':
      return 'golden';
    default:
      return null;
  }
}

function eventDetails(record: JsonRecord): string[] {
  const details = read(record, 'details', 'detailRows', 'detail_rows');

  return Array.isArray(details)
    ? details
        .map((entry) => typeof entry === 'string' ? entry : null)
        .filter((entry): entry is string => Boolean(entry))
    : [];
}
