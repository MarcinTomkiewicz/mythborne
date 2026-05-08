import { PvpSpyResult } from '../../../core/domain/pvp/pvp.model';
import { pvpSpyResultDisplay } from './pvp-spy-result-display';

describe('pvpSpyResultDisplay', () => {
  it('maps spy result snapshots into safe player-facing rows', () => {
    const display = pvpSpyResultDisplay(spyResult());

    expect(display.targetFacts).toEqual(jasmine.arrayContaining([
      { label: 'Target', value: 'Target Hero' },
      { label: 'Target level', value: '9' },
      { label: 'Target estate', value: 'Agora 12' },
    ]));
    expect(section(display.sections, 'Base stats').rows).toEqual([
      { label: 'Strength', value: '10' },
      { label: 'Agility', value: '7' },
    ]);
    expect(section(display.sections, 'Resources').rows).toEqual([
      { label: 'Drachma', value: '1000' },
      { label: 'Materials', value: '50' },
    ]);
    expect(section(display.sections, 'Equipment').rows).toEqual([
      { label: 'Weapon', value: 'Bronze Spear · Rare · Spear' },
    ]);
    expect(section(display.sections, 'Equipment').description)
      .toBe('Current equipment snapshot recorded by the DB spy result.');
    expect(section(display.sections, 'Buildings').rows).toEqual([
      { label: 'Entry 1', value: 'Forge · Level 3 · Active' },
    ]);
  });

  it('filters ids, admin metadata and active runtime internals from snapshot rows', () => {
    const display = pvpSpyResultDisplay(spyResult({
      snapshots: {
        baseStats: {
          strength: 10,
          hero_id: 'target-hero-1',
          admin_notes: 'staff-only',
        },
        resources: {
          drachma: 1000,
          userId: 'user-1',
          antiAbuseScore: 99,
        },
        equipment: [{
          item_id: 'item-1',
          slot: 'weapon',
          itemName: 'Bronze Spear',
          metadata_json: { requestId: 'request-1' },
        }],
        estate: {
          rank: 3,
          active_pvp_state: 'busy',
          runtime_activity_id: 'runtime-1',
        },
        buildings: [{
          building_id: 'building-1',
          buildingName: 'Forge',
          level: 3,
          owner_user_id: 'user-1',
        }],
        derivedCombatStats: {
          heroDerivedUsed: false,
        },
      },
    }));
    const serialized = JSON.stringify(display);

    expect(serialized).toContain('Strength');
    expect(serialized).toContain('Drachma');
    expect(serialized).toContain('Bronze Spear');
    expect(serialized).toContain('Forge');
    expect(serialized).not.toContain('target-hero-1');
    expect(serialized).not.toContain('staff-only');
    expect(serialized).not.toContain('antiAbuseScore');
    expect(serialized).not.toContain('runtime-1');
    expect(serialized).not.toContain('request-1');
    expect(serialized).not.toContain('heroDerivedUsed');
  });

  it('does not render raw nested JSON when a snapshot shape is not display-safe', () => {
    const display = pvpSpyResultDisplay(spyResult({
      snapshots: {
        ...spyResult().snapshots,
        estate: {
          estateName: 'Courtyard',
          nested: { raw: true },
          list: ['raw'],
        },
      },
    }));

    expect(section(display.sections, 'Estate').rows).toEqual([
      { label: 'Estate name', value: 'Courtyard' },
    ]);
  });
});

function section(
  sections: ReturnType<typeof pvpSpyResultDisplay>['sections'],
  title: string,
) {
  const match = sections.find((item) => item.title === title);
  if (!match) {
    throw new Error(`Missing section ${title}.`);
  }
  return match;
}

function spyResult(overrides: Partial<PvpSpyResult> = {}): PvpSpyResult {
  return {
    spyResultId: 'spy-result-1',
    pvpActionId: 'pvp-action-1',
    serverId: 'server-1',
    createdAt: '2026-05-06T12:00:00Z',
    spyHeroId: 'active-hero-1',
    spyLevelSnapshot: 10,
    targetHeroId: 'target-hero-1',
    targetDisplayName: 'Target Hero',
    targetLevelSnapshot: 9,
    targetAddress: 'Agora 12',
    visibilityKey: 'private',
    resultSummary: 'Spy succeeded.',
    snapshots: {
      baseStats: {
        strength: 10,
        agility: 7,
      },
      resources: {
        drachma: 1000,
        materials: 50,
      },
      equipment: [{
        slot: 'weapon',
        itemName: 'Bronze Spear',
        qualityLabel: 'Rare',
        typeLabel: 'Spear',
      }],
      estate: {
        rank: 3,
      },
      buildings: [{
        buildingName: 'Forge',
        level: 3,
        status: 'Active',
      }],
      derivedCombatStats: {},
    },
    ...overrides,
  };
}
