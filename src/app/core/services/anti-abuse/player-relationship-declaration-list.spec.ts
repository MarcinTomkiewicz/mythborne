import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { PlayerRelationshipDeclarationTypeEntry } from '../../domain/anti-abuse/anti-abuse-dictionary.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { AntiAbuseDictionaries } from './anti-abuse-dictionaries';
import { PlayerRelationshipDeclarationList } from './player-relationship-declaration-list';

describe('PlayerRelationshipDeclarationList', () => {
  let backend: jasmine.SpyObj<Backend>;
  let dictionaries: jasmine.SpyObj<AntiAbuseDictionaries>;
  let service: PlayerRelationshipDeclarationList;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    dictionaries = jasmine.createSpyObj<AntiAbuseDictionaries>(
      'AntiAbuseDictionaries',
      ['getActiveDeclarationTypes'],
    );
    dictionaries.getActiveDeclarationTypes.and.returnValue(of([declarationType()]));
    backend.getAll.and.callFake(((opts: { table: string; filters?: Record<string, unknown> }) => {
      switch (opts.table) {
        case TABLES.player_relationship_declarations:
          return opts.filters && 'id' in opts.filters
            ? of([participantDeclarationRow(), userOnlyDeclarationRow()])
            : of([ownDeclarationRow()]);
        case TABLES.player_relationship_declaration_participants:
          return opts.filters && 'userId' in opts.filters
            ? of([userOnlyParticipantRow(), crossServerParticipantRow()])
            : of([participantRow()]);
        case TABLES.player_relationship_declaration_items:
          return of([itemRow()]);
        case TABLES.player_relationship_declaration_trades:
          return of([tradeRow()]);
        case TABLES.player_relationship_declaration_types:
          return of([inactiveDeclarationTypeRow()]);
        default:
          return of([]);
      }
    }) as Backend['getAll']);

    TestBed.configureTestingModule({
      providers: [
        PlayerRelationshipDeclarationList,
        { provide: Backend, useValue: backend },
        { provide: AntiAbuseDictionaries, useValue: dictionaries },
      ],
    });
    service = TestBed.inject(PlayerRelationshipDeclarationList);
  });

  it('loads player relevant declarations with linked participants, items and trades', async () => {
    const declarations = await firstValueFrom(
      service.getDeclarationsForPlayer({
        serverId: ' server-1 ',
        heroId: ' hero-1 ',
        userId: ' user-1 ',
      }),
    );

    expect(declarations.map((entry) => entry.id)).toEqual([
      'declaration-3',
      'declaration-2',
      'declaration-1',
    ]);
    expect(declarations[0]).toEqual(
      jasmine.objectContaining({
        declarationTypeLabel: 'Shared household',
        statusLabel: 'Submitted',
        playerStatusMessage: 'Visible through user participant.',
      }),
    );
    expect(declarations[1]).toEqual(
      jasmine.objectContaining({
        declarationTypeKey: 'archived_relationship',
        declarationTypeLabel: 'Archived relationship',
      }),
    );
    expect(declarations[1].participants[0].heroId).toBe('hero-1');
    expect(declarations[1].items[0].itemId).toBe('item-1');
    expect(declarations[1].trades[0].tradeReference).toBe('Trade #1');
  });

  it('queries declarations by selected server and active player context', async () => {
    await firstValueFrom(
      service.getDeclarationsForPlayer({
        serverId: ' server-1 ',
        heroId: ' hero-1 ',
        userId: ' user-1 ',
      }),
    );

    const calls = backend.getAll.calls.allArgs().map(([options]) => options);

    expect(calls[0]).toEqual(
      jasmine.objectContaining({
        table: TABLES.player_relationship_declarations,
        filters: {
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
          createdByHeroId: { operator: FilterOperator.EQ, value: 'hero-1' },
        },
        camelCase: false,
      }),
    );
    expect(calls.map((options) => options.table)).toContain(
      TABLES.player_relationship_declaration_participants,
    );
    expect(dictionaries.getActiveDeclarationTypes).toHaveBeenCalled();
  });

  it('includes declarations where the player is present only as a user participant', async () => {
    const declarations = await firstValueFrom(
      service.getDeclarationsForPlayer({
        serverId: 'server-1',
        heroId: 'hero-1',
        userId: 'user-1',
      }),
    );

    expect(declarations.map((entry) => entry.id)).toContain('declaration-3');
  });

  it('does not leak participant declarations from another selected server', async () => {
    const declarations = await firstValueFrom(
      service.getDeclarationsForPlayer({
        serverId: 'server-1',
        heroId: 'hero-1',
        userId: 'user-1',
      }),
    );
    const declarationReadCalls = backend.getAll.calls
      .allArgs()
      .map(([options]) => options)
      .filter((options) => options.table === TABLES.player_relationship_declarations);

    expect(declarations.map((entry) => entry.id)).not.toContain('declaration-cross');
    expect(declarationReadCalls[1]).toEqual(
      jasmine.objectContaining({
        filters: jasmine.objectContaining({
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
        }),
      }),
    );
  });

  it('does not expose staff-only status reason or admin notes in player models', async () => {
    const declarations = await firstValueFrom(
      service.getDeclarationsForPlayer({
        serverId: 'server-1',
        heroId: 'hero-1',
        userId: 'user-1',
      }),
    );

    expect(declarations[0] as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        adminNotes: jasmine.any(String),
        adminDescription: jasmine.any(String),
        statusReason: jasmine.any(String),
        userId: jasmine.any(String),
      }),
    );
    expect(declarations[1].participants[0] as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        userId: jasmine.any(String),
      }),
    );
  });

  it('loads labels for referenced inactive declaration types', async () => {
    const declarations = await firstValueFrom(
      service.getDeclarationsForPlayer({
        serverId: 'server-1',
        heroId: 'hero-1',
        userId: 'user-1',
      }),
    );

    expect(declarations.find((entry) => entry.id === 'declaration-2')).toEqual(
      jasmine.objectContaining({
        declarationTypeLabel: 'Archived relationship',
      }),
    );
    expect(backend.getAll.calls.allArgs().map(([options]) => options.table)).toContain(
      TABLES.player_relationship_declaration_types,
    );
  });

  it('requires server, hero and user ids', () => {
    expect(() =>
      service.getDeclarationsForPlayer({ serverId: '', heroId: 'hero-1', userId: 'user-1' }),
    ).toThrowError('serverId is required for player declaration list.');
    expect(() =>
      service.getDeclarationsForPlayer({ serverId: 'server-1', heroId: '', userId: 'user-1' }),
    ).toThrowError('heroId is required for player declaration list.');
    expect(() =>
      service.getDeclarationsForPlayer({ serverId: 'server-1', heroId: 'hero-1', userId: '' }),
    ).toThrowError('userId is required for player declaration list.');
  });
});

function declarationType(): PlayerRelationshipDeclarationTypeEntry {
  return {
    key: 'shared_household',
    label: 'Shared household',
    description: 'Shared household declaration.',
    helperText: null,
    adminDescription: 'Staff-only type context.',
    category: 'relationship',
    sortOrder: 10,
    isActive: true,
    minParticipants: 2,
    maxParticipants: 4,
    requiresAmount: false,
    requiresExpiration: false,
    requiresItemSelection: false,
    requiresTradeSelection: false,
  };
}

function inactiveDeclarationTypeRow(): Row<'player_relationship_declaration_types'> {
  return {
    admin_description: 'Staff-only archived type context.',
    category: 'relationship',
    created_at: '2026-04-30T09:00:00.000Z',
    created_by: null,
    description: 'Archived relationship declaration.',
    helper_text: null,
    id: 'declaration-type-2',
    is_active: false,
    key: 'archived_relationship',
    label: 'Archived relationship',
    max_participants: 4,
    min_participants: 2,
    requires_amount: false,
    requires_expiration: false,
    requires_item_selection: false,
    requires_trade_selection: false,
    sort_order: 20,
    updated_at: '2026-04-30T09:00:00.000Z',
    updated_by: null,
  };
}

function ownDeclarationRow(): Row<'player_relationship_declarations'> {
  return declarationRow({
    id: 'declaration-1',
    player_notes: 'Submitted for review.',
    status: 'submitted',
    updated_at: '2026-04-30T09:24:00.000Z',
  });
}

function participantDeclarationRow(): Row<'player_relationship_declarations'> {
  return declarationRow({
    id: 'declaration-2',
    declaration_type_key: 'archived_relationship',
    player_notes: 'Approved for players.',
    status: 'approved',
    updated_at: '2026-04-30T10:24:00.000Z',
  });
}

function userOnlyDeclarationRow(): Row<'player_relationship_declarations'> {
  return declarationRow({
    id: 'declaration-3',
    player_notes: 'Visible through user participant.',
    status: 'submitted',
    updated_at: '2026-04-30T11:24:00.000Z',
  });
}

function declarationRow(
  overrides: Partial<Row<'player_relationship_declarations'>>,
): Row<'player_relationship_declarations'> {
  return {
    admin_notes: 'Staff-only declaration note.',
    amount_character_points: null,
    completed_at: null,
    created_at: '2026-04-30T09:23:00.000Z',
    created_by_hero_id: 'hero-1',
    created_by_user_id: 'user-1',
    declaration_type_key: 'shared_household',
    description: 'Shared household declaration.',
    expires_at: null,
    id: 'declaration-1',
    player_notes: null,
    reviewed_at: null,
    reviewed_by_user_id: null,
    revoked_at: null,
    server_id: 'server-1',
    starts_at: null,
    status: 'submitted',
    status_reason: 'Staff-only status reason.',
    submitted_at: '2026-04-30T09:23:00.000Z',
    title: 'Shared household',
    updated_at: '2026-04-30T09:24:00.000Z',
    ...overrides,
  };
}

function participantRow(): Row<'player_relationship_declaration_participants'> {
  return {
    created_at: '2026-04-30T09:24:00.000Z',
    created_by_user_id: 'user-1',
    declaration_id: 'declaration-2',
    description: 'Sibling.',
    hero_id: 'hero-1',
    id: 'participant-1',
    reason: 'Same household.',
    role_key: 'related_player',
    user_id: 'user-1',
  };
}

function userOnlyParticipantRow(): Row<'player_relationship_declaration_participants'> {
  return {
    created_at: '2026-04-30T09:30:00.000Z',
    created_by_user_id: 'user-2',
    declaration_id: 'declaration-3',
    description: 'User-only participant link.',
    hero_id: null,
    id: 'participant-2',
    reason: 'Same account context.',
    role_key: 'related_user',
    user_id: 'user-1',
  };
}

function crossServerParticipantRow(): Row<'player_relationship_declaration_participants'> {
  return {
    created_at: '2026-04-30T09:31:00.000Z',
    created_by_user_id: 'user-3',
    declaration_id: 'declaration-cross',
    description: 'Other server participant link.',
    hero_id: null,
    id: 'participant-cross',
    reason: 'Other server.',
    role_key: 'related_user',
    user_id: 'user-1',
  };
}

function itemRow(): Row<'player_relationship_declaration_items'> {
  return {
    created_at: '2026-04-30T09:25:00.000Z',
    created_by_user_id: 'user-1',
    declaration_id: 'declaration-2',
    description: null,
    id: 'item-link-1',
    item_id: 'item-1',
    item_name_snapshot: 'Ancient sword',
    reason: null,
    role_key: 'related',
  };
}

function tradeRow(): Row<'player_relationship_declaration_trades'> {
  return {
    created_at: '2026-04-30T09:26:00.000Z',
    created_by_user_id: 'user-1',
    declaration_id: 'declaration-2',
    description: null,
    id: 'trade-link-1',
    reason: null,
    role_key: 'related',
    trade_id: 'trade-1',
    trade_reference: 'Trade #1',
  };
}
