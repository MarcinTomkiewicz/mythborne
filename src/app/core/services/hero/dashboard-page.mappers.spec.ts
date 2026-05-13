import {
  mapDashboardBaseStatRows,
  mapDashboardDerivedDisplay,
  mapDashboardDerivedStatRows,
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

  it('maps player-safe derived stat rows from the runtime read model', () => {
    expect(mapDashboardDerivedStatRows(runtimeStats)).toEqual([
      {
        key: 'damage',
        label: 'Damage',
        value: '',
        damageRows: [
          { key: 'main_hand', label: 'Demonic Dagger', displayValue: '21-28' },
          { key: 'off_hand', label: 'Unarmed', displayValue: '20-21' },
        ],
      },
      { key: 'defense', label: 'Defense', value: 104, damageRows: [] },
      { key: 'luck', label: 'Luck', value: 3, damageRows: [] },
      { key: 'critical_chance', label: 'Critical chance', value: '2%', damageRows: [] },
      { key: 'critical_damage', label: 'Critical damage', value: '50%', damageRows: [] },
      { key: 'evasion', label: 'Evasion', value: '8%', damageRows: [] },
      { key: 'attack_count', label: 'Attack count', value: 2, damageRows: [] },
    ]);
  });
});
