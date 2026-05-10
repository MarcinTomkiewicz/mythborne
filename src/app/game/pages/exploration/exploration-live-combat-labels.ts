import {
  CombatLiveEventReadModel,
  CombatLiveParticipantReadModel,
  CombatTimingManifestReadModel,
} from '../../../core/domain/combat/combat-live.model';

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
