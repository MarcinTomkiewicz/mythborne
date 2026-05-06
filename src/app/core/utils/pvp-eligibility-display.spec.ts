import { UiMetadataEntryReadModel } from '../domain/admin-ui-metadata.model';
import { Json } from '../types/database.types';
import { pvpEligibilityDisplay } from './pvp-eligibility-display';

describe('pvpEligibilityDisplay', () => {
  it('uses DB metadata for known reason keys and keeps the raw key secondary', () => {
    const display = pvpEligibilityDisplay({
      actionKind: 'attack',
      targetLevel: 12,
      metadataEntries: [
        metadataEntry('eligibility_reason.target_under_protection', 'DB protected', 'DB helper.'),
      ],
      eligibility: {
        canStart: false,
        blockReason: 'target_under_protection',
        travelTimeSeconds: 180,
        minTargetLevel: 8,
        maxTargetLevel: 16,
        attackerHasBlockingActivity: false,
      },
    });

    expect(display).toEqual({
      statusLabel: 'Unavailable',
      reasonLabel: 'DB protected',
      reasonDetail: 'DB helper.',
      rawReasonKey: 'target_under_protection',
    });
  });

  it('falls back to readable attack level range reasons without recomputing eligibility', () => {
    const display = pvpEligibilityDisplay({
      actionKind: 'attack',
      targetLevel: 4,
      metadataEntries: [],
      eligibility: {
        canStart: false,
        blockReason: 'target_below_level_range',
        travelTimeSeconds: 180,
        minTargetLevel: 8,
        maxTargetLevel: 16,
        attackerHasBlockingActivity: false,
      },
    });

    expect(display.reasonLabel).toBe('Target below level range');
    expect(display.reasonDetail).toBe(
      'Target level 4 is below your attack range 8-16.',
    );
    expect(display.rawReasonKey).toBe('target_below_level_range');
  });

  it('infers common attack blockers only when RPC returned disabled state without a key', () => {
    const display = pvpEligibilityDisplay({
      actionKind: 'attack',
      targetLevel: 12,
      metadataEntries: [],
      eligibility: {
        canStart: false,
        blockReason: null,
        travelTimeSeconds: 180,
        minTargetLevel: 8,
        maxTargetLevel: 16,
        attackerHasBlockingActivity: true,
      },
    });

    expect(display.reasonLabel).toBe('Attacker busy');
    expect(display.rawReasonKey).toBe('attacker_busy');
  });

  it('returns a compact available display when RPC says the action can start', () => {
    const display = pvpEligibilityDisplay({
      actionKind: 'spy',
      targetLevel: 12,
      metadataEntries: [],
      eligibility: {
        canStart: true,
        blockReason: null,
        travelTimeSeconds: 90,
      },
    });

    expect(display).toEqual({
      statusLabel: 'Available',
      reasonLabel: null,
      reasonDetail: null,
      rawReasonKey: null,
    });
  });
});

function metadataEntry(
  key: string,
  label: string,
  description: string | null,
): UiMetadataEntryReadModel {
  return {
    id: key,
    namespace: 'pvp_targeting_section',
    key,
    label,
    description,
    helperText: null,
    impactSummary: null,
    warningText: null,
    uiGroupKey: null,
    uiGroupLabel: null,
    sortOrder: 10,
    isActive: true,
    metadataJson: {} satisfies Json,
    createdAt: '2026-05-05T00:00:00.000Z',
    updatedAt: '2026-05-05T00:00:00.000Z',
  };
}
