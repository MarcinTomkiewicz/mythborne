import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import {
  COMBAT_ATTACK_SOURCE_KIND,
  COMBAT_PARTICIPANT_KIND,
  COMBAT_SIDE,
  CombatAttackEvent,
} from '../../domain/combat/combat.model';
import { CombatSandboxStepInput, CombatSandboxStepResolution } from '../../domain/combat/combat-sandbox-step.model';
import { CombatantSnapshot } from '../../domain/combat/combat-sandbox.model';
import { toCombatSandboxParticipant } from '../../utils/combat-sandbox-participant';
import { CombatSandboxCallerService } from './combat-sandbox-caller';
import { CombatSandboxStepResolverService } from './combat-sandbox-step-resolver';

describe('CombatSandboxCallerService', () => {
  let stepResolver: jasmine.SpyObj<CombatSandboxStepResolverService>;
  let service: CombatSandboxCallerService;

  beforeEach(() => {
    stepResolver = jasmine.createSpyObj<CombatSandboxStepResolverService>(
      'CombatSandboxStepResolverService',
      ['resolveStep'],
    );

    TestBed.configureTestingModule({
      providers: [
        CombatSandboxCallerService,
        { provide: CombatSandboxStepResolverService, useValue: stepResolver },
      ],
    });
    service = TestBed.inject(CombatSandboxCallerService);
  });

  it('delegates one player timing step to the step resolver', async () => {
    stepResolver.resolveStep.and.returnValue(of(stepResolution(null)));

    await firstValueFrom(service.resolvePlayerStep(input()));

    expect(stepResolver.resolveStep).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      heroId: 'hero-1',
      heroHealth: 30,
      enemyHealth: 20,
      turnNumber: 2,
      attackOrderStart: 3,
      indicatorPosition: 42,
      streak: 1,
    } as Partial<CombatSandboxStepInput>));
  });

  it('returns ongoing step data without auto-finishing the duel', async () => {
    stepResolver.resolveStep.and.returnValue(of(stepResolution(null)));

    const result = await firstValueFrom(service.resolvePlayerStep(input()));

    expect(result.result).toBeNull();
    expect(result.heroHealth).toBe(25);
    expect(result.enemyHealth).toBe(14);
    expect(result.logEntries.length).toBe(2);
    expect(result.logEntries[0]).toEqual(jasmine.objectContaining({
      attackerKey: 'hero',
      defenderKey: 'enemy',
      indicatorPosition: 42,
      result: 'hit',
    }));
  });

  it('maps natural fight end when the current step resolves an outcome', async () => {
    stepResolver.resolveStep.and.returnValue(of(stepResolution('victory')));

    const result = await firstValueFrom(service.resolvePlayerStep(input()));

    expect(result.result).toEqual(jasmine.objectContaining({
      outcome: 'victory',
      winnerKey: 'hero',
      loserKey: 'enemy',
      enemyRemainingHealth: 14,
    }));
  });
});

function input() {
  return {
    heroId: 'hero-1',
    hero: combatant('hero', 'Hero'),
    enemy: combatant('enemy', 'Training Opponent'),
    heroHealth: 30,
    enemyHealth: 20,
    turnNumber: 2,
    attackOrderStart: 3,
    indicatorPosition: 42,
    streak: 1,
  };
}

function stepResolution(
  outcome: CombatSandboxStepResolution['outcome'],
): CombatSandboxStepResolution {
  const hero = combatant('hero', 'Hero');
  const enemy = combatant('enemy', 'Training Opponent');
  const initiator = toCombatSandboxParticipant(COMBAT_SIDE.initiator, hero, 'hero-1');
  const defender = toCombatSandboxParticipant(COMBAT_SIDE.defender, enemy, null);

  return {
    initiator,
    defender,
    events: [
      event({
        actorSide: COMBAT_SIDE.initiator,
        targetSide: COMBAT_SIDE.defender,
        displayText: 'Hero hits Training Opponent with Hero attack for 6 damage.',
        targetHealthAfter: 14,
        timingHit: true,
        finalDamage: 6,
      }),
      event({
        actorSide: COMBAT_SIDE.defender,
        targetSide: COMBAT_SIDE.initiator,
        displayText: 'Training Opponent hits Hero with Training Opponent attack for 5 damage.',
        targetHealthAfter: 25,
        timingHit: null,
        finalDamage: 5,
      }),
    ],
    heroHealth: 25,
    enemyHealth: 14,
    outcome,
    turnsPlayed: 2,
    turnLimit: 10,
  };
}

function event(overrides: {
  actorSide: CombatAttackEvent['actorSide'];
  targetSide: CombatAttackEvent['targetSide'];
  displayText: string;
  targetHealthAfter: number;
  timingHit: boolean | null;
  finalDamage: number;
}): CombatAttackEvent {
  return {
    turnNumber: 2,
    attackOrder: 3,
    attackSlotIndex: 0,
    actorSide: overrides.actorSide,
    targetSide: overrides.targetSide,
    source: {
      kind: COMBAT_ATTACK_SOURCE_KIND.unarmed,
      label: overrides.actorSide === COMBAT_SIDE.initiator
        ? 'Hero attack'
        : 'Training Opponent attack',
      opponentAttackSourceId: null,
      sourceItemId: null,
      sourceBaseId: null,
      sourceQualityKey: null,
      sourcePrefixAffixId: null,
      sourceSuffixAffixId: null,
    },
    timingHit: overrides.timingHit,
    evaded: false,
    critical: false,
    rolledDamage: overrides.finalDamage,
    criticalDamage: null,
    finalDamage: overrides.finalDamage,
    targetHealthBefore: overrides.targetHealthAfter + overrides.finalDamage,
    targetHealthAfter: overrides.targetHealthAfter,
    displayText: overrides.displayText,
  };
}

function combatant(key: string, name: string): CombatantSnapshot {
  return {
    key,
    name,
    level: 4,
    baseStats: {
      strength: 10,
      dexterity: 11,
      endurance: 12,
      agility: 13,
      cunning: 14,
      charisma: 15,
      wisdom: 16,
      intelligence: 17,
      spirituality: 18,
    },
    derived: {
      health: 30,
      def: 2,
      luck: 3,
      minDmg: 4,
      maxDmg: 6,
      critical: 7,
      criticalDamage: 50,
      evasion: 8,
    },
    bonuses: {
      hitBonusFromItems: 1,
      critBonusFromItems: 2,
      criticalDamageBonusFromItems: 0,
      evasionBonusFromItems: 3,
      damageBonusFromItems: 4,
    },
  };
}
