import {
  COMBAT_ATTACK_SOURCE_KIND,
  COMBAT_PARTICIPANT_KIND,
  CombatParticipantInput,
} from '../domain/combat/combat.model';
import { combatFormulaContext } from './combat-formula-context';

describe('combatFormulaContext', () => {
  it('exposes the expected combat formula target variables', () => {
    const context = combatFormulaContext(
      participant({
        strength: 11,
        dexterity: 12,
        agility: 13,
        cunning: 14,
        luck: 15,
        defense: 16,
        hitBonusFromItems: 2,
        critBonusFromItems: 3,
        damageBonusFromItems: 4,
      }),
      participant({
        agility: 21,
        endurance: 22,
        luck: 23,
        defense: 24,
        evasionBonusFromItems: 5,
      }),
      {
        rolledDamage: 7,
        critMultiplier: 1.5,
      },
    );

    expect(Object.keys(context).sort()).toEqual([
      'attackerStrength',
      'attackerDexterity',
      'attackerAgility',
      'attackerCunning',
      'attackerLuck',
      'attackerDefense',
      'defenderAgility',
      'defenderLuck',
      'defenderDefense',
      'defenderEndurance',
      'hitBonusFromItems',
      'critBonusFromItems',
      'evasionBonusFromItems',
      'damageBonusFromItems',
      'rolledDamage',
      'critMultiplier',
    ].sort());
    expect(context).toEqual(jasmine.objectContaining({
      attackerStrength: 11,
      attackerDexterity: 12,
      attackerAgility: 13,
      attackerCunning: 14,
      attackerLuck: 15,
      attackerDefense: 16,
      defenderAgility: 21,
      defenderLuck: 23,
      defenderDefense: 24,
      defenderEndurance: 22,
      hitBonusFromItems: 2,
      critBonusFromItems: 3,
      evasionBonusFromItems: 5,
      damageBonusFromItems: 4,
      rolledDamage: 7,
      critMultiplier: 1.5,
    }));
  });
});

function participant(values: {
  strength?: number;
  dexterity?: number;
  agility?: number;
  cunning?: number;
  endurance?: number;
  luck?: number;
  defense?: number;
  hitBonusFromItems?: number;
  critBonusFromItems?: number;
  evasionBonusFromItems?: number;
  damageBonusFromItems?: number;
}): CombatParticipantInput {
  const side = 'initiator';

  return {
    side,
    displayName: 'Participant',
    level: 1,
    reference: {
      participantKind: COMBAT_PARTICIPANT_KIND.hero,
      heroId: 'hero-1',
      opponentDefinitionId: null,
    },
    stats: {
      maxHealth: 30,
      defense: values.defense ?? 0,
      minDamage: 1,
      maxDamage: 2,
      luck: values.luck ?? 0,
      criticalChance: 0,
      criticalDamage: 50,
      evasionChance: 0,
    },
    baseStats: [
      { side, statKey: 'strength', statValue: values.strength ?? 0 },
      { side, statKey: 'dexterity', statValue: values.dexterity ?? 0 },
      { side, statKey: 'endurance', statValue: values.endurance ?? 0 },
      { side, statKey: 'agility', statValue: values.agility ?? 0 },
      { side, statKey: 'cunning', statValue: values.cunning ?? 0 },
    ],
    formulaBonuses: {
      hitBonusFromItems: values.hitBonusFromItems ?? 0,
      critBonusFromItems: values.critBonusFromItems ?? 0,
      evasionBonusFromItems: values.evasionBonusFromItems ?? 0,
      damageBonusFromItems: values.damageBonusFromItems ?? 0,
    },
    attackPlan: {
      side,
      slots: [{
        side,
        slotIndex: 0,
        initiativeScore: 0,
        source: {
          kind: COMBAT_ATTACK_SOURCE_KIND.unarmed,
          label: 'Unarmed',
          opponentAttackSourceId: null,
          sourceItemId: null,
          sourceBaseId: null,
          sourceQualityKey: null,
          sourcePrefixAffixId: null,
          sourceSuffixAffixId: null,
        },
      }],
    },
  };
}
