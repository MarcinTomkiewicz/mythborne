import { PlayerAbuseReportTypeEntry } from '../domain/anti-abuse/anti-abuse-dictionary.model';
import {
  createPlayerAbuseReportFormModel,
  requiredAbuseReportFormFieldKeys,
  visibleAbuseReportFormFields,
} from './player-abuse-report-form';

describe('player abuse report form model', () => {
  it('builds a minimal player report form from DB dictionary metadata', () => {
    const model = createPlayerAbuseReportFormModel(
      reportType({
        requiresAccusedHero: false,
        requiresDescription: false,
        requiresItemSelection: false,
        requiresTradeSelection: false,
      }),
    );

    expect(model).toEqual(
      jasmine.objectContaining({
        reportTypeKey: 'scam',
        label: 'Scam',
        description: 'Report a scam.',
        helperText: 'Include clear evidence.',
      }),
    );
    expect(visibleAbuseReportFormFields(model).map((field) => field.key)).toEqual([
      'title',
      'description',
    ]);
    expect(requiredAbuseReportFormFieldKeys(model)).toEqual(['title', 'description']);
  });

  it('marks accused hero, description, items and trades visible only when DB flags require them', () => {
    const model = createPlayerAbuseReportFormModel(
      reportType({
        requiresAccusedHero: true,
        requiresDescription: true,
        requiresItemSelection: true,
        requiresTradeSelection: true,
      }),
    );

    expect(visibleAbuseReportFormFields(model).map((field) => field.key)).toEqual([
      'title',
      'description',
      'accusedHeroId',
      'relatedItemId',
      'relatedTradeId',
    ]);
    expect(requiredAbuseReportFormFieldKeys(model)).toEqual([
      'title',
      'description',
      'accusedHeroId',
      'relatedItemId',
      'relatedTradeId',
    ]);
  });

  it('does not expose staff-only admin description in the player form model', () => {
    const model = createPlayerAbuseReportFormModel(
      reportType({
        adminDescription: 'Staff-only triage guidance.',
      }),
    );

    expect(model as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        adminDescription: jasmine.any(String),
      }),
    );
  });
});

function reportType(
  overrides: Partial<PlayerAbuseReportTypeEntry> = {},
): PlayerAbuseReportTypeEntry {
  return {
    key: 'scam',
    label: 'Scam',
    description: 'Report a scam.',
    helperText: 'Include clear evidence.',
    adminDescription: 'Staff-only review policy.',
    category: 'trade',
    sortOrder: 10,
    isActive: true,
    requiresAccusedHero: true,
    requiresDescription: true,
    requiresItemSelection: false,
    requiresTradeSelection: true,
    ...overrides,
  };
}
