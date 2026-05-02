import {
  COMBAT_OUTCOME,
  COMBAT_SIDE,
  CombatAttackEvent,
  CombatAttackSlot,
  CombatFormulaRules,
  CombatOutcome,
  CombatParticipantInput,
  CombatResolutionInput,
  CombatResolutionResult,
  CombatSide,
} from '../domain/combat/combat.model';
import { FormulaRuntimeService } from '../services/progression/formula-runtime';
import { resolveCombatAttack } from './combat-attack-resolution';
import { toCombatResolutionResult } from './combat-result-snapshot';

export function resolveCombatTurns(input: {
  combat: CombatResolutionInput;
  turnLimit: number;
  rules: CombatFormulaRules;
  orderedSlots: readonly CombatAttackSlot[];
  formulaRuntime: FormulaRuntimeService;
}): CombatResolutionResult {
  const health = new Map<CombatSide, number>([
    [COMBAT_SIDE.initiator, input.combat.initiator.stats.maxHealth],
    [COMBAT_SIDE.defender, input.combat.defender.stats.maxHealth],
  ]);
  const attacks: CombatAttackEvent[] = [];
  let outcome: CombatOutcome = COMBAT_OUTCOME.draw;
  let turnsCompleted = 0;

  for (let turn = 1; turn <= input.turnLimit; turn += 1) {
    turnsCompleted = turn;

    for (const slot of input.orderedSlots) {
      const actor = participantFor(input.combat, slot.side);
      const target = opponentFor(input.combat, slot.side);

      if ((health.get(actor.side) ?? 0) <= 0 || (health.get(target.side) ?? 0) <= 0) {
        continue;
      }

      const event = resolveCombatAttack({
        turnNumber: turn,
        attackOrder: attacks.length + 1,
        slot,
        actor,
        target,
        targetHealthBefore: health.get(target.side) ?? 0,
        timingInputs: input.combat.timingInputs ?? [],
        rules: input.rules,
        formulaRuntime: input.formulaRuntime,
      });

      attacks.push(event);
      health.set(target.side, event.targetHealthAfter);

      if (event.targetHealthAfter <= 0) {
        outcome = target.side === COMBAT_SIDE.defender
          ? COMBAT_OUTCOME.initiatorVictory
          : COMBAT_OUTCOME.defenderVictory;
        return toCombatResolutionResult(input.combat, outcome, turnsCompleted, health, attacks);
      }
    }
  }

  return toCombatResolutionResult(input.combat, outcome, turnsCompleted, health, attacks);
}

function participantFor(input: CombatResolutionInput, side: CombatSide): CombatParticipantInput {
  return side === COMBAT_SIDE.initiator ? input.initiator : input.defender;
}

function opponentFor(input: CombatResolutionInput, side: CombatSide): CombatParticipantInput {
  return side === COMBAT_SIDE.initiator ? input.defender : input.initiator;
}
