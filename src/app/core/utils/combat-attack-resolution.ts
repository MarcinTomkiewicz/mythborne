import {
  CombatAttackEvent,
  CombatAttackSlot,
  CombatAttackTimingInput,
  CombatFormulaRules,
  CombatParticipantInput,
} from '../domain/combat/combat.model';
import { FormulaRuntimeService } from '../services/progression/formula-runtime';
import { isInsideWalkingDeadZone, toWalkingDeadZone } from './combat-walking-dead';
import { evaluateCombatFormula } from './combat-formula-context';
import { toCombatAttackEvent } from './combat-result-snapshot';

export function resolveCombatAttack(input: {
  turnNumber: number;
  attackOrder: number;
  slot: CombatAttackSlot;
  actor: CombatParticipantInput;
  target: CombatParticipantInput;
  targetHealthBefore: number;
  timingInputs: readonly CombatAttackTimingInput[];
  rules: CombatFormulaRules;
  formulaRuntime: FormulaRuntimeService;
}): CombatAttackEvent {
  const timingInput = input.timingInputs.find(
    (entry) =>
      entry.turnNumber === input.turnNumber &&
      entry.side === input.slot.side &&
      entry.slotIndex === input.slot.slotIndex,
  );
  const timingHit = timingInput
    ? resolveTimingHit(timingInput, input.actor, input.target, input.rules, input.formulaRuntime)
    : null;

  if (timingHit === false) {
    return toCombatAttackEvent({
      ...input,
      timingHit,
      evaded: false,
      critical: false,
      rolledDamage: null,
      criticalDamage: null,
      finalDamage: 0,
      targetHealthAfter: input.targetHealthBefore,
      displayText: `${input.actor.displayName} misses ${input.target.displayName} with ${input.slot.source.label}.`,
    });
  }

  const evasionChance = evaluatePercent(
    input.formulaRuntime,
    input.rules.evasionChance,
    input.actor,
    input.target,
  );
  const evaded = Math.random() * 100 < evasionChance;

  if (evaded) {
    return toCombatAttackEvent({
      ...input,
      timingHit,
      evaded,
      critical: false,
      rolledDamage: null,
      criticalDamage: null,
      finalDamage: 0,
      targetHealthAfter: input.targetHealthBefore,
      displayText: `${input.target.displayName} evades ${input.actor.displayName}'s ${input.slot.source.label}.`,
    });
  }

  const criticalChance = evaluatePercent(
    input.formulaRuntime,
    input.rules.criticalChance,
    input.actor,
    input.target,
  );
  const critical = Math.random() * 100 < criticalChance;
  const rolledDamage = randomInt(input.actor.stats.minDamage, input.actor.stats.maxDamage);
  const critMultiplier = critical ? criticalMultiplier(input.actor) : 1;
  const criticalDamage = critical ? Math.round(rolledDamage * critMultiplier) : null;
  const finalDamage = Math.max(
    1,
    Math.round(evaluateCombatFormula(
      input.formulaRuntime,
      input.rules.finalDamage,
      input.actor,
      input.target,
      { rolledDamage, critMultiplier },
    )),
  );
  const targetHealthAfter = Math.max(0, input.targetHealthBefore - finalDamage);

  return toCombatAttackEvent({
    ...input,
    timingHit,
    evaded,
    critical,
    rolledDamage,
    criticalDamage,
    finalDamage,
    targetHealthAfter,
    displayText: `${input.actor.displayName} ${critical ? 'critically hits' : 'hits'} ${input.target.displayName} with ${input.slot.source.label} for ${finalDamage} damage.`,
  });
}

function resolveTimingHit(
  timingInput: CombatAttackTimingInput,
  actor: CombatParticipantInput,
  target: CombatParticipantInput,
  rules: CombatFormulaRules,
  formulaRuntime: FormulaRuntimeService,
): boolean {
  const width = evaluatePercent(formulaRuntime, rules.hitGreenZone, actor, target);
  const zone = toWalkingDeadZone(width, timingInput.streak ?? 0);

  return isInsideWalkingDeadZone(timingInput.indicatorPosition, zone.start, zone.end);
}

function evaluatePercent(
  formulaRuntime: FormulaRuntimeService,
  formula: Parameters<typeof evaluateCombatFormula>[1],
  actor: CombatParticipantInput,
  target: CombatParticipantInput,
): number {
  return Math.max(0, Math.min(100, evaluateCombatFormula(formulaRuntime, formula, actor, target)));
}

function criticalMultiplier(actor: CombatParticipantInput): number {
  return 1 + Math.max(0, actor.stats.criticalDamage) / 100;
}

function randomInt(min: number, max: number): number {
  const normalizedMin = Math.min(min, max);
  const normalizedMax = Math.max(min, max);
  return Math.floor(Math.random() * (normalizedMax - normalizedMin + 1)) + normalizedMin;
}
