import { FormulaAssignmentResolution } from '../domain/formula/formula.model';
import { CombatParticipantInput } from '../domain/combat/combat.model';
import { FormulaRuntimeService } from '../services/progression/formula-runtime';

export function combatFormulaContext(
  actor: CombatParticipantInput,
  target: CombatParticipantInput,
  extra: Record<string, number> = {},
): Record<string, number> {
  return {
    attackerStrength: baseStat(actor, 'strength'),
    attackerDexterity: baseStat(actor, 'dexterity'),
    attackerAgility: baseStat(actor, 'agility'),
    attackerCunning: baseStat(actor, 'cunning'),
    attackerLuck: actor.stats.luck,
    attackerDefense: actor.stats.defense,
    defenderAgility: baseStat(target, 'agility'),
    defenderLuck: target.stats.luck,
    defenderDefense: target.stats.defense,
    defenderEndurance: baseStat(target, 'endurance'),
    hitBonusFromItems: actor.formulaBonuses.hitBonusFromItems,
    critBonusFromItems: actor.formulaBonuses.critBonusFromItems,
    evasionBonusFromItems: target.formulaBonuses.evasionBonusFromItems,
    damageBonusFromItems: actor.formulaBonuses.damageBonusFromItems,
    ...extra,
  };
}

export function evaluateCombatFormula(
  runtime: FormulaRuntimeService,
  formula: FormulaAssignmentResolution,
  actor: CombatParticipantInput,
  target: CombatParticipantInput,
  extra: Record<string, number> = {},
): number {
  const result = runtime.evaluate(
    formula.formula.expression,
    combatFormulaContext(actor, target, extra),
    formula.target.allowedVariables,
  );

  if (result.error || result.value === null) {
    throw new Error(`${formula.target.label} formula is invalid: ${result.error ?? 'unknown error'}`);
  }

  return result.value;
}

export function baseStat(participant: CombatParticipantInput, statKey: string): number {
  return participant.baseStats.find((entry) => entry.statKey === statKey)?.statValue ?? 0;
}
