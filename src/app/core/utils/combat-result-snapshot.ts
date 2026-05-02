import {
  COMBAT_SIDE,
  CombatAttackEvent,
  CombatAttackSlot,
  CombatOutcome,
  CombatParticipantInput,
  CombatParticipantSnapshot,
  CombatResolutionInput,
  CombatResolutionResult,
  CombatSide,
  combatOutcomeSides,
} from '../domain/combat/combat.model';

export function toCombatResolutionResult(
  input: CombatResolutionInput,
  outcome: CombatOutcome,
  turnsCompleted: number,
  health: ReadonlyMap<CombatSide, number>,
  attacks: readonly CombatAttackEvent[],
): CombatResolutionResult {
  const sides = combatOutcomeSides(outcome);

  return {
    source: {
      ...input.source,
      completedAt: input.source.completedAt ?? new Date().toISOString(),
    },
    outcome,
    winnerSide: sides.winnerSide,
    loserSide: sides.loserSide,
    turnsCompleted,
    initiatorHeroId: input.initiator.reference.heroId,
    defenderHeroId: input.defender.reference.heroId,
    participants: [
      toParticipantSnapshot(input.initiator, health.get(COMBAT_SIDE.initiator) ?? 0),
      toParticipantSnapshot(input.defender, health.get(COMBAT_SIDE.defender) ?? 0),
    ],
    participantStats: [
      ...input.initiator.baseStats,
      ...input.defender.baseStats,
    ],
    attacks,
  };
}

export function toCombatAttackEvent(input: {
  turnNumber: number;
  attackOrder: number;
  slot: CombatAttackSlot;
  actor: CombatParticipantInput;
  target: CombatParticipantInput;
  timingHit: boolean | null;
  evaded: boolean;
  critical: boolean;
  rolledDamage: number | null;
  criticalDamage: number | null;
  finalDamage: number;
  targetHealthBefore: number;
  targetHealthAfter: number;
  displayText: string;
}): CombatAttackEvent {
  return {
    turnNumber: input.turnNumber,
    attackOrder: input.attackOrder,
    attackSlotIndex: input.slot.slotIndex,
    actorSide: input.actor.side,
    targetSide: input.target.side,
    source: input.slot.source,
    timingHit: input.timingHit,
    evaded: input.evaded,
    critical: input.critical,
    rolledDamage: input.rolledDamage,
    criticalDamage: input.criticalDamage,
    finalDamage: input.finalDamage,
    targetHealthBefore: input.targetHealthBefore,
    targetHealthAfter: input.targetHealthAfter,
    displayText: input.displayText,
  };
}

function toParticipantSnapshot(
  participant: CombatParticipantInput,
  healthEnd: number,
): CombatParticipantSnapshot {
  return {
    side: participant.side,
    displayName: participant.displayName,
    level: participant.level,
    reference: participant.reference,
    stats: participant.stats,
    healthStart: participant.stats.maxHealth,
    healthEnd,
  };
}
