import {
  CombatLiveEventReadModel,
  CombatLiveParticipantReadModel,
  CombatTimingManifestReadModel,
} from '../../../core/domain/combat/combat-live.model';
import {
  jsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
} from '../../../core/utils/json-read';

export interface CombatTimelineRow {
  id: string;
  title: string;
  meta: string;
  badges: string[];
  details: string[];
}

export function participantHpLabel(
  participant: CombatLiveParticipantReadModel,
): string {
  const current = participant.currentHp ?? 'N/D';
  const max = participant.maxHp ?? 'N/D';

  return `${current} / ${max}`;
}

export function combatEventMetaLabel(event: CombatLiveEventReadModel): string {
  return [
    `#${event.eventIndex}`,
    event.roundNumber === null ? null : `runda ${event.roundNumber}`,
    event.actionIndex === null ? null : `akcja ${event.actionIndex}`,
  ].filter(Boolean).join(' - ');
}

export function combatTimelineRows(
  events: CombatLiveEventReadModel[],
  participants: CombatLiveParticipantReadModel[],
): CombatTimelineRow[] {
  const participantsById = new Map(
    participants.map((participant) => [participant.participantId, participant]),
  );

  return events.map((event) => {
    const raw = jsonRecord(event.rawJson);
    const actor = combatEventParticipantLabel(
      raw,
      participantsById,
      event.actorParticipantId,
      [
        'actorDisplayName',
        'actor_display_name',
        'attackerDisplayName',
        'attacker_display_name',
        'actorName',
        'actor_name',
      ],
    );
    const target = combatEventParticipantLabel(
      raw,
      participantsById,
      event.targetParticipantId,
      [
        'targetDisplayName',
        'target_display_name',
        'defenderDisplayName',
        'defender_display_name',
        'targetName',
        'target_name',
      ],
    );
    const displayText = optionalText(read(raw, 'displayText', 'display_text', 'summary'));
    const finalDamage = optionalNumber(read(
      raw,
      'finalDamage',
      'final_damage',
      'damage',
      'damageAmount',
      'damage_amount',
    ));
    const rolledDamage = optionalNumber(read(raw, 'rolledDamage', 'rolled_damage'));
    const hpBefore = optionalNumber(read(
      raw,
      'targetHealthBefore',
      'target_health_before',
      'targetHpBefore',
      'target_hp_before',
    ));
    const hpAfter = optionalNumber(read(
      raw,
      'targetHealthAfter',
      'target_health_after',
      'targetHpAfter',
      'target_hp_after',
    ));
    const evaded = optionalBoolean(read(raw, 'evaded', 'wasEvaded', 'was_evaded'));
    const critical = optionalBoolean(read(raw, 'critical', 'wasCritical', 'was_critical'));
    const timingHit = optionalBoolean(read(raw, 'timingHit', 'timing_hit', 'hit'));
    const title = displayText
      ?? (actor && target ? `${actor} attacks ${target}` : event.label);
    const damageBadge = finalDamage !== null
      ? `Damage ${finalDamage}`
      : rolledDamage !== null
        ? `Rolled ${rolledDamage}`
        : null;
    const hpBadge = hpBefore !== null && hpAfter !== null
      ? `HP ${hpBefore} -> ${hpAfter}`
      : null;

    return {
      id: String(event.eventIndex),
      title,
      meta: combatEventMetaLabel(event),
      badges: [
        evaded === true ? 'Evaded' : null,
        evaded !== true && timingHit === true ? 'Hit' : null,
        evaded !== true && timingHit === false ? 'Miss' : null,
        critical === true ? 'Critical' : null,
        damageBadge,
        hpBadge,
      ].filter((badge): badge is string => badge !== null),
      details: event.details.filter((detail) => detail !== title),
    };
  });
}

export function combatTimingManifestLabel(
  manifest: CombatTimingManifestReadModel | null,
): string {
  if (!manifest) {
    return 'DB nie zwróciła manifestu timingu.';
  }

  const hitChance = manifest.hitChancePercent === null
    ? null
    : `szansa ${manifest.hitChancePercent}%`;
  const streak = manifest.streakBefore === null
    ? null
    : `seria ${manifest.streakBefore}`;
  const evasion = manifest.luckRng?.evasionChance === null ||
    manifest.luckRng?.evasionChance === undefined
    ? null
    : `unik ${manifest.luckRng.evasionChance}%`;
  const critical = manifest.luckRng?.criticalChance === null ||
    manifest.luckRng?.criticalChance === undefined
    ? null
    : `kryt ${manifest.luckRng.criticalChance}%`;

  const baseLabel = manifest.label
    ?? [
      `Strefa ${manifest.zoneStartPercent}-${manifest.zoneEndPercent}%`,
      hitChance,
      evasion,
      critical,
      streak,
    ].filter(Boolean).join(', ');

  return baseLabel;
}

export function explorationCombatRequestId(
  challengeAttemptId: string,
  scope = 'action',
): string {
  const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `exploration-combat:${scope}:${challengeAttemptId}:${randomId}`;
}

function combatEventParticipantLabel(
  raw: ReturnType<typeof jsonRecord>,
  participants: Map<string, CombatLiveParticipantReadModel>,
  participantId: string | null,
  rawNameKeys: string[],
): string | null {
  const rawName = optionalText(read(raw, ...rawNameKeys));

  if (rawName) {
    return rawName;
  }

  return participantId ? participants.get(participantId)?.displayName ?? null : null;
}
