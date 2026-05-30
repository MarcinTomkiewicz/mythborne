import {
  mapAccountEntryHeroContext,
  mapStartFlowHeroCreationResult,
  mapStartFlowHeroOptions,
  mapStartFlowOriginOption,
  mapStartFlowServerAvailability,
} from './start-flow-mappers';
import {
  AccountEntryHeroContextRow,
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

  it('maps camelCase sandbox hero options from DB JSON payloads', () => {
    const result = mapStartFlowHeroOptions([
      { heroId: 'hero-2', heroName: 'Second', createdAt: '2026-05-02T10:00:00Z' },
      { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
    ]);

    expect(result.map((hero) => hero.heroId)).toEqual(['hero-1', 'hero-2']);
    expect(result[1]).toEqual(jasmine.objectContaining({
      heroId: 'hero-2',
      heroName: 'Second',
      createdAt: '2026-05-02T10:00:00Z',
    }));
  });

  it('maps account-entry hero contexts from the player-safe JSON payload', () => {
    const result = mapAccountEntryHeroContext(accountEntryHeroContextRow());

    expect(result).toEqual({
      heroId: 'hero-1',
      serverId: 'server-1',
      serverKey: 'sandbox',
      serverName: 'Sandbox',
      heroName: 'Ariadne',
      heroLevel: 4,
      estateId: 'estate-1',
      districtCode: 'A',
      addressNumber: 3,
      address: 'legacy-address',
      addressLabel: 'A-3',
      createdAt: '2026-05-01T10:00:00Z',
      routeNextAction: 'hero_dashboard',
    });
  });

  it('preserves mapped heroes from server availability read model', () => {
    const result = mapStartFlowServerAvailability(serverAvailabilityRow({
      is_sandbox: true,
      can_enter_game: true,
      heroes_json: [
        { heroId: 'hero-1', heroName: 'First', createdAt: '2026-05-01T10:00:00Z' },
        { heroId: 'hero-2', heroName: 'Second', createdAt: '2026-05-02T10:00:00Z' },
      ],
    }));

    expect(result.heroes.map((hero) => hero.heroId)).toEqual(['hero-1', 'hero-2']);
  });

  it('maps DB-backed origin option display without local bonus calculation', () => {
    const result = mapStartFlowOriginOption(originOptionRow());

    expect(result).toEqual(jasmine.objectContaining({
      id: 'origin-1',
      originId: 'origin-1',
      key: 'nomad',
      name: 'Nomad',
      bonusSummaryText: '+5 Dexterity',
    }));
    expect(result.imageUrl).toContain('/storage/v1/render/image/public/assets/origins/nomad.png');
    expect(result.imageUrl).toContain('width=800&quality=80');
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

function accountEntryHeroContextRow(
  patch: Partial<AccountEntryHeroContextRow> = {},
): AccountEntryHeroContextRow {
  return {
    hero_id: 'hero-1',
    server_id: 'server-1',
    server_key: 'sandbox',
    server_name: 'Sandbox',
    hero_name: 'Ariadne',
    hero_level: 4,
    estate_id: 'estate-1',
    district_code: 'A',
    address_number: 3,
    address: 'legacy-address',
    address_label: 'A-3',
    created_at: '2026-05-01T10:00:00Z',
    route_next_action: 'hero_dashboard',
    hero_context_json: {
      heroId: 'hero-1',
      serverId: 'server-1',
      serverKey: 'sandbox',
      serverName: 'Sandbox',
      heroName: 'Ariadne',
      heroLevel: 4,
      estateId: 'estate-1',
      districtCode: 'A',
      addressNumber: 3,
      address: 'legacy-address',
      addressLabel: 'A-3',
      createdAt: '2026-05-01T10:00:00Z',
      routeNextAction: 'hero_dashboard',
    },
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
