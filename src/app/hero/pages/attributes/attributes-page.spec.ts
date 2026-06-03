import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { IHeroStats } from '../../../core/interfaces/hero/i-hero-stats';
import { Hero } from '../../../core/services/hero/hero';
import { AttributeAllocationPageFacade } from '../../../core/services/progression/attribute-allocation-page.facade';
import { StatProgressionService } from '../../../core/services/progression/stat-progression';
import { StatsService } from '../../../core/services/stats/stats';
import { ToastService } from '../../../core/services/ui/toast';
import { HeroAttributesPage } from './attributes-page';

describe('HeroAttributesPage', () => {
  let fixture: ComponentFixture<HeroAttributesPage>;
  let hero: jasmine.SpyObj<Hero>;
  let statProgression: jasmine.SpyObj<StatProgressionService>;

  beforeEach(() => {
    hero = jasmine.createSpyObj<Hero>('Hero', [
      'getHeroData',
      'getHeroStats',
      'saveProgressionDraft',
    ]);
    hero.getHeroData.and.returnValue(
      of({ level: 1, character_points: 10 }) as unknown as ReturnType<Hero['getHeroData']>,
    );
    hero.getHeroStats.and.returnValue(of(heroStats()));
    hero.saveProgressionDraft.and.returnValue(
      of({
        auditLogId: 'audit-1',
        characterPointsAfter: 7,
        heroId: 'hero-1',
        serverId: 'server-1',
        stats: { strength: 2 },
      }),
    );

    statProgression = jasmine.createSpyObj<StatProgressionService>('StatProgressionService', [
      'evaluateStatCap',
      'evaluateNextLevelCost',
      'getNextLevelCost',
      'getRules',
    ]);
    statProgression.evaluateStatCap.and.returnValue({ value: 10, error: null });
    statProgression.evaluateNextLevelCost.and.returnValue({ value: 3, error: null });
    statProgression.getNextLevelCost.and.returnValue(3);
    statProgression.getRules.and.returnValue(of({
      costTarget: {
        id: 'target-cost',
        key: 'hero_stat_upgrade_cost',
        scopeKey: 'hero_progression',
        label: 'Hero stat upgrade cost',
        description: null,
        allowedVariables: ['statCurrentLevel'],
        defaultTestContext: { statCurrentLevel: 1 },
        sortOrder: 1,
        createdAt: null,
      },
      capTarget: {
        id: 'target-cap',
        key: 'hero_stat_level_cap',
        scopeKey: 'hero_progression',
        label: 'Hero stat level cap',
        description: null,
        allowedVariables: ['currentLevel'],
        defaultTestContext: { currentLevel: 1 },
        sortOrder: 2,
        createdAt: null,
      },
      costFormula: {
        id: 'formula-cost',
        key: 'stat-upgrade-cost',
        scopeKey: 'hero_progression',
        label: 'Stat upgrade cost',
        expression: 'statCurrentLevel',
        description: null,
        isEnabled: true,
        createdAt: null,
        updatedAt: null,
      },
      capFormula: {
        id: 'formula-cap',
        key: 'stat-level-cap',
        scopeKey: 'hero_progression',
        label: 'Stat level cap',
        expression: 'currentLevel + 8',
        description: null,
        isEnabled: true,
        createdAt: null,
        updatedAt: null,
      },
    }));

    TestBed.configureTestingModule({
      imports: [HeroAttributesPage],
      providers: [
        provideRouter([]),
        AttributeAllocationPageFacade,
        { provide: Hero, useValue: hero },
        {
          provide: StatsService,
          useValue: jasmine.createSpyObj<StatsService>('StatsService', {
            getStats: of([{
              id: 'stat-strength',
              key: 'strength',
              label: 'Strength',
              order: 1,
              description: null,
            }]),
          }),
        },
        { provide: StatProgressionService, useValue: statProgression },
        { provide: ToastService, useValue: jasmine.createSpyObj<ToastService>('ToastService', ['show']) },
      ],
    });

    fixture = TestBed.createComponent(HeroAttributesPage);
    fixture.detectChanges();
  });

  it('renders a dashboard exit link so stat allocation is not a locked wizard', () => {
    const dashboardLink = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .find((entry) => entry.injector.get(RouterLink).href === '/hero/dashboard');

    expect(dashboardLink).toBeDefined();
    expect((fixture.nativeElement as HTMLElement).textContent ?? '').toContain('Dashboard');
  });
});

function heroStats(): IHeroStats {
  return {
    strength: 1,
    dexterity: 1,
    endurance: 1,
    agility: 1,
    cunning: 1,
    charisma: 1,
    wisdom: 1,
    intelligence: 1,
    spirituality: 1,
  };
}
