import {
  GameReportCombatAttack,
  GameReportCombatParticipant,
  GameReportCombatSection,
} from '../domain/reports/game-report.model';
import { Json } from '../types/database.types';
import {
  optionalJsonBoolean,
  optionalJsonNumber,
  optionalJsonString,
  readJsonField,
  requiredJsonArray,
  requiredJsonNumber,
  requiredJsonRecord,
  requiredJsonString,
} from './game-report-json-reader';

export function parseGameReportCombatSectionJson(
  value: Json,
): GameReportCombatSection | null {
  if (value === null) {
    return null;
  }

  const record = requiredJsonRecord(value, 'combat_section_json');

  return {
    outcome: requiredJsonString(readJsonField(record, 'outcome'), 'outcome'),
    turnsCompleted: optionalJsonNumber(readJsonField(record, 'turnsCompleted')),
    participants: parseCombatParticipants(readJsonField(record, 'participants')),
    attacks: parseCombatAttacks(readJsonField(record, 'attacks')),
  };
}

function parseCombatParticipants(value: Json | undefined): GameReportCombatParticipant[] {
  return requiredJsonArray(value, 'participants').map((entry) => {
    const record = requiredJsonRecord(entry, 'combat participants entry');

    return {
      side: requiredJsonString(readJsonField(record, 'side'), 'side'),
      participantKind: requiredJsonString(
        readJsonField(record, 'participantKind'),
        'participantKind',
      ),
      displayName: requiredJsonString(readJsonField(record, 'displayName'), 'displayName'),
      level: optionalJsonNumber(readJsonField(record, 'level')),
      healthStart: optionalJsonNumber(readJsonField(record, 'healthStart')),
      healthEnd: optionalJsonNumber(readJsonField(record, 'healthEnd')),
      maxHealth: optionalJsonNumber(readJsonField(record, 'maxHealth')),
    };
  });
}

function parseCombatAttacks(value: Json | undefined): GameReportCombatAttack[] {
  return requiredJsonArray(value, 'attacks').map((entry) => {
    const record = requiredJsonRecord(entry, 'combat attacks entry');

    return {
      turnNumber: requiredJsonNumber(readJsonField(record, 'turnNumber'), 'turnNumber'),
      attackOrder: optionalJsonNumber(readJsonField(record, 'attackOrder')) ?? 0,
      actorSide: requiredJsonString(readJsonField(record, 'actorSide'), 'actorSide'),
      targetSide: requiredJsonString(readJsonField(record, 'targetSide'), 'targetSide'),
      sourceKind: optionalJsonString(readJsonField(record, 'sourceKind')),
      sourceLabel: requiredJsonString(readJsonField(record, 'sourceLabel'), 'sourceLabel'),
      timingHit: optionalJsonBoolean(readJsonField(record, 'timingHit')),
      evaded: optionalJsonBoolean(readJsonField(record, 'evaded')) ?? false,
      critical: optionalJsonBoolean(readJsonField(record, 'critical')) ?? false,
      finalDamage: requiredJsonNumber(readJsonField(record, 'finalDamage'), 'finalDamage'),
      targetHealthBefore: optionalJsonNumber(readJsonField(record, 'targetHealthBefore')),
      targetHealthAfter: optionalJsonNumber(readJsonField(record, 'targetHealthAfter')),
      displayText: requiredJsonString(readJsonField(record, 'displayText'), 'displayText'),
    };
  }).sort((left, right) =>
    left.turnNumber !== right.turnNumber
      ? left.turnNumber - right.turnNumber
      : left.attackOrder - right.attackOrder,
  );
}
