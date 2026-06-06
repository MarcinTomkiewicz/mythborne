import {
  ReportCombatAttackRow,
  ReportCombatDisplayStatRow,
  ReportCombatParticipantRow,
  ReportCombatParticipantStatRow,
  ReportCombatSection,
} from '../domain/reports/report.model';
import {
  JsonRecord,
  optionalNullableBoolean,
  optionalNullableNumber,
  optionalNullableText,
  optionalRecordArray,
  optionalStringOrNumber,
  read,
  requiredArray,
  requiredNumber,
  requiredText,
  requiredTextArray,
} from './json-read';

export function mapCombatSection(record: JsonRecord, field: string): ReportCombatSection {
  return {
    sourceLabel: requiredText(read(record, 'sourceLabel'), `${field}.sourceLabel`),
    title: requiredText(read(record, 'title'), `${field}.title`),
    summary: requiredText(read(record, 'summary'), `${field}.summary`),
    pvpOutcome: optionalNullableText(read(record, 'pvpOutcome'), `${field}.pvpOutcome`),
    sourceType: requiredText(read(record, 'sourceType'), `${field}.sourceType`),
    sourceTypeLabel: requiredText(read(record, 'sourceTypeLabel'), `${field}.sourceTypeLabel`),
    outcome: requiredText(read(record, 'outcome'), `${field}.outcome`),
    outcomeLabel: requiredText(read(record, 'outcomeLabel'), `${field}.outcomeLabel`),
    winnerSide: optionalNullableText(read(record, 'winnerSide'), `${field}.winnerSide`),
    winnerSideLabel: optionalNullableText(read(record, 'winnerSideLabel'), `${field}.winnerSideLabel`),
    loserSide: optionalNullableText(read(record, 'loserSide'), `${field}.loserSide`),
    loserSideLabel: optionalNullableText(read(record, 'loserSideLabel'), `${field}.loserSideLabel`),
    turnsCompleted: requiredNumber(read(record, 'turnsCompleted'), `${field}.turnsCompleted`),
    startedAt: optionalNullableText(read(record, 'startedAt'), `${field}.startedAt`),
    completedAt: optionalNullableText(read(record, 'completedAt'), `${field}.completedAt`),
    narrativeLines: requiredTextArray(read(record, 'narrativeLines'), `${field}.narrativeLines`),
    participants: requiredArray(read(record, 'participants'), `${field}.participants`)
      .map((row, index) => mapCombatParticipant(row, `${field}.participants[${index}]`)),
    attacks: requiredArray(read(record, 'attacks'), `${field}.attacks`)
      .map((row, index) => mapCombatAttack(row, `${field}.attacks[${index}]`)),
  };
}

function mapCombatParticipant(row: JsonRecord, field: string): ReportCombatParticipantRow {
  return {
    heroId: optionalNullableText(read(row, 'heroId', 'hero_id'), `${field}.heroId`),
    side: requiredText(read(row, 'side'), `${field}.side`),
    sideLabel: requiredText(read(row, 'sideLabel'), `${field}.sideLabel`),
    participantKind: requiredText(read(row, 'participantKind'), `${field}.participantKind`),
    participantKindLabel: requiredText(read(row, 'participantKindLabel'), `${field}.participantKindLabel`),
    displayName: requiredText(read(row, 'displayName'), `${field}.displayName`),
    level: optionalNullableNumber(read(row, 'level'), `${field}.level`),
    healthStart: optionalNullableNumber(read(row, 'healthStart'), `${field}.healthStart`),
    healthEnd: optionalNullableNumber(read(row, 'healthEnd'), `${field}.healthEnd`),
    healthCurrent: optionalNullableNumber(read(row, 'healthCurrent'), `${field}.healthCurrent`),
    healthMax: optionalNullableNumber(read(row, 'healthMax'), `${field}.healthMax`),
    maxHealth: optionalNullableNumber(read(row, 'maxHealth'), `${field}.maxHealth`),
    defense: optionalNullableNumber(read(row, 'defense'), `${field}.defense`),
    minDamage: optionalNullableNumber(read(row, 'minDamage'), `${field}.minDamage`),
    maxDamage: optionalNullableNumber(read(row, 'maxDamage'), `${field}.maxDamage`),
    luck: optionalNullableNumber(read(row, 'luck'), `${field}.luck`),
    criticalChance: optionalNullableNumber(read(row, 'criticalChance'), `${field}.criticalChance`),
    criticalDamage: optionalNullableNumber(read(row, 'criticalDamage'), `${field}.criticalDamage`),
    evasionChance: optionalNullableNumber(read(row, 'evasionChance'), `${field}.evasionChance`),
    stats: optionalRecordArray(read(row, 'stats'), `${field}.stats`)
      .map((stat, index) => mapCombatParticipantStat(stat, `${field}.stats[${index}]`)),
    baseStatRows: requiredArray(read(row, 'baseStatRows'), `${field}.baseStatRows`)
      .map((stat, index) => mapCombatDisplayStatRow(stat, `${field}.baseStatRows[${index}]`)),
    combatStatRows: requiredArray(read(row, 'combatStatRows'), `${field}.combatStatRows`)
      .map((stat, index) => mapCombatDisplayStatRow(stat, `${field}.combatStatRows[${index}]`)),
  };
}

function mapCombatParticipantStat(
  row: JsonRecord,
  field: string,
): ReportCombatParticipantStatRow {
  return {
    statKey: requiredText(read(row, 'statKey'), `${field}.statKey`),
    statLabel: requiredText(read(row, 'statLabel'), `${field}.statLabel`),
    statValue: requiredNumber(read(row, 'statValue'), `${field}.statValue`),
  };
}

function mapCombatDisplayStatRow(
  row: JsonRecord,
  field: string,
): ReportCombatDisplayStatRow {
  return {
    statKey: optionalNullableText(read(row, 'statKey'), `${field}.statKey`) ?? undefined,
    key: optionalNullableText(read(row, 'key'), `${field}.key`) ?? undefined,
    label: optionalNullableText(read(row, 'label'), `${field}.label`) ?? undefined,
    statLabel: optionalNullableText(read(row, 'statLabel'), `${field}.statLabel`) ?? undefined,
    displayLabel: optionalNullableText(read(row, 'displayLabel'), `${field}.displayLabel`) ?? undefined,
    value: optionalStringOrNumber(read(row, 'value'), `${field}.value`) ?? undefined,
    statValue: optionalStringOrNumber(read(row, 'statValue'), `${field}.statValue`) ?? undefined,
    finalValue: optionalStringOrNumber(read(row, 'finalValue'), `${field}.finalValue`) ?? undefined,
    displayValue: optionalNullableText(read(row, 'displayValue'), `${field}.displayValue`) ?? undefined,
    tone: optionalNullableText(read(row, 'tone'), `${field}.tone`) ?? undefined,
    colorTone: optionalNullableText(read(row, 'colorTone'), `${field}.colorTone`) ?? undefined,
    colorableFinalValue: optionalNullableBoolean(
      read(row, 'colorableFinalValue'),
      `${field}.colorableFinalValue`,
    ) ?? undefined,
    sortOrder: optionalNullableNumber(read(row, 'sortOrder'), `${field}.sortOrder`) ?? undefined,
  };
}

function mapCombatAttack(row: JsonRecord, field: string): ReportCombatAttackRow {
  return {
    turnNumber: requiredNumber(read(row, 'turnNumber'), `${field}.turnNumber`),
    attackOrder: requiredNumber(read(row, 'attackOrder'), `${field}.attackOrder`),
    actorSide: requiredText(read(row, 'actorSide'), `${field}.actorSide`),
    actorSideLabel: requiredText(read(row, 'actorSideLabel'), `${field}.actorSideLabel`),
    targetSide: requiredText(read(row, 'targetSide'), `${field}.targetSide`),
    targetSideLabel: requiredText(read(row, 'targetSideLabel'), `${field}.targetSideLabel`),
    actorDisplayName: optionalNullableText(read(row, 'actorDisplayName'), `${field}.actorDisplayName`),
    targetDisplayName: optionalNullableText(read(row, 'targetDisplayName'), `${field}.targetDisplayName`),
    attackSlotIndex: optionalNullableNumber(read(row, 'attackSlotIndex'), `${field}.attackSlotIndex`),
    attackSourceKind: requiredText(read(row, 'attackSourceKind'), `${field}.attackSourceKind`),
    attackSourceKindLabel: requiredText(read(row, 'attackSourceKindLabel'), `${field}.attackSourceKindLabel`),
    attackSourceLabel: optionalNullableText(read(row, 'attackSourceLabel'), `${field}.attackSourceLabel`),
    sourceQualityKey: optionalNullableText(read(row, 'sourceQualityKey'), `${field}.sourceQualityKey`),
    timingHit: optionalNullableBoolean(read(row, 'timingHit'), `${field}.timingHit`),
    evaded: optionalNullableBoolean(read(row, 'evaded'), `${field}.evaded`),
    critical: optionalNullableBoolean(read(row, 'critical'), `${field}.critical`),
    criticalDamage: optionalNullableNumber(read(row, 'criticalDamage'), `${field}.criticalDamage`),
    rolledDamage: optionalNullableNumber(read(row, 'rolledDamage'), `${field}.rolledDamage`),
    finalDamage: optionalNullableNumber(read(row, 'finalDamage'), `${field}.finalDamage`),
    targetHealthBefore: optionalNullableNumber(read(row, 'targetHealthBefore'), `${field}.targetHealthBefore`),
    targetHealthAfter: optionalNullableNumber(read(row, 'targetHealthAfter'), `${field}.targetHealthAfter`),
    displayText: optionalNullableText(read(row, 'displayText'), `${field}.displayText`),
    eventLabel: optionalNullableText(read(row, 'eventLabel'), `${field}.eventLabel`),
    detailText: optionalNullableText(read(row, 'detailText'), `${field}.detailText`),
    summary: optionalNullableText(read(row, 'summary'), `${field}.summary`),
    damageDisplay: optionalNullableText(read(row, 'damageDisplay'), `${field}.damageDisplay`),
    resultDisplay: optionalNullableText(read(row, 'resultDisplay'), `${field}.resultDisplay`),
    presentationKind: optionalNullableText(read(row, 'presentationKind'), `${field}.presentationKind`),
    tone: optionalNullableText(read(row, 'tone'), `${field}.tone`),
    createdAt: optionalNullableText(read(row, 'createdAt'), `${field}.createdAt`),
  };
}
