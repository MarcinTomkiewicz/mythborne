import { PlayerRelationshipDeclarationTypeEntry } from '../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  createPlayerRelationshipDeclarationFormModel,
  requiredDeclarationFormFieldKeys,
  visibleDeclarationFormFields,
} from './player-relationship-declaration-form';

describe('player relationship declaration form model', () => {
  it('builds a minimal declaration form from DB dictionary metadata', () => {
    const model = createPlayerRelationshipDeclarationFormModel(
      declarationType({
        requiresAmount: false,
        requiresExpiration: false,
        requiresItemSelection: false,
        requiresTradeSelection: false,
      }),
    );

    expect(model).toEqual(
      jasmine.objectContaining({
        declarationTypeKey: 'shared_household',
        label: 'Shared household',
        description: 'Declare shared household access.',
        helperText: 'Use this before shared market activity.',
        participantRules: {
          minParticipants: 2,
          maxParticipants: 4,
          helperText: '2-4 participant(s) are required.',
        },
      }),
    );
    expect(visibleDeclarationFormFields(model).map((field) => field.key)).toEqual([
      'title',
      'description',
      'participants',
    ]);
    expect(requiredDeclarationFormFieldKeys(model)).toEqual([
      'title',
      'description',
      'participants',
    ]);
  });

  it('does not expose staff-only admin description in the player form model', () => {
    const model = createPlayerRelationshipDeclarationFormModel(
      declarationType({
        adminDescription: 'Staff-only review policy.',
      }),
    );

    expect(model as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        adminDescription: jasmine.any(String),
      }),
    );
  });

  it('marks amount, expiration, items and trades visible only when DB flags require them', () => {
    const model = createPlayerRelationshipDeclarationFormModel(
      declarationType({
        requiresAmount: true,
        requiresExpiration: true,
        requiresItemSelection: true,
        requiresTradeSelection: true,
      }),
    );

    expect(visibleDeclarationFormFields(model).map((field) => field.key)).toEqual([
      'title',
      'description',
      'participants',
      'amountCharacterPoints',
      'expiresAt',
      'itemIds',
      'tradeIds',
    ]);
    expect(requiredDeclarationFormFieldKeys(model)).toEqual([
      'title',
      'description',
      'participants',
      'amountCharacterPoints',
      'expiresAt',
      'itemIds',
      'tradeIds',
    ]);
  });

  it('normalizes invalid participant ranges into stable form rules', () => {
    const model = createPlayerRelationshipDeclarationFormModel(
      declarationType({
        minParticipants: 0,
        maxParticipants: 0,
      }),
    );

    expect(model.participantRules).toEqual({
      minParticipants: 1,
      maxParticipants: 1,
      helperText: '1-1 participant(s) are required.',
    });
  });
});

function declarationType(
  overrides: Partial<PlayerRelationshipDeclarationTypeEntry> = {},
): PlayerRelationshipDeclarationTypeEntry {
  return {
    key: 'shared_household',
    label: 'Shared household',
    description: 'Declare shared household access.',
    helperText: 'Use this before shared market activity.',
    adminDescription: 'Staff can review this declaration later.',
    category: 'relationship',
    sortOrder: 10,
    isActive: true,
    minParticipants: 2,
    maxParticipants: 4,
    requiresAmount: false,
    requiresExpiration: false,
    requiresItemSelection: false,
    requiresTradeSelection: false,
    ...overrides,
  };
}
