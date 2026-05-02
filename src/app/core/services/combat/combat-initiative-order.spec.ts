import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import {
  COMBAT_ATTACK_SOURCE_KIND,
  COMBAT_SIDE,
} from '../../domain/combat/combat.model';
import { CombatInitiativeParticipantInput } from '../../domain/combat/combat-attack-plan.model';
import { FormulaAssignmentResolution } from '../../domain/formula/formula.model';
import { FormulaService } from '../formula/formula';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import {
  COMBAT_INITIATIVE_SCORE_TARGET,
  CombatInitiativeOrderService,
} from './combat-initiative-order';

describe('CombatInitiativeOrderService', () => {
  let formulas: jasmine.SpyObj<FormulaService>;
  let service: CombatInitiativeOrderService;

  beforeEach(() => {
    formulas = jasmine.createSpyObj<FormulaService>('FormulaService', ['getAssignedFormula']);
    formulas.getAssignedFormula.and.returnValue(of(formulaResolution(
      'combatantAgility * 10 + attackIndex',
    )));

    TestBed.configureTestingModule({
      providers: [
        CombatInitiativeOrderService,
        FormulaRuntimeService,
        { provide: FormulaService, useValue: formulas },
      ],
    });
    service = TestBed.inject(CombatInitiativeOrderService);
  });

  it('orders multiattack slots by DB-backed initiative formula and interleaves participants', async () => {
    const plan = await firstValueFrom(
      service.orderTurnSlots(
        participant(COMBAT_SIDE.initiator, 3, 2),
        participant(COMBAT_SIDE.defender, 5, 2),
      ),
    );

    expect(formulas.getAssignedFormula).toHaveBeenCalledOnceWith(COMBAT_INITIATIVE_SCORE_TARGET);
    expect(plan.slots.map((slot) => `${slot.side}:${slot.attackIndex}:${slot.initiativeScore}`))
      .toEqual([
        'defender:2:52',
        'defender:1:51',
        'initiator:2:32',
        'initiator:1:31',
      ]);
    expect(plan.formula.targetKey).toBe(COMBAT_INITIATIVE_SCORE_TARGET);
    expect(plan.explanation.tieBreaker).toContain('initiating side');
  });

  it('uses initiator tie-breaker when formula scores are equal', async () => {
    formulas.getAssignedFormula.and.returnValue(of(formulaResolution('10')));

    const plan = await firstValueFrom(
      service.orderTurnSlots(
        participant(COMBAT_SIDE.initiator, 3, 1),
        participant(COMBAT_SIDE.defender, 5, 1),
      ),
    );

    expect(plan.slots.map((slot) => slot.side)).toEqual([
      COMBAT_SIDE.initiator,
      COMBAT_SIDE.defender,
    ]);
  });

  it('supports random initiative formulas through formula runtime evaluation', async () => {
    spyOn(Math, 'random').and.returnValues(0.9, 0.1);
    formulas.getAssignedFormula.and.returnValue(of(formulaResolution('random(0, 100)')));

    const plan = await firstValueFrom(
      service.orderTurnSlots(
        participant(COMBAT_SIDE.initiator, 3, 1),
        participant(COMBAT_SIDE.defender, 5, 1),
      ),
    );

    expect(plan.slots.map((slot) => `${slot.side}:${slot.initiativeScore}`)).toEqual([
      'initiator:90',
      'defender:10',
    ]);
  });

  it('reports invalid initiative formula as configuration error', async () => {
    formulas.getAssignedFormula.and.returnValue(of(formulaResolution('missingValue + 1')));

    await expectAsync(firstValueFrom(
      service.orderTurnSlots(
        participant(COMBAT_SIDE.initiator, 3, 1),
        participant(COMBAT_SIDE.defender, 5, 1),
      ),
    )).toBeRejectedWithError(
      'Combat initiative formula is invalid: Unknown token in formula: missingValue.',
    );
  });
});

function participant(
  side: CombatInitiativeParticipantInput['side'],
  agility: number,
  attackCount: number,
): CombatInitiativeParticipantInput {
  return {
    side,
    stats: {
      intelligence: 4,
      agility,
    },
    attackPlan: {
      side,
      slots: Array.from({ length: attackCount }, (_, index) => ({
        side,
        slotIndex: index,
        initiativeScore: 0,
        source: {
          kind: COMBAT_ATTACK_SOURCE_KIND.unarmed,
          label: `${side} attack ${index + 1}`,
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

function formulaResolution(expression: string): FormulaAssignmentResolution {
  return {
    target: {
      id: 'target-1',
      key: COMBAT_INITIATIVE_SCORE_TARGET,
      scopeKey: 'combat',
      label: 'Combat initiative score',
      description: 'Orders combat attack slots.',
      allowedVariables: [
        'combatantIntelligence',
        'combatantAgility',
        'attackIndex',
        'attackCount',
      ],
      defaultTestContext: {},
      sortOrder: 10,
      createdAt: null,
    },
    formula: {
      id: 'formula-1',
      key: 'initiative',
      scopeKey: 'combat',
      label: 'Initiative',
      expression,
      description: 'Higher acts first.',
      isEnabled: true,
      createdAt: null,
      updatedAt: null,
    },
    assignment: {
      id: 'assignment-1',
      targetId: 'target-1',
      formulaId: 'formula-1',
      createdAt: null,
      updatedAt: null,
    },
    source: 'global',
  };
}
