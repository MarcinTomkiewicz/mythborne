import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CombatantSnapshot } from '../../../core/domain/combat/combat-sandbox.model';
import { CombatPageFacade } from '../../../core/services/combat/combat-page.facade';
import { CombatPage } from './combat-page';

describe('CombatPage', () => {
  let fixture: ComponentFixture<CombatPage>;
  let page: FakeCombatPageFacade;

  beforeEach(async () => {
    page = new FakeCombatPageFacade();

    await TestBed.configureTestingModule({
      imports: [CombatPage],
    })
      .overrideComponent(CombatPage, {
        set: {
          providers: [
            { provide: CombatPageFacade, useValue: page },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CombatPage);
    fixture.detectChanges();
  });

  it('labels the manual combat surface as a runtime snapshot sandbox', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('currently loaded hero runtime snapshot');
    expect(text).toContain('Production live combat resolves loadout');
    expect(text).toContain('DB/RPC per action');
  });
});

class FakeCombatPageFacade {
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly hero = signal<CombatantSnapshot | null>(combatant());
  readonly enemy = signal<CombatantSnapshot | null>(null);
  readonly result = signal(null);
  readonly battleError = signal<string | null>(null);
  readonly phase = signal('idle');
  readonly origin = signal(null);
  readonly logEntries = signal([]);
  readonly walkingPosition = signal(0);
  readonly playerHitWindow = signal({ start: 35, end: 65, width: 30 });
  readonly walkingSpeed = signal(1);
  readonly streak = signal(0);
  readonly canStrike = signal(false);
  readonly canStartFight = signal(false);
  readonly turnLabel = signal('1');

  loadData = jasmine.createSpy('loadData');
  startFight = jasmine.createSpy('startFight');
  strike = jasmine.createSpy('strike');

  currentHealth(combatant: CombatantSnapshot): number {
    return combatant.derived.health;
  }

  maxHealth(combatant: CombatantSnapshot): number {
    return combatant.derived.health;
  }

  baseStatEntries(): Array<{ key: string; label: string; value: string; valueClass: string }> {
    return [{ key: 'strength', label: 'Strength', value: '10', valueClass: 'color-heading text-md' }];
  }

  combatStatEntries(): Array<{ key: string; label: string; value: string; valueClass: string }> {
    return [];
  }

  outcomeLabel(): string {
    return '';
  }

  sourceTypeLabel(): string | null {
    return null;
  }

  winnerLabel(): string | null {
    return null;
  }

  winnerSideLabel(): string | null {
    return null;
  }

  trackLogEntry(index: number): string {
    return `${index}`;
  }
}

function combatant(): CombatantSnapshot {
  return {
    key: 'hero',
    name: 'Hero',
    level: 1,
    baseStats: {
      strength: 10,
      dexterity: 10,
      endurance: 10,
      agility: 10,
      cunning: 10,
      charisma: 10,
      wisdom: 10,
      intelligence: 10,
      spirituality: 10,
    },
    derived: {
      health: 30,
      def: 0,
      luck: 0,
      minDmg: 3,
      maxDmg: 3,
      critical: 0,
      criticalDamage: 50,
      evasion: 0,
    },
    bonuses: {
      hitBonusFromItems: 0,
      critBonusFromItems: 0,
      criticalDamageBonusFromItems: 0,
      evasionBonusFromItems: 0,
      damageBonusFromItems: 0,
    },
  };
}
