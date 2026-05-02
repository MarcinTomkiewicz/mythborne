import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { COMBAT_ATTACK_SOURCE_KIND, COMBAT_SIDE, CombatAttackEvent } from '../../domain/combat/combat.model';
import { CombatantSnapshot } from '../../domain/combat/combat-sandbox.model';
import { CombatBalanceService } from './combat-balance';
import { CombatPageFacade } from './combat-page.facade';
import { CombatPageLoaderService } from './combat-page-loader';
import { CombatSandboxCallerService } from './combat-sandbox-caller';

describe('CombatPageFacade', () => {
  let page: CombatPageFacade;
  let sandboxCaller: jasmine.SpyObj<CombatSandboxCallerService>;

  beforeEach(() => {
    sandboxCaller = jasmine.createSpyObj<CombatSandboxCallerService>(
      'CombatSandboxCallerService',
      ['resolvePlayerStep'],
    );

    TestBed.configureTestingModule({
      providers: [
        CombatPageFacade,
        { provide: CombatPageLoaderService, useValue: jasmine.createSpyObj('CombatPageLoaderService', ['load']) },
        { provide: CombatBalanceService, useValue: jasmine.createSpyObj('CombatBalanceService', ['evaluateHitWindow']) },
        { provide: CombatSandboxCallerService, useValue: sandboxCaller },
      ],
    });
    page = TestBed.inject(CombatPageFacade);
  });

  it('keeps Walking Dead flow interactive after a non-lethal step', () => {
    const hero = combatant('hero', 'Hero');
    const enemy = combatant('enemy', 'Training Opponent');
    const attacks = [attack()];

    sandboxCaller.resolvePlayerStep.and.returnValue(of({
      result: null,
      logEntries: [{
        turn: 1,
        attackerKey: 'hero',
        attackerName: 'Hero',
        defenderKey: 'enemy',
        defenderName: 'Training Opponent',
        displayText: 'Hero hits Training Opponent with Hero attack for 3 damage.',
        attackSourceLabel: 'Hero attack',
        indicatorPosition: 50,
        hitWindowStart: 0,
        hitWindowEnd: 0,
        hitWindowWidth: 0,
        hitChance: 0,
        evasionChance: 0,
        criticalChance: 0,
        rawDamage: 3,
        damage: 3,
        defenderHealthAfter: 17,
        wasCritical: false,
        wasDodged: false,
        result: 'hit',
      }],
      attacks,
      heroHealth: 30,
      enemyHealth: 17,
      turnsPlayed: 1,
      turnLimit: 10,
    }));

    page.heroId.set('hero-1');
    page.hero.set(hero);
    page.enemy.set(enemy);
    page.rules.set({
      hitWindow: formula(),
      evasionChance: formula(),
      criticalChance: formula(),
      finalDamage: formula(),
    });
    page.heroCurrentHealth.set(30);
    page.enemyCurrentHealth.set(20);
    page.phase.set('player_turn');
    page.walkingPosition.set(50);
    spyOn(window, 'setInterval').and.returnValue(1 as unknown as ReturnType<typeof window.setInterval>);
    spyOn(window, 'clearInterval');

    page.strike();

    expect(page.result()).toBeNull();
    expect(page.phase()).toBe('player_turn');
    expect(page.turn()).toBe(2);
    expect(page.canStrike()).toBeTrue();
    expect(page.enemyCurrentHealth()).toBe(17);
    expect(page.logEntries().length).toBe(1);
  });
});

function formula() {
  return {
    targetKey: 'combat_formula',
    targetLabel: 'Combat formula',
    expression: '0',
  };
}

function attack(): CombatAttackEvent {
  return {
    turnNumber: 1,
    attackOrder: 1,
    attackSlotIndex: 0,
    actorSide: COMBAT_SIDE.initiator,
    targetSide: COMBAT_SIDE.defender,
    source: {
      kind: COMBAT_ATTACK_SOURCE_KIND.unarmed,
      label: 'Hero attack',
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
    rolledDamage: 3,
    criticalDamage: null,
    finalDamage: 3,
    targetHealthBefore: 20,
    targetHealthAfter: 17,
    displayText: 'Hero hits Training Opponent with Hero attack for 3 damage.',
  };
}

function combatant(key: string, name: string): CombatantSnapshot {
  return {
    key,
    name,
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
