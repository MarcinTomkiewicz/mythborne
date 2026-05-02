import {
  COMBAT_SIDE,
  CombatAttackEvent,
  CombatSide,
} from '../domain/combat/combat.model';
import { CombatSandboxStepResolution } from '../domain/combat/combat-sandbox-step.model';
import {
  CombatEntryResult,
  CombatRoundEntry,
  CombatantSnapshot,
  SandboxCombatResult,
} from '../domain/combat/combat-sandbox.model';

export function toCombatSandboxLogEntries(
  attacks: readonly CombatAttackEvent[],
  hero: CombatantSnapshot,
  enemy: CombatantSnapshot,
  indicatorPosition: number,
): CombatRoundEntry[] {
  return toSandboxLogEntries(attacks, hero, enemy, indicatorPosition);
}

export function toCombatSandboxResultFromStep(
  step: CombatSandboxStepResolution,
  rounds: CombatRoundEntry[],
): SandboxCombatResult | null {
  if (!step.outcome) {
    return null;
  }

  return {
    outcome: step.outcome,
    winnerKey:
      step.outcome === 'draw'
        ? null
        : step.outcome === 'victory'
          ? 'hero'
          : 'enemy',
    loserKey:
      step.outcome === 'draw'
        ? null
        : step.outcome === 'victory'
          ? 'enemy'
          : 'hero',
    rounds,
    heroRemainingHealth: step.heroHealth,
    enemyRemainingHealth: step.enemyHealth,
    turnsPlayed: step.turnsPlayed,
  };
}

function toSandboxLogEntries(
  attacks: readonly CombatAttackEvent[],
  hero: CombatantSnapshot,
  enemy: CombatantSnapshot,
  indicatorPosition: number,
): CombatRoundEntry[] {
  return attacks.map((attack) => ({
    turn: attack.turnNumber,
    attackerKey: combatantKey(attack.actorSide),
    attackerName: attack.actorSide === COMBAT_SIDE.initiator ? hero.name : enemy.name,
    defenderKey: combatantKey(attack.targetSide),
    defenderName: attack.targetSide === COMBAT_SIDE.initiator ? hero.name : enemy.name,
    displayText: attack.displayText,
    attackSourceLabel: attack.source.label,
    indicatorPosition: timingIndicatorPosition(attack, indicatorPosition),
    hitWindowStart: 0,
    hitWindowEnd: 0,
    hitWindowWidth: 0,
    hitChance: 0,
    evasionChance: 0,
    criticalChance: 0,
    rawDamage: attack.rolledDamage ?? 0,
    damage: attack.finalDamage,
    defenderHealthAfter: attack.targetHealthAfter,
    wasCritical: attack.critical,
    wasDodged: attack.evaded,
    result: entryResult(attack),
  }));
}

function timingIndicatorPosition(
  attack: CombatAttackEvent,
  indicatorPosition: number,
): number | null {
  return attack.actorSide === COMBAT_SIDE.initiator &&
    attack.attackSlotIndex === 0 &&
    attack.timingHit !== null
    ? indicatorPosition
    : null;
}

function entryResult(attack: CombatAttackEvent): CombatEntryResult {
  if (attack.timingHit === false) {
    return 'miss';
  }

  if (attack.evaded) {
    return 'evaded';
  }

  return attack.critical ? 'critical' : 'hit';
}

function combatantKey(side: CombatSide): string {
  return side === COMBAT_SIDE.initiator ? 'hero' : 'enemy';
}
