import {
  COMBAT_ATTACK_SOURCE_KIND,
  CombatAttackPlan,
} from '../domain/combat/combat.model';
import {
  CombatOpponentAdminData,
  CombatOpponentAttackSourceReadModel,
  CombatOpponentDefinitionReadModel,
  ResolveCombatOpponentInput,
  ResolvedCombatOpponentEquipment,
} from '../domain/combat/combat-opponent.model';
import { CombatAttackSourcePlanInput } from '../domain/combat/combat-attack-plan.model';
import { buildCombatAttackPlan } from './combat-attack-plan';
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
  const sources: CombatAttackSourcePlanInput[] = [
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
  ];

  return buildCombatAttackPlan(
    side,
    sources,
    `Combat opponent "${opponentKey}" has no active natural attacks or materialized equipment attack sources.`,
  );
}
