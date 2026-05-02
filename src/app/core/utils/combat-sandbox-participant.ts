import {
  COMBAT_ATTACK_SOURCE_KIND,
  COMBAT_PARTICIPANT_KIND,
  COMBAT_SIDE,
  CombatParticipantInput,
  CombatSide,
} from '../domain/combat/combat.model';
import { CombatantSnapshot } from '../domain/combat/combat-sandbox.model';
import { buildCombatAttackPlan } from './combat-attack-plan';

export function toCombatSandboxParticipant(
  side: CombatSide,
  combatant: CombatantSnapshot,
  heroId: string | null,
): CombatParticipantInput {
  return {
    side,
    displayName: combatant.name,
    level: combatant.level,
    reference: {
      participantKind: heroId ? COMBAT_PARTICIPANT_KIND.hero : COMBAT_PARTICIPANT_KIND.opponent,
      heroId,
      opponentDefinitionId: null,
    },
    stats: {
      maxHealth: combatant.derived.health,
      defense: combatant.derived.def,
      minDamage: combatant.derived.minDmg,
      maxDamage: combatant.derived.maxDmg,
      luck: combatant.derived.luck,
      criticalChance: combatant.derived.critical,
      criticalDamage: combatant.derived.criticalDamage,
      evasionChance: combatant.derived.evasion,
    },
    baseStats: Object.entries(combatant.baseStats).map(([statKey, statValue]) => ({
      side,
      statKey,
      statValue: Number(statValue ?? 0),
    })),
    formulaBonuses: {
      hitBonusFromItems: combatant.bonuses.hitBonusFromItems,
      critBonusFromItems: combatant.bonuses.critBonusFromItems,
      evasionBonusFromItems: combatant.bonuses.evasionBonusFromItems,
      damageBonusFromItems: combatant.bonuses.damageBonusFromItems,
    },
    attackPlan: buildCombatAttackPlan(side, [{
      source: {
        kind: COMBAT_ATTACK_SOURCE_KIND.unarmed,
        label: `${combatant.name} attack`,
        opponentAttackSourceId: null,
        sourceItemId: null,
        sourceBaseId: null,
        sourceQualityKey: null,
        sourcePrefixAffixId: null,
        sourceSuffixAffixId: null,
      },
    }], `Combat sandbox participant "${combatant.name}" has no attack source.`),
  };
}

export function combatantKey(side: CombatSide): string {
  return side === COMBAT_SIDE.initiator ? 'hero' : 'enemy';
}
