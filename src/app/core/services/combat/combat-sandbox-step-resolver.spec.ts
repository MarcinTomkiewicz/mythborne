import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { COMBAT_FORMULA_TARGET } from '../../constants/combat-formula-targets.const';
import { RPC } from '../../constants/rpc.const';
import { CombatSandboxStepInput } from '../../domain/combat/combat-sandbox-step.model';
import { CombatantSnapshot } from '../../domain/combat/combat-sandbox.model';
import { FormulaAssignmentResolution } from '../../domain/formula/formula.model';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { CombatSandboxStepResolverService } from './combat-sandbox-step-resolver';

describe('CombatSandboxStepResolverService', () => {
  let backend: jasmine.SpyObj<Backend>;
  let formulas: jasmine.SpyObj<FormulaService>;
  let service: CombatSandboxStepResolverService;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    backend.rpc.and.returnValue(of(10));
    formulas = jasmine.createSpyObj<FormulaService>('FormulaService', ['getAssignedFormula']);
    formulas.getAssignedFormula.and.callFake((targetKey: string) =>
      of(formulaResolution(targetKey, defaultExpression(targetKey))),
    );

    TestBed.configureTestingModule({
      providers: [
        CombatSandboxStepResolverService,
        FormulaRuntimeService,
        { provide: Backend, useValue: backend },
        { provide: FormulaService, useValue: formulas },
      ],
    });
    service = TestBed.inject(CombatSandboxStepResolverService);
  });

  it('resolves only the current player timing action and enemy response', async () => {
    spyOn(Math, 'random').and.returnValues(0.99, 0.99, 0, 0.99, 0.99, 0);

    const result = await firstValueFrom(service.resolveStep(input()));

    expect(backend.rpc).toHaveBeenCalledOnceWith(RPC.get_combat_turn_limit);
    expect(result.outcome).toBeNull();
    expect(result.events.length).toBe(2);
    expect(result.events.map((event) => event.actorSide)).toEqual(['initiator', 'defender']);
    expect(result.enemyHealth).toBe(24);
    expect(result.heroHealth).toBe(24);
  });

  it('does not auto-resolve later turns after one strike', async () => {
    spyOn(Math, 'random').and.returnValues(0.99, 0.99, 0, 0.99, 0.99, 0);

    const result = await firstValueFrom(service.resolveStep({
      ...input(),
      turnNumber: 1,
      heroHealth: 200,
      enemyHealth: 200,
    }));

    expect(result.outcome).toBeNull();
    expect(result.turnsPlayed).toBe(1);
    expect(result.events.length).toBe(2);
  });

  it('returns draw only when the current resolved step reaches the DB turn limit', async () => {
    spyOn(Math, 'random').and.returnValues(0.99, 0.99, 0, 0.99, 0.99, 0);
    backend.rpc.and.returnValue(of(2));

    const result = await firstValueFrom(service.resolveStep({
      ...input(),
      turnNumber: 2,
      heroHealth: 200,
      enemyHealth: 200,
    }));

    expect(result.outcome).toBe('draw');
    expect(result.turnsPlayed).toBe(2);
  });
});

function input(): CombatSandboxStepInput {
  return {
    heroId: 'hero-1',
    hero: combatant('hero', 'Hero'),
    enemy: combatant('enemy', 'Training Opponent'),
    heroHealth: 30,
    enemyHealth: 30,
    turnNumber: 1,
    attackOrderStart: 1,
    indicatorPosition: 50,
    streak: 0,
  };
}

function combatant(key: string, name: string): CombatantSnapshot {
  return {
    key,
    name,
    level: 4,
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
      minDmg: 6,
      maxDmg: 6,
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

function defaultExpression(targetKey: string): string {
  switch (targetKey) {
    case COMBAT_FORMULA_TARGET.hitGreenZone:
      return '100';
    case COMBAT_FORMULA_TARGET.evasionChance:
      return '0';
    case COMBAT_FORMULA_TARGET.criticalChance:
      return '0';
    case COMBAT_FORMULA_TARGET.finalDamage:
      return 'rolledDamage';
    default:
      return '0';
  }
}

function formulaResolution(targetKey: string, expression: string): FormulaAssignmentResolution {
  return {
    target: {
      id: `${targetKey}-target`,
      key: targetKey,
      scopeKey: 'combat',
      label: targetKey,
      description: `${targetKey} description.`,
      allowedVariables: [
        'attackerStrength',
        'attackerDexterity',
        'attackerAgility',
        'attackerCunning',
        'attackerLuck',
        'attackerDefense',
        'defenderAgility',
        'defenderLuck',
        'defenderDefense',
        'defenderEndurance',
        'hitBonusFromItems',
        'critBonusFromItems',
        'evasionBonusFromItems',
        'damageBonusFromItems',
        'rolledDamage',
        'critMultiplier',
      ],
      defaultTestContext: {},
      sortOrder: 10,
      createdAt: null,
    },
    formula: {
      id: `${targetKey}-formula`,
      key: `${targetKey}-formula`,
      scopeKey: 'combat',
      label: targetKey,
      expression,
      description: null,
      isEnabled: true,
      createdAt: null,
      updatedAt: null,
    },
    assignment: {
      id: `${targetKey}-assignment`,
      targetId: `${targetKey}-target`,
      formulaId: `${targetKey}-formula`,
      createdAt: null,
      updatedAt: null,
    },
    source: 'global',
  };
}
