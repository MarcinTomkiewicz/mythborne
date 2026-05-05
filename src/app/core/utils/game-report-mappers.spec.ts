import { Json } from '../types/database.types';
import {
  GameReportItemReferenceRow,
  GameReportParticipantRow,
  GameReportTypeRow,
  GetHeroGameReportDetailRpcRow,
  GetHeroGameReportsRpcRow,
  GetPublicGameReportByTokenRpcRow,
} from '../types/game-report-rpc.types';
import {
  mapGameReportItemReferenceRow,
  mapGameReportParticipantRow,
  mapGameReportType,
  mapPrivateGameReportDetail,
  mapPrivateGameReportListItem,
  mapPublicGameReport,
} from './game-report-mappers';

describe('game report mappers', () => {
  it('maps private list rows and derives unread state from readAt', () => {
    const item = mapPrivateGameReportListItem(privateListRow({
      read_at: null,
      is_unread: false,
    }));

    expect(item).toEqual(jasmine.objectContaining({
      reportId: 'report-1',
      publicToken: 'public-token-1',
      reportTypeKey: 'combat',
      reportTypeLabel: 'Combat',
      sourceEntityId: 'combat-result-1',
      readState: {
        accessRole: 'owner',
        readAt: null,
        isUnread: true,
      },
      participants: [
        jasmine.objectContaining({
          displayName: 'Hero One',
          participantRole: 'initiator',
          levelSnapshot: 7,
        }),
      ],
      itemReferencesCount: 2,
    }));
  });

  it('maps private detail with participants, item references and combat payload', () => {
    const detail = mapPrivateGameReportDetail(privateDetailRow());

    expect(detail.readState).toEqual({
      accessRole: 'participant',
      readAt: '2026-05-05T10:30:00.000Z',
      isUnread: false,
    });
    expect(detail.contextualReadiness).toBeNull();
    expect(detail.itemReferences).toEqual([
      jasmine.objectContaining({
        sourceKind: 'reward_drop',
        sourceItemId: 'item-1',
        displayName: 'Fine Bronze Blade',
        qualityKey: 'fine',
        displayDetails: [
          'Fine quality',
          'Bronze blade',
          'Dawn suffix',
        ],
      }),
    ]);
    expect(detail.combatSection).toEqual(jasmine.objectContaining({
      outcome: 'initiator_victory',
      turnsCompleted: 2,
      participants: [
        jasmine.objectContaining({
          side: 'initiator',
          displayName: 'Hero One',
          healthEnd: 18,
        }),
        jasmine.objectContaining({
          side: 'defender',
          displayName: 'Training Shade',
          healthEnd: 0,
        }),
      ],
      attacks: [
        jasmine.objectContaining({
          turnNumber: 1,
          actorSide: 'initiator',
          sourceLabel: 'Bronze blade',
          rolledDamage: 8,
          finalDamage: 12,
        }),
      ],
    }));
  });

  it('maps public report without private ids, access role, read state or hero ids', () => {
    const report = mapPublicGameReport(publicReportRow());

    expect(Object.keys(report).sort()).toEqual([
      'combatSection',
      'contextualReadiness',
      'createdAt',
      'itemReferences',
      'participants',
      'publicToken',
      'reportTypeDescription',
      'reportTypeKey',
      'reportTypeLabel',
      'sourceEntityType',
      'summary',
      'title',
    ].sort());
    expect(report).toEqual(jasmine.objectContaining({
      publicToken: 'public-token-1',
      reportTypeLabel: 'Combat',
      sourceEntityType: 'combat_result',
      contextualReadiness: null,
    }));
    expect(Object.keys(report.participants[0]).sort()).toEqual([
      'displayName',
      'levelSnapshot',
      'participantRole',
      'sideLabel',
      'sortOrder',
    ].sort());
    expect(report.participants[0] as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        heroId: jasmine.any(String),
        userId: jasmine.any(String),
      }),
    );
    expect(Object.keys(report.combatSection?.participants[0] ?? {}).sort()).toEqual([
      'displayName',
      'criticalChance',
      'criticalDamage',
      'defense',
      'evasionChance',
      'healthEnd',
      'healthStart',
      'level',
      'luck',
      'maxDamage',
      'maxHealth',
      'minDamage',
      'participantKind',
      'side',
      'stats',
    ].sort());
    expect(report.combatSection?.participants[0] as unknown as Record<string, unknown>)
      .not.toEqual(jasmine.objectContaining({
        heroId: jasmine.any(String),
        opponentDefinitionId: jasmine.any(String),
        combatParticipantId: jasmine.any(String),
      }));
    expect(Object.keys(report.combatSection?.attacks[0] ?? {}).sort()).toEqual([
      'actorSide',
      'attackOrder',
      'critical',
      'criticalDamage',
      'displayText',
      'evaded',
      'finalDamage',
      'rolledDamage',
      'sourceKind',
      'sourceLabel',
      'targetHealthAfter',
      'targetHealthBefore',
      'targetSide',
      'timingHit',
      'turnNumber',
    ].sort());
    expect(report.combatSection?.attacks[0] as unknown as Record<string, unknown>)
      .not.toEqual(jasmine.objectContaining({
        id: jasmine.any(String),
        combatAttackId: jasmine.any(String),
        sourceItemId: jasmine.any(String),
      }));
    expect(Object.keys(report.itemReferences[0]).sort()).toEqual([
      'displayDetails',
      'displayName',
      'qualityKey',
      'sortOrder',
      'sourceKind',
    ].sort());
    expect(report.itemReferences[0].displayDetails).toEqual([
      'Fine quality',
      'Bronze blade',
      'Dawn suffix',
    ]);
    expect(report.itemReferences[0] as unknown as Record<string, unknown>)
      .not.toEqual(jasmine.objectContaining({
        sourceItemId: jasmine.any(String),
        baseId: jasmine.any(String),
        prefixAffixId: jasmine.any(String),
        suffixAffixId: jasmine.any(String),
      }));
    expect(report.itemReferences[0].displayDetails.join(' ')).not.toContain('base-1');
    expect(report.itemReferences[0].displayDetails.join(' ')).not.toContain('suffix-1');
  });

  it('does not build item display details from raw component ids when safe details are absent', () => {
    const detail = mapPrivateGameReportDetail(privateDetailRow({
      item_references_json: [
        {
          sourceKind: 'reward_drop',
          sourceItemId: 'item-1',
          displayName: 'Fine Bronze Blade',
          qualityKey: 'fine',
          baseId: 'base-1',
          prefixAffixId: 'prefix-1',
          suffixAffixId: 'suffix-1',
          sortOrder: 10,
        },
      ],
    }));

    expect(detail.itemReferences[0].displayDetails).toEqual(['Quality fine']);
    expect(detail.itemReferences[0].displayDetails.join(' ')).not.toContain('base-1');
    expect(detail.itemReferences[0].displayDetails.join(' ')).not.toContain('prefix-1');
    expect(detail.itemReferences[0].displayDetails.join(' ')).not.toContain('suffix-1');
  });

  it('maps trial report details to safe producer readiness without raw runtime rows', () => {
    const detail = mapPrivateGameReportDetail(privateDetailRow({
      combat_section_json: null,
      item_references_json: [],
      participants_json: [],
      report_type_key: 'trial',
      report_type_label: 'Trial',
      source_entity_id: 'trial-result-1',
      source_entity_type: 'trial_result',
    }));

    expect(detail.contextualReadiness).toEqual({
      reportTypeKey: 'trial',
      title: 'Trial report producer pending',
      producerStatus: 'Waiting for completed trial result producer.',
      expectedSections: [
        'Trial outcome',
        'Reward summary',
        'Optional combat section',
        'Reward drop item references',
      ],
    });
    expect(detail.combatSection).toBeNull();
    expect(detail.itemReferences).toEqual([]);
    expect(JSON.stringify(detail.contextualReadiness)).not.toContain('trial_attempt');
    expect(JSON.stringify(detail.contextualReadiness)).not.toContain('exploration_graph');
  });

  it('maps public encounter reports to safe producer readiness', () => {
    const report = mapPublicGameReport(publicReportRow({
      combat_section_json: null,
      item_references_json: [],
      participants_json: [],
      report_type_key: 'encounter',
      report_type_label: 'Encounter',
      source_entity_type: 'encounter_result',
    }));

    expect(report.contextualReadiness).toEqual({
      reportTypeKey: 'encounter',
      title: 'Encounter report producer pending',
      producerStatus: 'Waiting for completed encounter result producer.',
      expectedSections: [
        'Encounter outcome',
        'Reward, resource or effect summary',
        'Optional combat section',
        'Reward drop item references',
      ],
    });
    expect(Object.keys(report).sort()).not.toContain('sourceEntityId');
    expect(JSON.stringify(report)).not.toContain('challenge_attempt');
    expect(JSON.stringify(report)).not.toContain('hero_exploration');
  });

  it('fails on snake_case participant payload instead of masking the JSON contract', () => {
    expect(() =>
      mapPrivateGameReportListItem(privateListRow({
        participants_json: [
          {
            display_name: 'Hero One',
            participant_role: 'initiator',
          },
        ],
      })),
    ).toThrowError('displayName must be a non-empty string.');
  });

  it('fails on malformed combat section payload', () => {
    expect(() =>
      mapPrivateGameReportDetail(privateDetailRow({
        combat_section_json: {
          outcome: 'initiator_victory',
          turnsCompleted: 2,
          participants: [],
        },
      })),
    ).toThrowError('attacks must be a JSON array.');
  });

  it('orders combat attacks by historical turn and attack order', () => {
    const combat = combatSectionJson() as Record<string, unknown>;
    combat['attacks'] = [
      {
        turnNumber: 2,
        attackOrder: 20,
        actorSide: 'defender',
        targetSide: 'initiator',
        sourceKind: 'natural',
        sourceLabel: 'Claws',
        timingHit: null,
        evaded: false,
        critical: false,
        criticalDamage: null,
        rolledDamage: 4,
        finalDamage: 4,
        targetHealthBefore: 18,
        targetHealthAfter: 14,
        displayText: 'Training Shade claws Hero One.',
      },
      {
        turnNumber: 1,
        attackOrder: 10,
        actorSide: 'initiator',
        targetSide: 'defender',
        sourceKind: 'item',
        sourceLabel: 'Bronze blade',
        timingHit: true,
        evaded: false,
        critical: true,
        criticalDamage: 12,
        rolledDamage: 8,
        finalDamage: 12,
        targetHealthBefore: 24,
        targetHealthAfter: 12,
        displayText: 'Hero One strikes Training Shade.',
      },
    ];

    const detail = mapPrivateGameReportDetail(privateDetailRow({
      combat_section_json: combat as Json,
    }));

    expect(detail.combatSection?.attacks.map((attack) => attack.turnNumber))
      .toEqual([1, 2]);
    expect(detail.combatSection?.attacks.map((attack) => attack.attackOrder))
      .toEqual([10, 20]);
  });

  it('maps dictionary and raw row helpers into explicit read models', () => {
    expect(mapGameReportType(reportTypeRow())).toEqual({
      key: 'combat',
      label: 'Combat',
      description: 'Combat report.',
      helperText: 'Review combat results.',
      sortOrder: 10,
      isActive: true,
    });
    expect(mapGameReportParticipantRow(participantRow())).toEqual({
      displayName: 'Hero One',
      participantRole: 'initiator',
      sideLabel: 'Initiator',
      levelSnapshot: 7,
      sortOrder: 10,
    });
    expect(mapGameReportItemReferenceRow(itemReferenceRow())).toEqual({
      sourceKind: 'reward_drop',
      sourceItemId: 'item-1',
      displayName: 'Fine Bronze Blade',
      qualityKey: 'fine',
      baseId: 'base-1',
      prefixAffixId: null,
      suffixAffixId: 'suffix-1',
      displayDetails: ['Quality fine'],
      sortOrder: 10,
    });
  });
});

function privateListRow(
  overrides: Partial<Omit<GetHeroGameReportsRpcRow, 'read_at'>> & {
    read_at?: string | null;
  } = {},
): GetHeroGameReportsRpcRow {
  return {
    access_role: 'owner',
    created_at: '2026-05-05T10:00:00.000Z',
    is_unread: true,
    item_references_count: 2,
    participants_json: participantsJson(),
    public_token: 'public-token-1',
    read_at: '2026-05-05T10:30:00.000Z',
    report_id: 'report-1',
    report_type_key: 'combat',
    report_type_label: 'Combat',
    source_entity_id: 'combat-result-1',
    source_entity_type: 'combat_result',
    summary: 'A training fight was completed.',
    title: 'Training combat',
    ...overrides,
  } as unknown as GetHeroGameReportsRpcRow;
}

function privateDetailRow(
  overrides: Partial<GetHeroGameReportDetailRpcRow> = {},
): GetHeroGameReportDetailRpcRow {
  return {
    ...privateListRow({
      access_role: 'participant',
      item_references_count: undefined,
    }),
    combat_section_json: combatSectionJson(),
    item_references_json: itemReferencesJson(),
    report_type_description: 'Combat report.',
    ...overrides,
  } as unknown as GetHeroGameReportDetailRpcRow;
}

function publicReportRow(
  overrides: Partial<GetPublicGameReportByTokenRpcRow> = {},
): GetPublicGameReportByTokenRpcRow {
  return {
    combat_section_json: combatSectionJson(),
    created_at: '2026-05-05T10:00:00.000Z',
    item_references_json: itemReferencesJson(),
    participants_json: participantsJson(),
    public_token: 'public-token-1',
    report_type_description: 'Combat report.',
    report_type_key: 'combat',
    report_type_label: 'Combat',
    source_entity_type: 'combat_result',
    summary: 'A training fight was completed.',
    title: 'Training combat',
    ...overrides,
  };
}

function participantsJson(): Json {
  return [
    {
      displayName: 'Hero One',
      heroId: 'hero-1',
      participantRole: 'initiator',
      sideLabel: 'Initiator',
      levelSnapshot: 7,
      sortOrder: 10,
    },
  ];
}

function itemReferencesJson(): Json {
  return [
    {
      sourceKind: 'reward_drop',
      sourceItemId: 'item-1',
      displayName: 'Fine Bronze Blade',
      qualityKey: 'fine',
      baseId: 'base-1',
      prefixAffixId: null,
      suffixAffixId: 'suffix-1',
      displayDetails: [
        'Fine quality',
        'Bronze blade',
        'Dawn suffix',
      ],
      sortOrder: 10,
    },
  ];
}

function combatSectionJson(): Json {
  return {
    sourceType: 'sandbox',
    outcome: 'initiator_victory',
    winnerSide: 'initiator',
    loserSide: 'defender',
    turnsCompleted: 2,
    startedAt: '2026-05-05T09:59:00.000Z',
    completedAt: '2026-05-05T10:00:00.000Z',
    participants: [
      {
        side: 'initiator',
        participantKind: 'hero',
        heroId: 'hero-1',
        displayName: 'Hero One',
        level: 7,
        healthStart: 30,
        healthEnd: 18,
        maxHealth: 30,
        defense: 4,
        minDamage: 5,
        maxDamage: 10,
        luck: 2,
        criticalChance: 0.15,
        criticalDamage: 1.5,
        evasionChance: 0.05,
        stats: [
          {
            statKey: 'strength',
            statValue: 7,
          },
        ],
      },
      {
        side: 'defender',
        participantKind: 'opponent',
        opponentDefinitionId: 'opponent-1',
        displayName: 'Training Shade',
        level: 6,
        healthStart: 24,
        healthEnd: 0,
        maxHealth: 24,
        defense: 2,
        minDamage: 3,
        maxDamage: 8,
        luck: 1,
        criticalChance: 0.05,
        criticalDamage: 1.25,
        evasionChance: 0.02,
        stats: [],
      },
    ],
    attacks: [
      {
        id: 'combat-attack-1',
        turnNumber: 1,
        attackOrder: 10,
        actorSide: 'initiator',
        targetSide: 'defender',
        sourceKind: 'item',
        sourceItemId: 'item-1',
        sourceLabel: 'Bronze blade',
        timingHit: true,
        evaded: false,
        critical: true,
        criticalDamage: 12,
        rolledDamage: 8,
        finalDamage: 12,
        targetHealthBefore: 24,
        targetHealthAfter: 12,
        displayText: 'Hero One strikes Training Shade.',
      },
    ],
  };
}

function reportTypeRow(): GameReportTypeRow {
  return {
    admin_description: 'Internal report type note.',
    created_at: '2026-05-05T10:00:00.000Z',
    description: 'Combat report.',
    helper_text: 'Review combat results.',
    is_active: true,
    key: 'combat',
    label: 'Combat',
    sort_order: 10,
    updated_at: '2026-05-05T10:00:00.000Z',
  };
}

function participantRow(): GameReportParticipantRow {
  return {
    created_at: '2026-05-05T10:00:00.000Z',
    display_name: 'Hero One',
    hero_id: 'hero-1',
    id: 'participant-1',
    level_snapshot: 7,
    participant_role: 'initiator',
    report_id: 'report-1',
    side_label: 'Initiator',
    sort_order: 10,
  };
}

function itemReferenceRow(): GameReportItemReferenceRow {
  return {
    base_id: 'base-1',
    created_at: '2026-05-05T10:00:00.000Z',
    display_name_fallback: 'Fine Bronze Blade',
    id: 'item-ref-1',
    prefix_affix_id: null,
    quality_key: 'fine',
    report_id: 'report-1',
    sort_order: 10,
    source_item_id: 'item-1',
    source_kind: 'reward_drop',
    suffix_affix_id: 'suffix-1',
  };
}
