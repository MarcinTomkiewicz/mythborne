import { PvpAttackResult } from '../../../core/domain/pvp/pvp.model';
import { pvpAttackResultDisplay } from './pvp-attack-result-display';

describe('pvpAttackResultDisplay', () => {
  it('maps attack outcome, resource, reward and prestige contexts', () => {
    const display = pvpAttackResultDisplay(attackResult());

    expect(display.summaryFacts).toEqual(jasmine.arrayContaining([
      { label: 'Outcome', value: 'Attacker victory' },
      { label: 'Winner', value: 'Attacker' },
      { label: 'Level difference', value: 'Attacker +1' },
    ]));
    expect(display.combatantFacts).toEqual([
      { label: 'Attacker', value: 'Attacker level 10 - winner' },
      { label: 'Defender', value: 'Defender level 9 - loser' },
    ]);
    expect(display.boundaryNotes).toEqual([
      'Equipment is part of DB/runtime combat resolution and is not shown as a PvP reward.',
      'Ordinary PvP attacks do not transfer, steal or destroy items.',
    ]);
    expect(section(display.sections, 'Resources').rows).toEqual([
      { label: 'Drachma', value: '+120' },
      { label: 'Materials', value: '-20' },
      { label: 'Workforce', value: '0' },
    ]);
    expect(section(display.sections, 'XP and rewards').rows).toEqual([
      { label: 'XP', value: '+25' },
    ]);
    expect(section(display.sections, 'Prestige').rows).toEqual([
      {
        label: 'Future Prestige context',
        value: 'Recorded for future processing',
      },
    ]);
  });

  it('does not render raw JSON, ids, notification context or non-PvP consequence keys', () => {
    const display = pvpAttackResultDisplay(attackResult({
      resourceOutcome: {
        raw: {
          drachmaDelta: 120,
          itemTransfer: 'item-1',
          buildingTransfer: 'forge',
          estateTransfer: 'estate-1',
          characterPointsDelta: 5,
          metadataJson: { requestId: 'request-1' },
        },
      },
      rewardContext: {
        raw: {
          xp: 25,
          itemRewardId: 'item-2',
          characterPoints: 3,
        },
      },
      prestigeContext: {
        prestigeDelta: 1,
        future: true,
        adminNotes: 'staff-only',
      },
      notificationContext: {
        raw: {
          actionUrl: '/game/vicinity/attack-results/attack-result-1',
          notificationType: 'pvp.attack.completed',
        },
      },
    }));
    const serialized = JSON.stringify(display);

    expect(serialized).toContain('Drachma');
    expect(serialized).toContain('XP');
    expect(serialized).toContain('Future Prestige context');
    expect(serialized).not.toContain('item-1');
    expect(serialized).not.toContain('forge');
    expect(serialized).not.toContain('estate-1');
    expect(serialized).not.toContain('characterPoints');
    expect(serialized).not.toContain('Prestige delta');
    expect(serialized).not.toContain('projected');
    expect(section(display.sections, 'Prestige').rows).not.toContain(jasmine.objectContaining({
      value: '+1',
    }));
    expect(serialized).not.toContain('request-1');
    expect(serialized).not.toContain('pvp.attack.completed');
    expect(serialized).not.toContain('attack-result-1');
  });

  it('uses empty sections for unsupported context shapes instead of raw previews', () => {
    const display = pvpAttackResultDisplay(attackResult({
      resourceOutcome: { raw: { nested: { drachmaDelta: 120 } } },
      rewardContext: { raw: ['xp', 25] },
      prestigeContext: { futureDetails: { prestigeDelta: 1 } },
      reportContext: { raw: {} },
    }));

    expect(section(display.sections, 'Resources').rows).toEqual([]);
    expect(section(display.sections, 'XP and rewards').rows).toEqual([]);
    expect(section(display.sections, 'Prestige').rows).toEqual([]);
  });
});

function section(
  sections: ReturnType<typeof pvpAttackResultDisplay>['sections'],
  title: string,
) {
  const match = sections.find((item) => item.title === title);
  if (!match) {
    throw new Error(`Missing section ${title}.`);
  }
  return match;
}

function attackResult(overrides: Partial<PvpAttackResult> = {}): PvpAttackResult {
  return {
    attackResultId: 'attack-result-1',
    pvpActionId: 'pvp-action-1',
    serverId: 'server-1',
    createdAt: '2026-05-06T12:00:00Z',
    attacker: {
      heroId: 'active-hero-1',
      levelSnapshot: 10,
    },
    defender: {
      heroId: 'target-hero-1',
      levelSnapshot: 9,
    },
    combatResultId: 'combat-result-1',
    combatOutcome: 'initiator_victory',
    outcomeKey: 'attacker_won',
    outcomeLabel: 'Attacker victory',
    winnerHeroId: 'active-hero-1',
    loserHeroId: 'target-hero-1',
    levelDifference: 1,
    resourceOutcome: {
      raw: {
        drachmaDelta: 120,
        materialsDelta: -20,
        workforceDelta: 0,
      },
    },
    rewardContext: { raw: { xp: 25 } },
    prestigeContext: {
      prestigeDelta: 1,
      future: true,
    },
    reportContext: { raw: { reportId: 'report-1' } },
    notificationContext: { raw: { notificationType: 'pvp.attack.completed' } },
    ...overrides,
  };
}
