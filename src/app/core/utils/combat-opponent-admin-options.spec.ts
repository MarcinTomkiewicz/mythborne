import { CombatOpponentAdminData } from '../domain/combat/combat-opponent.model';
import {
  combatOpponentScalingFormulaOptions,
  combatOpponentSlotOptions,
} from './combat-opponent-admin-options';

describe('combat opponent admin options', () => {
  it('maps active equipment slot definitions and excludes inactive slots', () => {
    expect(combatOpponentSlotOptions(adminData())).toEqual([
      { label: 'Main hand (main_hand)', value: 'main_hand' },
    ]);
  });

  it('returns no slot options when active equipment slots are missing', () => {
    expect(combatOpponentSlotOptions({
      ...adminData(),
      equipmentSlots: [],
    })).toEqual([]);
  });

  it('finds combat opponent scaling formulas through target scope and assignments', () => {
    expect(combatOpponentScalingFormulaOptions(adminData())).toEqual([
      { label: 'Default combat opponent scaling', value: null },
      { label: 'Combat scaling (combat-scaling)', value: 'formula-1' },
      { label: 'Assigned scaling (assigned-scaling)', value: 'formula-2' },
    ]);
  });
});

function adminData(): CombatOpponentAdminData {
  return {
    families: [],
    opponents: [],
    statValues: [],
    attackSources: [],
    equipmentEntries: [],
    equipmentModes: [],
    equipmentSlots: [
      {
        key: 'main_hand',
        label: 'Main hand',
        description: 'Main weapon.',
        helperText: null,
        adminDescription: null,
        equipmentArea: 'weapon',
        sortOrder: 10,
        isActive: true,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
      {
        key: 'legacy',
        label: 'Legacy',
        description: 'Inactive.',
        helperText: null,
        adminDescription: null,
        equipmentArea: 'legacy',
        sortOrder: 20,
        isActive: false,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      },
    ],
    stats: [],
    dictionaries: {
      sourceTypes: [],
      sides: [],
      outcomes: [],
      participantKinds: [],
      attackSourceKinds: [],
      candidateKinds: [],
    },
    formulas: [
      {
        id: 'formula-1',
        key: 'combat-scaling',
        scopeKey: 'combat',
        label: 'Combat scaling',
        expression: 'baseValue',
        description: null,
        isEnabled: true,
        createdAt: null,
        updatedAt: null,
      },
      {
        id: 'formula-2',
        key: 'assigned-scaling',
        scopeKey: 'other',
        label: 'Assigned scaling',
        expression: 'baseValue',
        description: null,
        isEnabled: true,
        createdAt: null,
        updatedAt: null,
      },
    ],
    formulaTargets: [
      {
        id: 'target-1',
        key: 'combat_opponent_scaled_stat',
        scopeKey: 'combat',
        label: 'Opponent scaling',
        description: null,
        allowedVariables: [],
        defaultTestContext: {},
        sortOrder: 10,
        createdAt: null,
      },
    ],
    assignments: [
      {
        id: 'assignment-1',
        targetId: 'target-1',
        formulaId: 'formula-2',
        createdAt: null,
        updatedAt: null,
      },
    ],
    opponentViews: [],
    emptyState: null,
  };
}
