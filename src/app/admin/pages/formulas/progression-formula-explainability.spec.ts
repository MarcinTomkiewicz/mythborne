import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import {
  BalanceFormula,
  FormulaAssignment,
  FormulaTarget,
} from '../../../core/domain/formula/formula.model';
import {
  FormulaTargetAssignmentRow,
} from '../../../core/types/formula-admin-view.types';
import {
  missingProgressionFormulaTargetKeys,
  progressionFormulaRows,
  ProgressionFormulaExplainability,
} from './progression-formula-explainability';

describe('ProgressionFormulaExplainability', () => {
  it('keeps progression formula target rows in the expected admin order', () => {
    const rows = [
      assignmentRow('building_upgrade_cost'),
      assignmentRow('hero_experience_to_next_level'),
      assignmentRow('hero_stat_level_cap'),
      assignmentRow('hero_stat_upgrade_cost'),
    ];

    expect(progressionFormulaRows(rows).map((row) => row.target.key)).toEqual([
      'hero_stat_upgrade_cost',
      'hero_stat_level_cap',
      'hero_experience_to_next_level',
    ]);
  });

  it('reports missing formula target keys explicitly', () => {
    expect(missingProgressionFormulaTargetKeys([
      assignmentRow('hero_stat_upgrade_cost'),
    ])).toEqual([
      'hero_stat_level_cap',
      'hero_experience_to_next_level',
    ]);
  });

  it('uses DB-backed metadata text and reports exact namespace/key gaps', () => {
    const explainability = new ProgressionFormulaExplainability(() => [
      metadataEntry({
        namespace: 'progression_configurator_section',
        key: 'page_header',
        label: 'Progression overview',
        description: 'DB-backed overview.',
      }),
      metadataEntry({
        namespace: 'progression_configurator_section',
        key: 'xp_current_vs_lifetime',
        label: 'XP fields',
        description: 'Current XP and lifetime XP are separate.',
      }),
    ]);

    expect(explainability.sectionTitle('page_header')).toBe('Progression overview');
    expect(explainability.sectionText('page_header')).toBe('DB-backed overview.');
    expect(explainability.explanationRows()[0]).toEqual(jasmine.objectContaining({
      label: 'XP fields',
      text: 'Current XP and lifetime XP are separate.',
    }));
    expect(explainability.missingGaps()).toContain(
      'progression_configurator_section/xp_to_next_level_formula',
    );
  });
});

function assignmentRow(key: string): FormulaTargetAssignmentRow {
  return {
    target: target(key),
    assignment: assignment(),
    formula: formula(),
    status: 'enabled',
    statusLabel: 'enabled assigned formula',
  };
}

function target(key: string): FormulaTarget {
  return {
    id: `${key}-target-id`,
    key,
    scopeKey: 'progression',
    label: key,
    description: `${key} target`,
    allowedVariables: ['level'],
    defaultTestContext: { level: 1 },
    sortOrder: 10,
    createdAt: null,
  };
}

function assignment(): FormulaAssignment {
  return {
    id: 'assignment-id',
    targetId: 'target-id',
    formulaId: 'formula-id',
    createdAt: null,
    updatedAt: null,
  };
}

function formula(): BalanceFormula {
  return {
    id: 'formula-id',
    key: 'formula-key',
    scopeKey: 'progression',
    label: 'Formula',
    expression: 'level * 10',
    description: 'Formula description',
    isEnabled: true,
    createdAt: null,
    updatedAt: null,
  };
}

function metadataEntry(input: {
  namespace: string;
  key: string;
  label: string;
  description: string;
}): UiMetadataEntryReadModel {
  return {
    id: `${input.namespace}/${input.key}`,
    namespace: input.namespace,
    key: input.key,
    label: input.label,
    description: input.description,
    helperText: null,
    impactSummary: null,
    warningText: null,
    uiGroupKey: null,
    uiGroupLabel: null,
    sortOrder: 10,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-03T00:00:00Z',
    updatedAt: '2026-05-03T00:00:00Z',
  };
}
