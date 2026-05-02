import {
  COMBAT_ATTACK_SOURCE_KIND,
  COMBAT_OUTCOME,
  COMBAT_PARTICIPANT_KIND,
  COMBAT_SIDE,
  COMBAT_SOURCE_TYPE,
  CombatResolutionResult,
  combatOutcomeSides,
} from './combat.model';

describe('combat domain contracts', () => {
  it('maps canonical combat outcomes to winner and loser sides', () => {
    expect(combatOutcomeSides(COMBAT_OUTCOME.initiatorVictory)).toEqual({
      winnerSide: COMBAT_SIDE.initiator,
      loserSide: COMBAT_SIDE.defender,
    });
    expect(combatOutcomeSides(COMBAT_OUTCOME.defenderVictory)).toEqual({
      winnerSide: COMBAT_SIDE.defender,
      loserSide: COMBAT_SIDE.initiator,
    });
    expect(combatOutcomeSides(COMBAT_OUTCOME.draw)).toEqual({
      winnerSide: null,
      loserSide: null,
    });
  });

  it('can represent a relational combat result snapshot without caller consequences', () => {
    const sides = combatOutcomeSides(COMBAT_OUTCOME.initiatorVictory);
    const result = {
      source: {
        sourceType: COMBAT_SOURCE_TYPE.sandbox,
        sourceEntityId: 'sandbox-run-1',
        serverId: 'server-1',
        startedAt: '2026-05-02T10:00:00.000Z',
        completedAt: '2026-05-02T10:01:00.000Z',
      },
      outcome: COMBAT_OUTCOME.initiatorVictory,
      winnerSide: sides.winnerSide,
      loserSide: sides.loserSide,
      turnsCompleted: 1,
      initiatorHeroId: 'hero-1',
      defenderHeroId: null,
      participants: [
        {
          side: COMBAT_SIDE.initiator,
          displayName: 'Hero',
          level: 3,
          reference: {
            participantKind: COMBAT_PARTICIPANT_KIND.hero,
            heroId: 'hero-1',
            opponentDefinitionId: null,
          },
          stats: {
            maxHealth: 40,
            defense: 5,
            minDamage: 6,
            maxDamage: 9,
            luck: 4,
            criticalChance: 10,
            criticalDamage: 50,
            evasionChance: 8,
          },
          healthStart: 40,
          healthEnd: 40,
        },
        {
          side: COMBAT_SIDE.defender,
          displayName: 'Training Hoplite',
          level: 2,
          reference: {
            participantKind: COMBAT_PARTICIPANT_KIND.opponent,
            heroId: null,
            opponentDefinitionId: 'opponent-1',
          },
          stats: {
            maxHealth: 30,
            defense: 3,
            minDamage: 4,
            maxDamage: 7,
            luck: 2,
            criticalChance: 5,
            criticalDamage: 50,
            evasionChance: 4,
          },
          healthStart: 30,
          healthEnd: 21,
        },
      ],
      participantStats: [
        { side: COMBAT_SIDE.initiator, statKey: 'strength', statValue: 8 },
        { side: COMBAT_SIDE.defender, statKey: 'strength', statValue: 6 },
      ],
      attacks: [
        {
          turnNumber: 1,
          attackOrder: 1,
          attackSlotIndex: 0,
          actorSide: COMBAT_SIDE.initiator,
          targetSide: COMBAT_SIDE.defender,
          source: {
            kind: COMBAT_ATTACK_SOURCE_KIND.unarmed,
            label: 'Unarmed strike',
            opponentAttackSourceId: null,
            sourceItemId: null,
            sourceBaseId: null,
            sourceQualityKey: null,
            sourcePrefixAffixId: null,
            sourceSuffixAffixId: null,
          },
          timingHit: true,
          evaded: false,
          critical: false,
          rolledDamage: 8,
          criticalDamage: null,
          finalDamage: 9,
          targetHealthBefore: 30,
          targetHealthAfter: 21,
          displayText: 'Hero hits Training Hoplite for 9 damage.',
        },
      ],
    } satisfies CombatResolutionResult;

    expect(result.source.sourceType).toBe('sandbox');
    expect(result.outcome).toBe('initiator_victory');
    expect(result.participants.length).toBe(2);
    expect(result.attacks[0].source.kind).toBe('unarmed');
    expect(Object.hasOwn(result, 'rewardProfileId')).toBeFalse();
    expect(Object.hasOwn(result, 'trialDefinitionId')).toBeFalse();
  });
});
