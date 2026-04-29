import { Row } from '../types/supabase.types';
import {
  mapAntiAbuseSignalType,
  mapAntiAbuseSanctionType,
  mapPlayerAbuseReportType,
  mapPlayerRelationshipDeclarationType,
} from './anti-abuse-dictionary';

describe('anti-abuse dictionary mappers', () => {
  it('maps DB-backed sanction type labels and requirements', () => {
    expect(mapAntiAbuseSanctionType(createSanctionTypeRow())).toEqual(
      jasmine.objectContaining({
        key: 'character_point_fine',
        label: 'Character point fine',
        description: 'Removes character points.',
        helperText: 'Use when abuse is confirmed.',
        adminDescription: 'Staff-only context.',
        requiresReason: true,
        requiresCharacterPointsAmount: true,
      }),
    );
  });

  it('maps player report and declaration dictionaries from DB rows', () => {
    expect(mapPlayerAbuseReportType(createReportTypeRow()).label).toBe('Scam');
    expect(mapPlayerRelationshipDeclarationType(createDeclarationTypeRow())).toEqual(
      jasmine.objectContaining({
        key: 'shared_household',
        label: 'Shared household',
        minParticipants: 2,
        maxParticipants: 4,
      }),
    );
  });

  it('maps anti-abuse signal types from DB rows', () => {
    expect(mapAntiAbuseSignalType(createSignalTypeRow())).toEqual(
      jasmine.objectContaining({
        key: 'trade_funnel',
        label: 'Trade funnel',
        defaultSeverity: 'warning',
        defaultScore: 25,
        defaultConfidence: 0.8,
      }),
    );
  });
});

function createSanctionTypeRow(): Row<'anti_abuse_sanction_types'> {
  return {
    admin_description: 'Staff-only context.',
    category: 'points',
    created_at: '2026-04-29T00:00:00.000Z',
    created_by: null,
    description: 'Removes character points.',
    helper_text: 'Use when abuse is confirmed.',
    id: 'type-1',
    is_active: true,
    key: 'character_point_fine',
    label: 'Character point fine',
    requires_character_points_amount: true,
    requires_duration_days: false,
    requires_item_selection: false,
    requires_reason: true,
    requires_source_hero: false,
    requires_target_hero: true,
    sort_order: 10,
    updated_at: '2026-04-29T00:00:00.000Z',
    updated_by: null,
  };
}

function createReportTypeRow(): Row<'player_abuse_report_types'> {
  return {
    admin_description: null,
    category: 'trade',
    created_at: '2026-04-29T00:00:00.000Z',
    created_by: null,
    description: 'Report a scam.',
    helper_text: null,
    id: 'report-type-1',
    is_active: true,
    key: 'scam',
    label: 'Scam',
    requires_accused_hero: true,
    requires_description: true,
    requires_item_selection: false,
    requires_trade_selection: true,
    sort_order: 10,
    updated_at: '2026-04-29T00:00:00.000Z',
    updated_by: null,
  };
}

function createDeclarationTypeRow(): Row<'player_relationship_declaration_types'> {
  return {
    admin_description: null,
    category: 'relationship',
    created_at: '2026-04-29T00:00:00.000Z',
    created_by: null,
    description: 'Shared household declaration.',
    helper_text: null,
    id: 'declaration-type-1',
    is_active: true,
    key: 'shared_household',
    label: 'Shared household',
    max_participants: 4,
    min_participants: 2,
    requires_amount: false,
    requires_expiration: false,
    requires_item_selection: false,
    requires_trade_selection: false,
    sort_order: 10,
    updated_at: '2026-04-29T00:00:00.000Z',
    updated_by: null,
  };
}

function createSignalTypeRow(): Row<'anti_abuse_signal_types'> {
  return {
    admin_description: 'Staff-only signal context.',
    category: 'trade',
    created_at: '2026-04-29T00:00:00.000Z',
    created_by: null,
    default_confidence: 0.8,
    default_score: 25,
    default_severity: 'warning',
    description: 'Potential trade funnel.',
    helper_text: 'Review trade graph.',
    id: 'signal-type-1',
    is_active: true,
    key: 'trade_funnel',
    label: 'Trade funnel',
    sort_order: 10,
    updated_at: '2026-04-29T00:00:00.000Z',
    updated_by: null,
  };
}
