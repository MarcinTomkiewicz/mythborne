import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import { ActiveHero } from './active-hero';
import { HeroDashboardRuntimeStats } from './hero-dashboard-runtime-stats';

describe('HeroDashboardRuntimeStats', () => {
  let service: HeroDashboardRuntimeStats;
  let backend: jasmine.SpyObj<Backend>;
  let activeHero: jasmine.SpyObj<ActiveHero>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', [
      'requireActiveHero',
      'state',
    ]);
    activeHero.requireActiveHero.and.returnValue(of({
      userId: 'user-1',
      serverId: 'server-1',
      heroId: 'hero-1',
      server: {} as never,
      hero: {} as never,
      heroRow: {} as never,
    }));
    activeHero.state.and.returnValue({
      userId: 'user-1',
      serverId: 'server-1',
      heroId: 'hero-1',
      server: {} as never,
      hero: null,
      heroRow: null,
    });
    backend.rpc.and.returnValue(of([{
      hero_id: 'hero-1',
      damage_rows_json: [
        {
          sourceLabel: 'Demonic Dagger',
          displayValue: '21-28',
          slotKey: 'main_hand',
        },
        {
          source_label: 'Unarmed',
          min_damage: 20,
          max_damage: 21,
          slot_key: 'off_hand',
        },
      ],
      display_stats_json: {
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
        ],
        derivedStats: [
          {
            statKey: 'luck',
            label: 'Luck',
            displayValue: '7',
            finalValue: 7,
            tone: 'positive',
            colorableFinalValue: false,
            sortOrder: 10,
          },
        ],
        damageRows: [
          {
            key: 'main_hand',
            label: 'Demonic Dagger',
            baseDamage: { min: 21, max: 28 },
            finalDamage: { min: 21, max: 30 },
            minTone: 'neutral',
            maxTone: 'positive',
            tone: 'positive',
            colorableFinalValue: true,
            sortOrder: 10,
          },
        ],
      },
      defense: 104,
      current_health: 84,
      max_health: 120,
      luck: 7,
      critical_chance_bonus: 2,
      critical_damage: 50,
      evasion_chance_bonus: 8,
      attack_count: 2,
      attack_plan_json: {},
      source_json: {},
      stats_json: {
        strength: 19,
        dexterity: 6,
        ignored_text: 'not numeric',
      },
    }]));

    TestBed.configureTestingModule({
      providers: [
        HeroDashboardRuntimeStats,
        { provide: Backend, useValue: backend },
        { provide: ActiveHero, useValue: activeHero },
      ],
    });
    service = TestBed.inject(HeroDashboardRuntimeStats);
  });

  it('loads dashboard runtime stats through the DB-owned RPC', async () => {
    const result = await firstValueFrom(service.getActiveHeroRuntimeStats());

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_hero_dashboard_runtime_stats,
      { p_hero_id: 'hero-1' },
    );
    expect(result.defense).toBe(104);
    expect(result.currentHealth).toBe(84);
    expect(result.maxHealth).toBe(120);
    expect(result.criticalChanceBonus).toBe(2);
    expect(result.displayStats.heroStats).toEqual([
      {
        statKey: 'strength',
        label: 'Strength',
        displayValue: '19',
        finalValue: 19,
        tone: 'positive',
        colorableFinalValue: true,
        sortOrder: 10,
      },
    ]);
    expect(result.displayStats.damageRows[0].finalDamage).toEqual({
      min: '21',
      max: '30',
    });
  });

  it('rejects runtime stats rows for a different hero', async () => {
    backend.rpc.and.returnValue(of([{
      hero_id: 'hero-2',
      damage_rows_json: [],
      display_stats_json: {},
      defense: 0,
      current_health: 0,
      max_health: 0,
      luck: 0,
      critical_chance_bonus: 0,
      critical_damage: 0,
      evasion_chance_bonus: 0,
      attack_count: 0,
      attack_plan_json: {},
      source_json: {},
      stats_json: {},
    }]));

    await expectAsync(firstValueFrom(service.getRuntimeStats('hero-1')))
      .toBeRejectedWithError(
        'Dashboard runtime stats returned a row for a different hero.',
      );
  });
});
