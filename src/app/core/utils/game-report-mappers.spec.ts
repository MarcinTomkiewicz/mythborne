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
    expect(detail.itemReferences).toEqual([
      jasmine.objectContaining({
        sourceKind: 'reward_drop',
        sourceItemId: 'item-1',
        displayName: 'Fine Bronze Blade',
        qualityKey: 'fine',
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
          finalDamage: 12,
        }),
      ],
    }));
  });

  it('maps public report without private ids, access role, read state or hero ids', () => {
    const report = mapPublicGameReport(publicReportRow());

    expect(Object.keys(report).sort()).toEqual([
      'combatSection',
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
      'healthEnd',
      'healthStart',
      'level',
      'maxHealth',
      'participantKind',
      'side',
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
      'displayText',
      'evaded',
      'finalDamage',
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
      'displayName',
      'qualityKey',
      'sortOrder',
      'sourceKind',
    ].sort());
    expect(report.itemReferences[0] as unknown as Record<string, unknown>)
      .not.toEqual(jasmine.objectContaining({
        sourceItemId: jasmine.any(String),
        baseId: jasmine.any(String),
        prefixAffixId: jasmine.any(String),
        suffixAffixId: jasmine.any(String),
      }));
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

function publicReportRow(): GetPublicGameReportByTokenRpcRow {
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
      sortOrder: 10,
    },
  ];
}

function combatSectionJson(): Json {
  return {
    outcome: 'initiator_victory',
    turnsCompleted: 2,
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
