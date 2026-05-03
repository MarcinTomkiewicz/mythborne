import { AntiAbuseSanctionTypeEntry } from '../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  createAntiAbuseSanctionFormModel,
  requiredSanctionFormFieldKeys,
  visibleSanctionFormFields,
} from './anti-abuse-sanction-form';

describe('anti-abuse sanction form model', () => {
  it('builds a base sanction form from DB dictionary metadata', () => {
    const model = createAntiAbuseSanctionFormModel(
      sanctionType({
        requiresSourceHero: false,
        requiresDurationDays: false,
        requiresCharacterPointsAmount: false,
        requiresItemSelection: false,
      }),
    );

    expect(model).toEqual(
      jasmine.objectContaining({
        sanctionTypeKey: 'warning',
        label: 'Warning',
        description: 'Issue a warning.',
        helperText: 'Use for minor confirmed issues.',
        adminDescription: 'Staff-only warning policy.',
      }),
    );
    expect(visibleSanctionFormFields(model).map((field) => field.key)).toEqual([
      'reason',
      'targetHeroId',
      'targetUserId',
    ]);
    expect(requiredSanctionFormFieldKeys(model)).toEqual([
      'reason',
      'targetHeroId',
      'targetUserId',
    ]);
  });

  it('requires full hero and account target even when the dictionary target flag is false', () => {
    const model = createAntiAbuseSanctionFormModel(
      sanctionType({
        requiresTargetHero: false,
      }),
    );

    expect(requiredSanctionFormFieldKeys(model)).toEqual([
      'reason',
      'targetHeroId',
      'targetUserId',
    ]);
    expect(model.fields.find((field) => field.key === 'targetHeroId')?.helperText)
      .toContain('server-scoped hero/account target search');
    expect(model.fields.find((field) => field.key === 'targetUserId')?.helperText)
      .toContain('matching account id');
  });

  it('shows duration for temporary suspension types', () => {
    const model = createAntiAbuseSanctionFormModel(
      sanctionType({
        key: 'temporary_suspension',
        label: 'Temporary suspension',
        requiresDurationDays: true,
      }),
    );

    expect(visibleSanctionFormFields(model).map((field) => field.key)).toEqual([
      'reason',
      'targetHeroId',
      'targetUserId',
      'durationDays',
    ]);
    expect(requiredSanctionFormFieldKeys(model)).toContain('durationDays');
  });

  it('shows Character Points amount for Character Point fine types', () => {
    const model = createAntiAbuseSanctionFormModel(
      sanctionType({
        key: 'character_point_fine',
        label: 'Character Point fine',
        requiresCharacterPointsAmount: true,
      }),
    );

    expect(visibleSanctionFormFields(model).map((field) => field.key)).toEqual([
      'reason',
      'targetHeroId',
      'targetUserId',
      'amountCharacterPoints',
    ]);
    expect(requiredSanctionFormFieldKeys(model)).toContain('amountCharacterPoints');
  });

  it('shows source hero and item selection for item sanction types', () => {
    const model = createAntiAbuseSanctionFormModel(
      sanctionType({
        key: 'item_return',
        label: 'Item return',
        requiresSourceHero: true,
        requiresItemSelection: true,
      }),
    );

    expect(visibleSanctionFormFields(model).map((field) => field.key)).toEqual([
      'reason',
      'targetHeroId',
      'targetUserId',
      'sourceHeroId',
      'itemIds',
    ]);
    expect(requiredSanctionFormFieldKeys(model)).toEqual([
      'reason',
      'targetHeroId',
      'targetUserId',
      'sourceHeroId',
      'itemIds',
    ]);
  });
});

function sanctionType(
  overrides: Partial<AntiAbuseSanctionTypeEntry> = {},
): AntiAbuseSanctionTypeEntry {
  return {
    key: 'warning',
    label: 'Warning',
    description: 'Issue a warning.',
    helperText: 'Use for minor confirmed issues.',
    adminDescription: 'Staff-only warning policy.',
    category: 'staff_action',
    sortOrder: 10,
    isActive: true,
    requiresReason: true,
    requiresTargetHero: true,
    requiresSourceHero: false,
    requiresDurationDays: false,
    requiresItemSelection: false,
    requiresCharacterPointsAmount: false,
    ...overrides,
  };
}
