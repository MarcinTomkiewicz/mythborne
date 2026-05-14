import {
  mapDashboardBaseStatRows,
  mapDashboardDerivedDisplay,
  mapDashboardDerivedStatRows,
  mapDashboardHealthDisplay,
} from './dashboard-page.mappers';
import { HeroDashboardRuntimeStatsReadModel } from '../../domain/hero/hero-dashboard-runtime-stats.model';

describe('dashboard page mappers', () => {
  const runtimeStats: HeroDashboardRuntimeStatsReadModel = {
    heroId: 'hero-1',
    displayStats: {
      heroStats: [
        {
          statKey: 'strength',
          label: 'Strength',
          displayValue: '19',
          finalValue: 19,
          tone: 'positive',
          colorableFinalValue: true,
          sortOrder: 10,
        },
        {
          statKey: 'dexterity',
          label: 'Dexterity',
          displayValue: '6',
          finalValue: 6,
          tone: 'neutral',
          colorableFinalValue: false,
          sortOrder: 20,
        },
      ],
      derivedStats: [
        {
          statKey: 'health',
          label: 'Health',
          displayValue: '120',
          finalValue: 120,
          tone: 'positive',
          colorableFinalValue: true,
          sortOrder: 5,
        },
        {
          statKey: 'defense',
          label: 'Defense',
          displayValue: '142',
          finalValue: 142,
          tone: 'positive',
          colorableFinalValue: true,
          sortOrder: 10,
        },
        {
          statKey: 'luck',
          label: 'Luck',
          displayValue: '21',
          finalValue: 21,
          tone: 'positive',
          colorableFinalValue: false,
          sortOrder: 20,
        },
        {
          statKey: 'critical_chance',
          label: 'Critical chance',
          displayValue: '6%',
          finalValue: 6,
          tone: 'positive',
          colorableFinalValue: true,
          sortOrder: 30,
        },
        {
          statKey: 'critical_damage',
          label: 'Critical damage',
          displayValue: '50%',
          finalValue: 50,
          tone: 'neutral',
          colorableFinalValue: true,
          sortOrder: 40,
        },
        {
          statKey: 'attack_count',
          label: 'Attack count',
          displayValue: '3',
          finalValue: 3,
          tone: 'positive',
          colorableFinalValue: false,
          sortOrder: 50,
        },
      ],
      damageRows: [
        {
          key: 'main_hand',
          label: 'Demonic Dagger',
          displayValue: '34-50',
          baseDamage: { min: '34', max: '46' },
          finalDamage: { min: '34', max: '50' },
          minDelta: 0,
          maxDelta: 4,
          minTone: 'neutral',
          maxTone: 'positive',
          tone: 'positive',
          colorableFinalValue: true,
          sortOrder: 10,
        },
      ],
    },
    defense: 104,
    currentHealth: 84,
    maxHealth: 120,
    luck: 3,
    criticalChanceBonus: 2,
    criticalDamage: 50,
    evasionChanceBonus: 8,
    attackCount: 2,
  };

  it('maps Hero Stats from display_stats_json.heroStats', () => {
    expect(mapDashboardBaseStatRows(runtimeStats)).toEqual([
      {
        key: 'strength',
        label: 'Strength',
        value: '19',
        valueClass: 'success-text text-lg',
      },
      {
        key: 'dexterity',
        label: 'Dexterity',
        value: '6',
        valueClass: 'color-heading text-lg',
      },
    ]);
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

  it('maps display_stats_json derived rows and omits health from the card', () => {
    expect(mapDashboardDerivedStatRows(runtimeStats)).toEqual([
      {
        key: 'damage-main_hand',
        label: 'Demonic Dagger',
        value: '34-50',
        valueClass: 'text-md',
        parts: [
          { text: '34', className: 'color-heading text-md' },
          { text: '-', className: 'color-heading text-md' },
          { text: '50', className: 'success-text text-md' },
        ],
      },
      {
        key: 'defense',
        label: 'Defense',
        value: '142',
        valueClass: 'success-text text-md',
        parts: [{ text: '142', className: 'success-text text-md' }],
      },
      {
        key: 'luck',
        label: 'Luck',
        value: '21',
        valueClass: 'color-heading text-md',
        parts: [{ text: '21', className: 'color-heading text-md' }],
      },
      {
        key: 'critical_chance',
        label: 'Critical chance',
        value: '6%',
        valueClass: 'success-text text-md',
        parts: [{ text: '6%', className: 'success-text text-md' }],
      },
      {
        key: 'critical_damage',
        label: 'Critical damage',
        value: '50%',
        valueClass: 'color-heading text-md',
        parts: [{ text: '50%', className: 'color-heading text-md' }],
      },
      {
        key: 'attack_count',
        label: 'Attack count',
        value: '3',
        valueClass: 'color-heading text-md',
        parts: [{ text: '3', className: 'color-heading text-md' }],
      },
    ]);
  });

  it('maps negative tone to the existing error text class', () => {
    expect(
      mapDashboardDerivedStatRows({
        ...runtimeStats,
        displayStats: {
          heroStats: [],
          damageRows: [],
          derivedStats: [
            {
              statKey: 'defense',
              label: 'Defense',
              displayValue: '80',
              finalValue: 80,
              tone: 'negative',
              colorableFinalValue: true,
              sortOrder: 10,
            },
          ],
        },
      }),
    ).toEqual([
      {
        key: 'defense',
        label: 'Defense',
        value: '80',
        valueClass: 'error-text text-md',
        parts: [{ text: '80', className: 'error-text text-md' }],
      },
    ]);
  });

  it('ignores tone when colorableFinalValue is false', () => {
    expect(
      mapDashboardDerivedStatRows({
        ...runtimeStats,
        displayStats: {
          heroStats: [],
          damageRows: [],
          derivedStats: [
            {
              statKey: 'luck',
              label: 'Luck',
              displayValue: '21',
              finalValue: 21,
              tone: 'negative',
              colorableFinalValue: false,
              sortOrder: 10,
            },
          ],
        },
      })[0].valueClass,
    ).toBe('color-heading text-md');
  });

  it('omits derived stat rows when runtime stats are unavailable', () => {
    expect(mapDashboardDerivedStatRows(null)).toEqual([]);
  });
});
