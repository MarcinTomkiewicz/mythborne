import { Row } from '../types/supabase.types';
import {
  GetMyPvpAttackResultRpcRow,
  GetMyPvpSpyResultRpcRow,
  GetPvpTargetCandidatesRpcRow,
  StartPvpActionRpcRow,
} from '../types/pvp-rpc.types';
import {
  mapAdminPvpAttackResult,
  mapAdminPvpRuntimeActivitySummary,
  mapAdminPvpSpyResult,
  mapPvpActionKind,
  mapPvpActionStartResult,
  mapPvpActionStatus,
  mapPvpAttackOutcomeKind,
  mapPvpAttackResult,
  mapPvpRuntimeActivitySummary,
  mapPvpSpyResult,
  mapPvpTargetCandidate,
} from './pvp-mappers';

describe('pvp mappers', () => {
  it('maps PvP dictionary rows with helper copy and behavior flags', () => {
    expect(mapPvpActionKind(actionKindRow())).toEqual(
      jasmine.objectContaining({
        key: 'attack',
        helperText: 'Travel to target.',
        adminDescription: 'Creates combat.',
        createsCombat: true,
        createsRuntimeActivity: true,
        createsSpyResult: false,
        isTravelAction: true,
      }),
    );
    expect(mapPvpActionStatus(actionStatusRow())).toEqual(
      jasmine.objectContaining({
        key: 'traveling',
        isBlocking: true,
        isTerminal: false,
      }),
    );
    expect(mapPvpAttackOutcomeKind(attackOutcomeRow())).toEqual(
      jasmine.objectContaining({
        key: 'attacker_won',
        label: 'Attacker won',
      }),
    );
  });

  it('maps target candidates with separate attack and spy eligibility', () => {
    const candidate = mapPvpTargetCandidate(targetCandidateRow({
      can_attack: false,
      attack_block_reason: 'target_under_protection',
      protection_expires_at: '2026-05-05T12:00:00.000Z',
      spy_block_reason: '',
      under_protection: true,
    }));

    expect(candidate).toEqual(
      jasmine.objectContaining({
        targetHeroId: 'target-hero-1',
        targetDisplayName: 'Target Hero',
        distanceScore: 7,
        underProtection: true,
        protectionExpiresAt: '2026-05-05T12:00:00.000Z',
      }),
    );
    expect(candidate.targetAddress).toEqual({
      estateId: 'target-estate-1',
      districtCode: 'agora',
      address: 'Agora 12',
      addressNumber: 12,
      estateRank: 3,
    });
    expect(candidate.attackEligibility).toEqual({
      canStart: false,
      blockReason: 'target_under_protection',
      travelTimeSeconds: 1800,
      minTargetLevel: 8,
      maxTargetLevel: 14,
      attackerHasBlockingActivity: false,
    });
    expect(candidate.spyEligibility).toEqual({
      canStart: true,
      blockReason: null,
      travelTimeSeconds: 900,
    });
  });

  it('maps start action and runtime activity rows without adding write behavior', () => {
    const action = mapPvpActionStartResult(startActionRow({
      manual_deadline_at: '',
      target_protection_id: '',
      target_protection_seconds: 0,
    }));
    const runtime = mapPvpRuntimeActivitySummary(pvpActionRow());
    const adminRuntime = mapAdminPvpRuntimeActivitySummary(pvpActionRow({
      metadata_json: { requestId: 'request-1' },
      request_id: 'request-1',
      reason: 'admin smoke',
    }));

    expect(action).toEqual(
      jasmine.objectContaining({
        pvpActionId: 'pvp-action-1',
        actionKind: 'attack',
        status: 'traveling',
        manualDeadlineAt: null,
        targetProtectionId: null,
        targetProtectionSeconds: 0,
      }),
    );
    expect(runtime.targetAddress).toEqual({
      estateId: 'target-estate-1',
      districtCode: 'agora',
      addressNumber: 12,
    });
    expect(adminRuntime).toEqual(
      jasmine.objectContaining({
        attackerHeroId: 'attacker-hero-1',
        reason: 'admin smoke',
        requestId: 'request-1',
        metadataJson: { requestId: 'request-1' },
      }),
    );
  });

  it('maps player spy results without leaking admin metadata', () => {
    const spy = mapPvpSpyResult(spyRpcRow({
      metadata_json: { antiAbuseSignal: 'hidden' },
      result_summary: '',
    }));

    expect(spy).toEqual(
      jasmine.objectContaining({
        spyResultId: 'spy-result-1',
        targetDisplayName: 'Target Hero',
        targetAddress: 'Agora 12',
        resultSummary: null,
      }),
    );
    expect(spy.snapshots.resources as unknown).toEqual({ drachma: 1000 });
    expect(JSON.stringify(spy)).not.toContain('antiAbuseSignal');
  });

  it('maps admin spy results with admin-only metadata separated', () => {
    const spy = mapAdminPvpSpyResult(spyTableRow({
      metadata_json: { antiAbuseSignal: 'visible-to-admin' },
      target_estate_id: 'target-estate-1',
    }));

    expect(spy.metadataJson as unknown).toEqual({
      antiAbuseSignal: 'visible-to-admin',
    });
    expect(spy.targetEstateId).toBe('target-estate-1');
  });

  it('maps player attack results while omitting admin metadata', () => {
    const attack = mapPvpAttackResult(attackRpcRow({
      metadata_json: { requestId: 'hidden' },
      notification_context_json: { actionUrl: '/game/pvp/results/attack-result-1' },
    }));

    expect(attack).toEqual(
      jasmine.objectContaining({
        attackResultId: 'attack-result-1',
        pvpActionId: 'pvp-action-1',
        combatOutcome: 'initiator_victory',
        outcomeKey: 'attacker_won',
        outcomeLabel: 'Attacker won',
        winnerHeroId: 'attacker-hero-1',
        loserHeroId: 'defender-hero-1',
      }),
    );
    expect(attack.attacker).toEqual({
      heroId: 'attacker-hero-1',
      levelSnapshot: 12,
    });
    expect(attack.resourceOutcome.raw as unknown).toEqual({ drachmaDelta: 120 });
    expect(attack.notificationContext.raw as unknown).toEqual({
      actionUrl: '/game/pvp/results/attack-result-1',
    });
    expect(JSON.stringify(attack)).not.toContain('requestId');
  });

  it('maps admin attack results with estate ids and metadata separated', () => {
    const attack = mapAdminPvpAttackResult(attackTableRow({
      metadata_json: { requestId: 'request-1' },
      attacker_estate_id: 'attacker-estate-1',
      defender_estate_id: 'defender-estate-1',
    }), 'Attacker won');

    expect(attack).toEqual(
      jasmine.objectContaining({
        outcomeLabel: 'Attacker won',
        attackerEstateId: 'attacker-estate-1',
        defenderEstateId: 'defender-estate-1',
        metadataJson: { requestId: 'request-1' },
      }),
    );
  });
});

function actionKindRow(
  overrides: Partial<Row<'pvp_action_kinds'>> = {},
): Row<'pvp_action_kinds'> {
  return {
    admin_description: 'Creates combat.',
    created_at: '2026-05-05T10:00:00.000Z',
    creates_combat: true,
    creates_runtime_activity: true,
    creates_spy_result: false,
    description: 'Attack another hero.',
    helper_text: 'Travel to target.',
    is_active: true,
    is_travel_action: true,
    key: 'attack',
    label: 'Attack',
    sort_order: 10,
    updated_at: '2026-05-05T10:00:00.000Z',
    ...overrides,
  };
}

function actionStatusRow(
  overrides: Partial<Row<'pvp_action_statuses'>> = {},
): Row<'pvp_action_statuses'> {
  return {
    admin_description: null,
    created_at: '2026-05-05T10:00:00.000Z',
    description: 'Action is traveling.',
    helper_text: null,
    is_active: true,
    is_blocking: true,
    is_terminal: false,
    key: 'traveling',
    label: 'Traveling',
    sort_order: 10,
    updated_at: '2026-05-05T10:00:00.000Z',
    ...overrides,
  };
}

function attackOutcomeRow(
  overrides: Partial<Row<'pvp_attack_outcome_kinds'>> = {},
): Row<'pvp_attack_outcome_kinds'> {
  return {
    admin_description: null,
    created_at: '2026-05-05T10:00:00.000Z',
    description: 'Attacker won.',
    helper_text: null,
    is_active: true,
    key: 'attacker_won',
    label: 'Attacker won',
    sort_order: 10,
    updated_at: '2026-05-05T10:00:00.000Z',
    ...overrides,
  };
}

function targetCandidateRow(
  overrides: Partial<GetPvpTargetCandidatesRpcRow> = {},
): GetPvpTargetCandidatesRpcRow {
  return {
    attack_block_reason: '',
    attack_max_target_level: 14,
    attack_min_target_level: 8,
    attack_travel_time_seconds: 1800,
    attacker_has_blocking_activity: false,
    can_attack: true,
    can_spy: true,
    distance_score: 7,
    protection_expires_at: '',
    spy_block_reason: '',
    spy_travel_time_seconds: 900,
    target_address: 'Agora 12',
    target_address_number: 12,
    target_display_name: 'Target Hero',
    target_district_code: 'agora',
    target_estate_id: 'target-estate-1',
    target_estate_rank: 3,
    target_hero_id: 'target-hero-1',
    target_level: 10,
    under_protection: false,
    ...overrides,
  };
}

function startActionRow(
  overrides: Partial<StartPvpActionRpcRow> = {},
): StartPvpActionRpcRow {
  return {
    action_kind: 'attack',
    arrives_at: '2026-05-05T10:30:00.000Z',
    attack_travel_time_seconds: 1800,
    attacker_estate_id: 'attacker-estate-1',
    attacker_hero_id: 'attacker-hero-1',
    distance_score: 7,
    manual_deadline_at: '2026-05-05T10:35:00.000Z',
    manual_fight_window_seconds: 300,
    pvp_action_id: 'pvp-action-1',
    runtime_activity_id: 'runtime-1',
    server_id: 'server-1',
    spy_travel_time_seconds: 900,
    started_at: '2026-05-05T10:00:00.000Z',
    status: 'traveling',
    target_estate_id: 'target-estate-1',
    target_hero_id: 'target-hero-1',
    target_protection_id: 'protection-1',
    target_protection_seconds: 3600,
    travel_time_seconds: 1800,
    ...overrides,
  };
}

function pvpActionRow(
  overrides: Partial<Row<'pvp_actions'>> = {},
): Row<'pvp_actions'> {
  return {
    action_kind: 'attack',
    arrives_at: '2026-05-05T10:30:00.000Z',
    attack_travel_time_seconds: 1800,
    attacker_address_number_snapshot: 2,
    attacker_district_code_snapshot: 'agora',
    attacker_estate_id: 'attacker-estate-1',
    attacker_hero_id: 'attacker-hero-1',
    attacker_level_snapshot: 12,
    created_at: '2026-05-05T10:00:00.000Z',
    distance_score: 7,
    id: 'pvp-action-1',
    manual_deadline_at: '2026-05-05T10:35:00.000Z',
    manual_fight_window_seconds: 300,
    metadata_json: {},
    reason: null,
    request_id: null,
    resolved_at: null,
    runtime_activity_id: 'runtime-1',
    server_id: 'server-1',
    spy_travel_time_seconds: 900,
    started_at: '2026-05-05T10:00:00.000Z',
    status: 'traveling',
    target_address_number_snapshot: 12,
    target_district_code_snapshot: 'agora',
    target_estate_id: 'target-estate-1',
    target_hero_id: 'target-hero-1',
    target_level_snapshot: 10,
    target_protection_id: null,
    target_protection_seconds: null,
    travel_time_seconds: 1800,
    updated_at: '2026-05-05T10:00:00.000Z',
    ...overrides,
  };
}

function spyRpcRow(
  overrides: Partial<GetMyPvpSpyResultRpcRow> = {},
): GetMyPvpSpyResultRpcRow {
  return {
    base_stats_snapshot_json: { strength: 10 },
    buildings_snapshot_json: [{ key: 'mansion', level: 4 }],
    created_at: '2026-05-05T11:00:00.000Z',
    derived_combat_stats_json: { attack: 20 },
    equipment_snapshot_json: [],
    estate_snapshot_json: { rank: 3 },
    metadata_json: {},
    pvp_action_id: 'pvp-action-1',
    resources_snapshot_json: { drachma: 1000 },
    result_summary: 'Scouted target.',
    server_id: 'server-1',
    spy_hero_id: 'spy-hero-1',
    spy_level_snapshot: 12,
    spy_result_id: 'spy-result-1',
    target_address_snapshot: 'Agora 12',
    target_display_name_snapshot: 'Target Hero',
    target_hero_id: 'target-hero-1',
    target_level_snapshot: 10,
    visibility_key: 'standard',
    ...overrides,
  };
}

function spyTableRow(
  overrides: Partial<Row<'pvp_spy_results'>> = {},
): Row<'pvp_spy_results'> {
  return {
    ...spyRpcRow(),
    id: 'spy-result-1',
    spy_estate_id: 'spy-estate-1',
    target_address_number_snapshot: 12,
    target_district_code_snapshot: 'agora',
    target_estate_id: null,
    target_address_snapshot: 'Agora 12',
    result_summary: 'Scouted target.',
    ...overrides,
  };
}

function attackRpcRow(
  overrides: Partial<GetMyPvpAttackResultRpcRow> = {},
): GetMyPvpAttackResultRpcRow {
  return {
    attack_result_id: 'attack-result-1',
    attacker_hero_id: 'attacker-hero-1',
    attacker_level_snapshot: 12,
    combat_outcome: 'initiator_victory',
    combat_result_id: 'combat-result-1',
    created_at: '2026-05-05T11:00:00.000Z',
    defender_hero_id: 'defender-hero-1',
    defender_level_snapshot: 10,
    level_difference: 2,
    loser_hero_id: 'defender-hero-1',
    metadata_json: {},
    notification_context_json: {},
    outcome_key: 'attacker_won',
    outcome_label: 'Attacker won',
    prestige_context_json: { prestigeDelta: 1 },
    pvp_action_id: 'pvp-action-1',
    report_context_json: { reportId: 'report-1' },
    resource_outcome_json: { drachmaDelta: 120 },
    reward_context_json: { xp: 50 },
    server_id: 'server-1',
    winner_hero_id: 'attacker-hero-1',
    ...overrides,
  };
}

function attackTableRow(
  overrides: Partial<Row<'pvp_attack_results'>> = {},
): Row<'pvp_attack_results'> {
  return {
    ...attackRpcRow(),
    id: 'attack-result-1',
    attacker_estate_id: null,
    defender_estate_id: null,
    ...overrides,
  };
}
