import {
  mapStartFlowHeroCreationResult,
  mapStartFlowHeroOptions,
  mapStartFlowOriginOption,
  mapStartFlowServerAvailability,
} from './start-flow-mappers';
import {
  StartFlowCreateHeroRow,
  StartFlowOriginOptionRow,
  StartFlowServerAvailabilityRow,
} from '../domain/start-flow/start-flow.model';

describe('start flow mappers', () => {
  it('maps server availability without deriving capacity state in Angular', () => {
    const result = mapStartFlowServerAvailability(serverAvailabilityRow());

    expect(result).toEqual(jasmine.objectContaining({
      serverId: 'server-1',
      serverName: 'Standard',
      canCreateHero: false,
      blockReason: 'District A is full.',
      isDistrictAFull: true,
      districtAFree: 0,
    }));
    expect(JSON.stringify(result.heroesJson)).toBe('[{"heroId":"hero-1"}]');
  });

  it('maps DB-returned sandbox hero options without inventing hero rows', () => {
    const result = mapStartFlowHeroOptions([
      { hero_id: 'hero-2', hero_name: 'Second', created_at: '2026-05-02T10:00:00Z' },
      { hero_id: 'hero-1', hero_name: 'First', created_at: '2026-05-01T10:00:00Z' },
      { hero_id: '', hero_name: 'Broken' },
    ]);

    expect(result).toEqual([
      {
        heroId: 'hero-1',
        heroName: 'First',
        createdAt: '2026-05-01T10:00:00Z',
      },
      {
        heroId: 'hero-2',
        heroName: 'Second',
        createdAt: '2026-05-02T10:00:00Z',
      },
    ]);
  });

  it('maps DB-backed origin option display without local bonus calculation', () => {
    const result = mapStartFlowOriginOption(originOptionRow());

    expect(result).toEqual(jasmine.objectContaining({
      id: 'origin-1',
      originId: 'origin-1',
      key: 'nomad',
      name: 'Nomad',
      bonusSummaryText: '+5 Dexterity',
      imageUrl: '/images/origins/nomad.png',
    }));
    expect(JSON.stringify(result.bonusesJson)).toBe('[{"label":"+5 Dexterity"}]');
  });

  it('maps atomic hero creation result and preserves DB route handoff', () => {
    const result = mapStartFlowHeroCreationResult(heroCreationRow());

    expect(result).toEqual(jasmine.objectContaining({
      heroId: 'hero-1',
      characterPointsBalance: 1000,
      estateId: 'estate-1',
      districtCode: 'A',
      routeNextAction: 'stat_allocation',
      createdNewHero: true,
    }));
    expect(JSON.stringify(result.heroStatsJson)).toBe(
      '[{"statKey":"strength","value":1}]',
    );
    expect(JSON.stringify(result.resourcesJson)).toBe(
      '[{"resourceType":"materials","amount":0}]',
    );
  });
});

function serverAvailabilityRow(
  patch: Partial<StartFlowServerAvailabilityRow> = {},
): StartFlowServerAvailabilityRow {
  return {
    server_id: 'server-1',
    server_key: 'standard',
    server_name: 'Standard',
    server_kind: 'standard',
    server_status: 'live',
    description: 'Main server.',
    membership_status: 'active',
    is_visible: true,
    is_standard: true,
    is_sandbox: false,
    is_staff_context: false,
    can_enter_game: false,
    can_create_hero: false,
    next_action: 'blocked',
    block_reason: 'District A is full.',
    user_hero_count: 0,
    default_hero_id: '',
    default_hero_name: '',
    is_server_full: true,
    is_district_a_full: true,
    district_a_capacity: 100,
    district_a_occupied: 100,
    district_a_free: 0,
    heroes_json: [{ heroId: 'hero-1' }],
    eligibility_json: { reason: 'district_a_full' },
    ...patch,
  };
}

function originOptionRow(
  patch: Partial<StartFlowOriginOptionRow> = {},
): StartFlowOriginOptionRow {
  return {
    origin_id: 'origin-1',
    origin_key: 'nomad',
    origin_label: 'Nomad',
    origin_description: 'Road-born hunter.',
    sort_order: 10,
    is_active: true,
    bonuses_json: [{ label: '+5 Dexterity' }],
    bonus_summary_text: '+5 Dexterity',
    ...patch,
  };
}

function heroCreationRow(
  patch: Partial<StartFlowCreateHeroRow> = {},
): StartFlowCreateHeroRow {
  return {
    hero_id: 'hero-1',
    server_id: 'server-1',
    hero_name: 'Hero',
    origin_id: 'origin-1',
    origin_key: 'nomad',
    origin_label: 'Nomad',
    estate_id: 'estate-1',
    district_code: 'A',
    address_number: 42,
    address: 'A-42',
    character_points_balance: 1000,
    character_point_ledger_id: 'ledger-1',
    prestige_rank_number: 1,
    prestige_rank_name: 'Unproven',
    resources_json: [{ resourceType: 'materials', amount: 0 }],
    hero_stats_json: [{ statKey: 'strength', value: 1 }],
    route_next_action: 'stat_allocation',
    created_new_hero: true,
    audit_log_id: 'audit-1',
    ...patch,
  };
}
