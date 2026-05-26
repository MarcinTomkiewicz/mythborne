import {
  CombatDisplayLogGroup,
  CombatDisplayLogRow,
  CombatDisplayParticipant,
  CombatDisplayValueTone,
} from '../domain/combat/combat-display.model';
import {
  CombatLiveEventReadModel,
  CombatLiveParticipantReadModel,
  CombatResultDetailReadModel,
} from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import {
  jsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
} from './json-read';
import { formatCombatLogResultLabel } from './combat-log-display-text';
import { combatReportAttacksJson } from './combat-report-text.mapper';

interface CombatAttackSnapshotRow {
  id: string;
  groupId: string;
  groupLabel: string;
  actorLabel: string;
  targetLabel: string | null;
  attackSourceLabel: string | null;
  displayText: string | null;
  detailText: string | null;
  damageDisplay: string | null;
  timingHit: boolean | null;
  evaded: boolean | null;
  critical: boolean | null;
  finalDamage: number | null;
}

type AttackOutcome = 'critical' | 'damage' | 'miss' | 'evade' | 'unknown';

export function mapCompletedCombatLogGroups(input: {
  detail: CombatResultDetailReadModel | null;
  liveEvents: readonly CombatLiveEventReadModel[];
  liveParticipants: readonly CombatLiveParticipantReadModel[];
  displayParticipants: readonly CombatDisplayParticipant[];
  liveEventMapper: (
    events: CombatLiveEventReadModel[],
    participants: CombatLiveParticipantReadModel[],
  ) => CombatDisplayLogGroup[];
}): CombatDisplayLogGroup[] {
  const eventGroups = input.liveEventMapper(
    [...input.liveEvents],
    [...input.liveParticipants],
  );

  return eventGroups.length
    ? eventGroups
    : mapCombatReportAttackLogGroups({
        attacksJson: combatReportAttacksJson({
          rawJson: input.detail?.rawJson,
          attacksJson: input.detail?.attacks,
        }),
        participants: input.displayParticipants,
      });
}

export function mapCombatReportAttackLogGroups(input: {
  attacksJson: Json | undefined;
  participants: readonly CombatDisplayParticipant[];
}): CombatDisplayLogGroup[] {
  const groups = new Map<string, CombatDisplayLogRow[]>();
  const labels = new Map<string, string>();

  for (const attack of attackSnapshotRows(input.attacksJson, input.participants)) {
    const row = attackLogRow(attack);

    if (!row) {
      continue;
    }

    labels.set(attack.groupId, attack.groupLabel);
    groups.set(attack.groupId, [...(groups.get(attack.groupId) ?? []), row]);
  }

  return Array.from(groups.entries()).map(([id, rows]) => ({
    id,
    label: labels.get(id) ?? 'Runda',
    rows,
  }));
}

function attackSnapshotRows(
  value: Json | undefined,
  participants: readonly CombatDisplayParticipant[],
): CombatAttackSnapshotRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry, index) => {
    const row = jsonRecord(entry);

    if (!row) {
      return [];
    }

    const actorSide = optionalText(read(row, 'actorSide', 'actor_side'));
    const targetSide = optionalText(read(row, 'targetSide', 'target_side'));
    const round = optionalNumber(read(row, 'roundNumber', 'round_number', 'turnNumber', 'turn_number'));
    const action = optionalNumber(read(row, 'actionIndex', 'action_index', 'attackOrder', 'attack_order'));
    const groupId = round === null ? 'unknown' : String(round);
    const groupLabel = round === null ? 'Runda' : `Runda ${round}`;

    return [{
      id: `${index}`,
      groupId,
      groupLabel: action !== null && groupId === 'unknown' ? `Akcja ${action}` : groupLabel,
      actorLabel: optionalText(read(
        row,
        'actorDisplayName',
        'actor_display_name',
        'attackerDisplayName',
        'attacker_display_name',
        'actorName',
        'actor_name',
      )) ?? participantNameForSide(participants, actorSide) ?? 'Walka',
      targetLabel: optionalText(read(
        row,
        'targetDisplayName',
        'target_display_name',
        'defenderDisplayName',
        'defender_display_name',
        'targetName',
        'target_name',
      )) ?? participantNameForSide(participants, targetSide),
      attackSourceLabel: activeLogAttackSourceLabel(optionalText(read(
        row,
        'attackSourceLabel',
        'attack_source_label',
        'sourceLabel',
        'source_label',
      ))),
      displayText: optionalText(read(row, 'displayText', 'display_text', 'summary')),
      detailText: optionalText(read(row, 'detailText', 'detail_text')),
      damageDisplay: optionalText(read(row, 'damageDisplay', 'damage_display')),
      timingHit: optionalBoolean(read(row, 'timingHit', 'timing_hit', 'hit')),
      evaded: optionalBoolean(read(row, 'evaded', 'wasEvaded', 'was_evaded')),
      critical: optionalBoolean(read(row, 'critical', 'wasCritical', 'was_critical')),
      finalDamage: optionalNumber(read(row, 'finalDamage', 'final_damage', 'damage', 'damageAmount', 'damage_amount')),
    }];
  });
}

function attackLogRow(attack: CombatAttackSnapshotRow): CombatDisplayLogRow | null {
  const outcome = attackOutcome(attack);
  const body = attackBody(attack, outcome);

  if (!body) {
    return null;
  }

  return {
    id: attack.id,
    actorLabel: attack.actorLabel,
    bodyPrefix: body.prefix,
    attackSourceLabel: body.attackSourceLabel,
    bodySuffix: body.suffix,
    detailLines: [attack.detailText].filter((line): line is string =>
      Boolean(line && line !== body.text && line !== attack.displayText),
    ),
    resultLabel: attackResultLabel(attack, outcome),
    tone: attackTone(outcome),
  };
}

function participantNameForSide(
  participants: readonly CombatDisplayParticipant[],
  side: string | null,
): string | null {
  if (!side) {
    return null;
  }

  return participants.find((participant) => participant.side === side)?.displayName ?? null;
}

function attackOutcome(attack: CombatAttackSnapshotRow): AttackOutcome {
  if (attack.evaded === true) {
    return 'evade';
  }

  if (attack.timingHit === false) {
    return 'miss';
  }

  if (attack.critical === true) {
    return 'critical';
  }

  if (attack.timingHit === true || attack.finalDamage !== null || attack.damageDisplay) {
    return 'damage';
  }

  return 'unknown';
}

function attackBody(
  attack: CombatAttackSnapshotRow,
  outcome: AttackOutcome,
): { prefix: string; attackSourceLabel: string | null; suffix: string; text: string } | null {
  if (!attack.targetLabel || !attack.attackSourceLabel) {
    return attack.displayText
      ? {
          prefix: removeActorPrefix(attack.displayText, attack.actorLabel),
          attackSourceLabel: null,
          suffix: '',
          text: removeActorPrefix(attack.displayText, attack.actorLabel),
        }
      : null;
  }

  const prefix = attack.attackSourceLabel === 'gołymi rękami'
    ? `atakuje ${attack.targetLabel} `
    : `atakuje ${attack.targetLabel} przy użyciu: `;
  const suffix = attackSuffix(outcome);

  return {
    prefix,
    attackSourceLabel: attack.attackSourceLabel,
    suffix,
    text: `${prefix}${attack.attackSourceLabel}${suffix}`,
  };
}

function attackSuffix(outcome: AttackOutcome): string {
  switch (outcome) {
    case 'critical':
      return ' i trafia krytycznie.';
    case 'damage':
      return ' i trafia.';
    case 'miss':
    case 'evade':
      return '.';
    default:
      return '.';
  }
}

function attackResultLabel(
  attack: CombatAttackSnapshotRow,
  outcome: AttackOutcome,
): string | null {
  if (outcome === 'miss') {
    return 'chybił';
  }

  if (outcome === 'evade') {
    return 'unik';
  }

  const display = attack.damageDisplay
    ?? (attack.finalDamage !== null ? `${attack.finalDamage} obrażeń` : null);

  return display ? formatCombatLogResultLabel(display) : null;
}

function attackTone(outcome: AttackOutcome): CombatDisplayValueTone {
  switch (outcome) {
    case 'critical':
      return 'danger';
    case 'miss':
    case 'evade':
      return 'info';
    case 'damage':
      return 'golden';
    default:
      return 'muted';
  }
}

function activeLogAttackSourceLabel(value: string | null): string | null {
  const text = value?.trim();

  if (!text) {
    return null;
  }

  return text.toLowerCase() === 'unarmed'
    ? 'gołymi rękami'
    : text;
}

function removeActorPrefix(text: string, actorLabel: string): string {
  return text.startsWith(actorLabel)
    ? text.slice(actorLabel.length).trim() || text
    : text;
}
