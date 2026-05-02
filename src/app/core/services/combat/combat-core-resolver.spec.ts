import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { COMBAT_FORMULA_TARGET } from '../../constants/combat-formula-targets.const';
import { RPC } from '../../constants/rpc.const';
import {
  COMBAT_ATTACK_SOURCE_KIND,
  COMBAT_OUTCOME,
  COMBAT_PARTICIPANT_KIND,
  COMBAT_SIDE,
  COMBAT_SOURCE_TYPE,
  CombatParticipantInput,
  CombatResolutionInput,
} from '../../domain/combat/combat.model';
import { FormulaAssignmentResolution } from '../../domain/formula/formula.model';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { CombatInitiativeOrderService } from './combat-initiative-order';
import { CombatCoreResolverService } from './combat-core-resolver';

describe('CombatCoreResolverService', () => {
  let backend: jasmine.SpyObj<Backend>;
  let formulas: jasmine.SpyObj<FormulaService>;
  let service: CombatCoreResolverService;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    backend.rpc.and.returnValue(of(2));
    formulas = jasmine.createSpyObj<FormulaService>('FormulaService', ['getAssignedFormula']);
    formulas.getAssignedFormula.and.callFake((targetKey: string) =>
      of(formulaResolution(targetKey, defaultExpression(targetKey))),
    );

    TestBed.configureTestingModule({
      providers: [
        CombatCoreResolverService,
        CombatInitiativeOrderService,
        FormulaRuntimeService,
        { provide: Backend, useValue: backend },
        { provide: FormulaService, useValue: formulas },
      ],
    });
    service = TestBed.inject(CombatCoreResolverService);
  });

  it('executes ordered attack slots and stops the turn when a participant is defeated', async () => {
    spyOn(Math, 'random').and.returnValues(0.99, 0.99, 0, 0.99, 0.99, 0);
    formulas.getAssignedFormula.and.callFake((targetKey: string) =>
      of(formulaResolution(
        targetKey,
        targetKey === COMBAT_FORMULA_TARGET.initiativeScore
          ? 'combatantAgility * 10 - attackIndex'
          : defaultExpression(targetKey),
      )),
    );

    const result = await firstValueFrom(service.resolveCombat(input({
      initiator: participant(COMBAT_SIDE.initiator, {
        displayName: 'Hero',
        agility: 10,
        maxHealth: 30,
        minDamage: 5,
        maxDamage: 5,
        attackCount: 2,
      }),
      defender: participant(COMBAT_SIDE.defender, {
        displayName: 'Opponent',
        agility: 1,
        maxHealth: 9,
        minDamage: 5,
        maxDamage: 5,
        attackCount: 1,
      }),
    })));

    expect(result.outcome).toBe(COMBAT_OUTCOME.initiatorVictory);
    expect(result.turnsCompleted).toBe(1);
    expect(result.attacks.map((attack) => `${attack.actorSide}:${attack.attackSlotIndex}`))
      .toEqual(['initiator:0', 'initiator:1']);
    expect(result.participants.find((entry) => entry.side === COMBAT_SIDE.defender)?.healthEnd)
      .toBe(0);
  });

  it('draws only after the DB-backed turn limit is exhausted', async () => {
    spyOn(Math, 'random').and.returnValues(
      0.99, 0.99, 0,
      0.99, 0.99, 0,
      0.99, 0.99, 0,
      0.99, 0.99, 0,
    );
    backend.rpc.and.returnValue(of(2));

    const result = await firstValueFrom(service.resolveCombat(input({
      initiator: participant(COMBAT_SIDE.initiator, { maxHealth: 50, attackCount: 1 }),
      defender: participant(COMBAT_SIDE.defender, { maxHealth: 50, attackCount: 1 }),
    })));

    expect(backend.rpc).toHaveBeenCalledOnceWith(RPC.get_combat_turn_limit);
    expect(result.outcome).toBe(COMBAT_OUTCOME.draw);
    expect(result.turnsCompleted).toBe(2);
    expect(result.attacks.length).toBe(4);
  });

  it('uses Walking Dead timing input when supplied', async () => {
    const result = await firstValueFrom(service.resolveCombat(input({
      initiator: participant(COMBAT_SIDE.initiator, { attackCount: 1 }),
      defender: participant(COMBAT_SIDE.defender, { attackCount: 1 }),
      timingInputs: [
        {
          turnNumber: 1,
          side: COMBAT_SIDE.initiator,
          slotIndex: 0,
          indicatorPosition: 0,
        },
      ],
    })));

    expect(result.attacks[0]).toEqual(jasmine.objectContaining({
      actorSide: COMBAT_SIDE.initiator,
      timingHit: false,
      evaded: false,
      rolledDamage: null,
      finalDamage: 0,
    }));
  });

  it('does not reuse timing input across later turns for the same slot', async () => {
    spyOn(Math, 'random').and.returnValues(
      0.99, 0.99, 0,
      0.99, 0.99, 0,
      0.99, 0.99, 0,
    );
    backend.rpc.and.returnValue(of(2));

    const result = await firstValueFrom(service.resolveCombat(input({
      initiator: participant(COMBAT_SIDE.initiator, {
        maxHealth: 20,
        minDamage: 1,
        maxDamage: 1,
        attackCount: 1,
      }),
      defender: participant(COMBAT_SIDE.defender, {
        maxHealth: 20,
        minDamage: 1,
        maxDamage: 1,
        attackCount: 1,
      }),
      timingInputs: [
        {
          turnNumber: 1,
          side: COMBAT_SIDE.initiator,
          slotIndex: 0,
          indicatorPosition: 0,
        },
      ],
    })));

    expect(result.attacks.filter((attack) => attack.actorSide === COMBAT_SIDE.initiator)
      .map((attack) => attack.timingHit)).toEqual([false, null]);
  });

  it('rejects invalid turn limit configuration', async () => {
    backend.rpc.and.returnValue(of(0));

    await expectAsync(firstValueFrom(service.resolveCombat(input({
      initiator: participant(COMBAT_SIDE.initiator, { attackCount: 1 }),
      defender: participant(COMBAT_SIDE.defender, { attackCount: 1 }),
    })))).toBeRejectedWithError(
      'Combat turn limit configuration must be a positive number.',
    );
  });

  it('passes explicit formula bonus snapshots into combat formula context', async () => {
    formulas.getAssignedFormula.and.callFake((targetKey: string) =>
      of(formulaResolution(
        targetKey,
        targetKey === COMBAT_FORMULA_TARGET.finalDamage
          ? 'rolledDamage + damageBonusFromItems'
          : defaultExpression(targetKey),
      )),
    );
    spyOn(Math, 'random').and.returnValues(0.99, 0.99, 0);

    const result = await firstValueFrom(service.resolveCombat(input({
      initiator: participant(COMBAT_SIDE.initiator, {
        maxHealth: 30,
        minDamage: 2,
        maxDamage: 2,
        damageBonusFromItems: 3,
        attackCount: 1,
      }),
      defender: participant(COMBAT_SIDE.defender, {
        maxHealth: 5,
        attackCount: 1,
      }),
    })));

    expect(result.attacks[0].finalDamage).toBe(5);
  });

  it('uses critical damage percent instead of a fixed x2 multiplier', async () => {
    spyOn(Math, 'random').and.returnValues(0.99, 0, 0);
    formulas.getAssignedFormula.and.callFake((targetKey: string) =>
      of(formulaResolution(
        targetKey,
        targetKey === COMBAT_FORMULA_TARGET.criticalChance
          ? '100'
          : targetKey === COMBAT_FORMULA_TARGET.finalDamage
            ? 'rolledDamage * critMultiplier'
            : defaultExpression(targetKey),
      )),
    );

    const result = await firstValueFrom(service.resolveCombat(input({
      initiator: participant(COMBAT_SIDE.initiator, {
        maxHealth: 30,
        minDamage: 10,
        maxDamage: 10,
        criticalDamage: 50,
        attackCount: 1,
      }),
      defender: participant(COMBAT_SIDE.defender, {
        maxHealth: 10,
        attackCount: 1,
      }),
    })));

    expect(result.attacks[0]).toEqual(jasmine.objectContaining({
      critical: true,
      rolledDamage: 10,
      criticalDamage: 15,
      finalDamage: 15,
    }));
  });
});

function input(overrides: {
  initiator: CombatParticipantInput;
  defender: CombatParticipantInput;
  timingInputs?: CombatResolutionInput['timingInputs'];
}): CombatResolutionInput {
  return {
    source: {
      sourceType: COMBAT_SOURCE_TYPE.sandbox,
      sourceEntityId: 'combat-test',
      serverId: 'server-1',
      startedAt: '2026-05-02T10:00:00.000Z',
      completedAt: '2026-05-02T10:01:00.000Z',
    },
    initiator: overrides.initiator,
    defender: overrides.defender,
    timingInputs: overrides.timingInputs,
  };
}

function participant(
  side: CombatParticipantInput['side'],
  overrides: {
    displayName?: string;
    agility?: number;
    intelligence?: number;
    maxHealth?: number;
    minDamage?: number;
    maxDamage?: number;
    criticalDamage?: number;
    damageBonusFromItems?: number;
    attackCount?: number;
  } = {},
): CombatParticipantInput {
  const displayName = overrides.displayName ?? side;
  const baseStats = {
    strength: 10,
    dexterity: 10,
    endurance: 10,
    agility: overrides.agility ?? 5,
    cunning: 10,
    charisma: 10,
    wisdom: 10,
    intelligence: overrides.intelligence ?? 5,
    spirituality: 10,
  };

  return {
    side,
    displayName,
    level: 1,
    reference: {
      participantKind: side === COMBAT_SIDE.initiator
        ? COMBAT_PARTICIPANT_KIND.hero
        : COMBAT_PARTICIPANT_KIND.opponent,
      heroId: side === COMBAT_SIDE.initiator ? 'hero-1' : null,
      opponentDefinitionId: side === COMBAT_SIDE.defender ? 'opponent-1' : null,
    },
    stats: {
      maxHealth: overrides.maxHealth ?? 30,
      defense: 0,
      minDamage: overrides.minDamage ?? 1,
      maxDamage: overrides.maxDamage ?? 1,
      luck: 0,
      criticalChance: 0,
      criticalDamage: overrides.criticalDamage ?? 50,
      evasionChance: 0,
    },
    baseStats: Object.entries(baseStats).map(([statKey, statValue]) => ({
      side,
      statKey,
      statValue,
    })),
    formulaBonuses: {
      hitBonusFromItems: 0,
      critBonusFromItems: 0,
      evasionBonusFromItems: 0,
      damageBonusFromItems: overrides.damageBonusFromItems ?? 0,
    },
    attackPlan: {
      side,
      slots: Array.from({ length: overrides.attackCount ?? 1 }, (_, index) => ({
        side,
        slotIndex: index,
        initiativeScore: 0,
        source: {
          kind: COMBAT_ATTACK_SOURCE_KIND.unarmed,
          label: `${displayName} attack ${index + 1}`,
          opponentAttackSourceId: null,
          sourceItemId: null,
          sourceBaseId: null,
          sourceQualityKey: null,
          sourcePrefixAffixId: null,
          sourceSuffixAffixId: null,
        },
      })),
    },
  };
}

function defaultExpression(targetKey: string): string {
  switch (targetKey) {
    case COMBAT_FORMULA_TARGET.hitGreenZone:
      return '20';
    case COMBAT_FORMULA_TARGET.evasionChance:
      return '0';
    case COMBAT_FORMULA_TARGET.criticalChance:
      return '0';
    case COMBAT_FORMULA_TARGET.finalDamage:
      return 'rolledDamage';
    case COMBAT_FORMULA_TARGET.initiativeScore:
      return 'combatantAgility * 10 + attackIndex';
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
      allowedVariables: allowedVariables(targetKey),
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

function allowedVariables(targetKey: string): string[] {
  if (targetKey === COMBAT_FORMULA_TARGET.initiativeScore) {
    return [
      'combatantIntelligence',
      'combatantAgility',
      'attackIndex',
      'attackCount',
    ];
  }

  return [
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
  ];
}
