import {
  CombatAttackPlan,
  CombatAttackSlot,
  CombatSide,
} from '../domain/combat/combat.model';
import { CombatAttackSourcePlanInput } from '../domain/combat/combat-attack-plan.model';

export function buildCombatAttackPlan(
  side: CombatSide,
  sources: readonly CombatAttackSourcePlanInput[],
  emptyMessage: string,
): CombatAttackPlan {
  const slots: CombatAttackSlot[] = sources.flatMap(({ source, repeat = 1 }) =>
    Array.from({ length: Math.max(1, Math.floor(repeat)) }, (_, index) => ({
      side,
      slotIndex: 0,
      initiativeScore: 0,
      source: {
        ...source,
        label: repeat > 1 ? `${source.label} #${index + 1}` : source.label,
      },
    })),
  );

  if (slots.length === 0) {
    throw new Error(emptyMessage);
  }

  return {
    side,
    slots: slots.map((slot, index) => ({
      ...slot,
      slotIndex: index,
    })),
  };
}
