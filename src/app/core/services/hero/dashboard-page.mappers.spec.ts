import {
  mapDashboardBaseStatRows,
  mapDashboardDerivedDisplay,
  mapDashboardDerivedStatRows,
  mapDashboardHealthDisplay,
} from './dashboard-page.mappers';
import { HeroDashboardRuntimeStatsReadModel } from './hero-dashboard-runtime-stats';

describe('dashboard page mappers', () => {
  const runtimeStats: HeroDashboardRuntimeStatsReadModel = {
    heroId: 'hero-1',
    damageRows: [
      { key: 'main_hand', label: 'Demonic Dagger', displayValue: '21-28' },
      { key: 'off_hand', label: 'Unarmed', displayValue: '20-21' },
    ],
    stats: {
      strength: 19,
      dexterity: 6,
    },
    defense: 104,
    currentHealth: 84,
    maxHealth: 120,
    luck: 3,
    criticalChanceBonus: 2,
    criticalDamage: 50,
    evasionChanceBonus: 8,
    attackCount: 2,
    attackPlanJson: {},
    sourceJson: {},
    statsJson: {},
  };

  it('pairs DB stat labels with runtime stat values and omits missing runtime values', () => {
    expect(
      mapDashboardBaseStatRows(
        [
          {
            id: 'stat-strength',
            key: 'strength',
            label: 'Strength',
            order: 1,
            description: null,
          },
          {
            id: 'stat-vitality',
            key: 'vitality',
            label: 'Vitality',
            order: 2,
            description: null,
          },
        ],
        runtimeStats.stats,
      ),
    ).toEqual([{ key: 'strength', label: 'Strength', value: 19 }]);
  });

  it('maps runtime stats to the legacy dashboard derived display contract', () => {
    expect(mapDashboardDerivedDisplay(runtimeStats)).toEqual({
      health: 120,
      def: 104,
      minDmg: 0,
      maxDmg: 0,
      luck: 3,
      critical: 2,
      criticalDamage: 50,
      evasion: 8,
    });
  });

  it('maps dashboard health display from DB-returned current and max health', () => {
    expect(mapDashboardHealthDisplay(runtimeStats)).toEqual({
      currentHealth: 84,
      maxHealth: 120,
    });
  });

  it('maps player-safe derived stat rows from the runtime read model', () => {
    expect(mapDashboardDerivedStatRows(runtimeStats)).toEqual([
      { key: 'damage-main_hand', label: 'Demonic Dagger', value: '21-28' },
      { key: 'damage-off_hand', label: 'Unarmed', value: '20-21' },
      { key: 'defense', label: 'Defense', value: 104 },
      { key: 'luck', label: 'Luck', value: 3 },
      { key: 'critical_chance', label: 'Critical chance', value: '2%' },
      { key: 'critical_damage', label: 'Critical damage', value: '50%' },
      { key: 'evasion', label: 'Evasion', value: '8%' },
      { key: 'attack_count', label: 'Attack count', value: 2 },
    ]);
  });

  it('omits derived stat rows when runtime stats are unavailable', () => {
    expect(mapDashboardDerivedStatRows(null)).toEqual([]);
  });

  it('omits damage when the runtime read model has no attack rows', () => {
    expect(
      mapDashboardDerivedStatRows({
        ...runtimeStats,
        damageRows: [],
      }).map((row) => row.key),
    ).toEqual([
      'defense',
      'luck',
      'critical_chance',
      'critical_damage',
      'evasion',
      'attack_count',
    ]);
  });

  it('keeps an equipment source label without inventing damage when DB returns no value', () => {
    expect(
      mapDashboardDerivedStatRows({
        ...runtimeStats,
        damageRows: [
          { key: 'main_hand', label: 'Demonic Dagger', displayValue: '21-28' },
          { key: 'off_hand', label: 'Bronze Shield', displayValue: '' },
        ],
      }).slice(0, 2),
    ).toEqual([
      { key: 'damage-main_hand', label: 'Demonic Dagger', value: '21-28' },
      { key: 'damage-off_hand', label: 'Bronze Shield', value: null },
    ]);
  });
});
