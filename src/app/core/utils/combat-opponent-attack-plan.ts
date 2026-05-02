import {
  COMBAT_ATTACK_SOURCE_KIND,
  CombatAttackPlan,
  CombatAttackSlot,
} from '../domain/combat/combat.model';
import {
  CombatOpponentAdminData,
  CombatOpponentAttackSourceReadModel,
  CombatOpponentDefinitionReadModel,
  ResolveCombatOpponentInput,
  ResolvedCombatOpponentEquipment,
} from '../domain/combat/combat-opponent.model';
import { isLevelInRange } from './combat-opponent-range';

export function naturalAttacksFor(
  data: CombatOpponentAdminData,
  opponent: CombatOpponentDefinitionReadModel,
  level: number,
): CombatOpponentAttackSourceReadModel[] {
  return data.attackSources.filter(
    (entry) =>
      entry.opponentDefinitionId === opponent.id &&
      entry.isActive &&
      isLevelInRange(level, entry.minOpponentLevel, entry.maxOpponentLevel),
  );
}

export function attackPlanFor(
  opponentKey: string,
  side: ResolveCombatOpponentInput['side'],
  naturalAttacks: CombatOpponentAttackSourceReadModel[],
  equipment: ResolvedCombatOpponentEquipment[],
): CombatAttackPlan {
  const slots: CombatAttackSlot[] = [
    ...naturalAttacks.map((attack) => ({
      source: {
        kind: COMBAT_ATTACK_SOURCE_KIND.natural,
        label: attack.label,
        opponentAttackSourceId: attack.id,
        sourceItemId: null,
        sourceBaseId: null,
        sourceQualityKey: null,
        sourcePrefixAffixId: null,
        sourceSuffixAffixId: null,
      },
      repeat: attack.attackCount,
    })),
    ...equipment.map((entry) => ({
      source: entry.source,
      repeat: 1,
    })),
  ].flatMap(({ source, repeat }) =>
    Array.from({ length: Math.max(1, repeat) }, (_, index) => ({
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
    throw new Error(
      `Combat opponent "${opponentKey}" has no active natural attacks or materialized equipment attack sources.`,
    );
  }

  return {
    side,
    slots: slots.map((slot, index) => ({
      ...slot,
      slotIndex: index,
    })),
  };
}
