import { FormulaAdminData, FormulaTarget } from '../../domain/formula/formula.model';
import { selectFormulaTesterTarget } from './formula-tester-target-selection';

describe('formula tester target selection', () => {
  it('prefers the formula assignment target over the previously selected tester target', () => {
    const data = formulaData();

    const target = selectFormulaTesterTarget({
      data,
      currentTargetId: 'target-trial-power',
      currentScope: 'exploration',
      expressionVariables: [
        'capPercent',
        'trialPower',
        'spirituality',
        'difficultyMultiplier',
        'districtModifier',
      ],
      formula: { id: 'formula-manifestation' },
      selectedTarget: data.targets[0],
    });

    expect(target?.key).toBe('trial_manifestation_chance');
  });

  it('does not keep a tester target that cannot expose unassigned formula variables', () => {
    const data = {
      ...formulaData(),
      assignments: [],
    };

    const target = selectFormulaTesterTarget({
      data,
      currentTargetId: 'target-trial-power',
      currentScope: 'exploration',
      expressionVariables: ['capPercent', 'trialPower'],
      formula: { id: 'formula-manifestation' },
      selectedTarget: data.targets[0],
    });

    expect(target?.key).toBe('trial_manifestation_chance');
  });
});

function formulaData(): FormulaAdminData {
  return {
    targets: [
      target('target-trial-power', 'trial_power', [
        'testedStatValue',
        'luck',
        'luckInfluence',
      ]),
      target('target-manifestation', 'trial_manifestation_chance', [
        'capPercent',
        'trialPower',
        'spirituality',
        'difficultyMultiplier',
        'districtModifier',
        'luck',
        'luckInfluence',
      ]),
    ],
    formulas: [],
    assignments: [
      {
        id: 'assignment-manifestation',
        targetId: 'target-manifestation',
        formulaId: 'formula-manifestation',
        createdAt: null,
        updatedAt: null,
      },
    ],
    entityAssignments: [],
    blocks: [],
  };
}

function target(
  id: string,
  key: string,
  allowedVariables: string[],
): FormulaTarget {
  return {
    id,
    key,
    scopeKey: 'exploration',
    label: key,
    description: null,
    allowedVariables,
    defaultTestContext: Object.fromEntries(
      allowedVariables.map((variable) => [variable, 0]),
    ),
    sortOrder: 10,
    createdAt: null,
  };
}
