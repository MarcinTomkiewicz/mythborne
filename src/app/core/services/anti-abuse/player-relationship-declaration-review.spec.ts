import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { AntiAbuseDecisions } from './anti-abuse-decisions';
import { AntiAbuseDictionaries } from './anti-abuse-dictionaries';
import { PlayerRelationshipDeclarationReview } from './player-relationship-declaration-review';

describe('PlayerRelationshipDeclarationReview', () => {
  let backend: jasmine.SpyObj<Backend>;
  let decisions: jasmine.SpyObj<AntiAbuseDecisions>;
  let dictionaries: jasmine.SpyObj<AntiAbuseDictionaries>;
  let service: PlayerRelationshipDeclarationReview;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    decisions = jasmine.createSpyObj<AntiAbuseDecisions>('AntiAbuseDecisions', [
      'setRelationshipDeclarationDecision',
    ]);
    dictionaries = jasmine.createSpyObj<AntiAbuseDictionaries>(
      'AntiAbuseDictionaries',
      ['getActiveDeclarationTypes'],
    );

    dictionaries.getActiveDeclarationTypes.and.returnValue(of([activeDeclarationType()]));
    decisions.setRelationshipDeclarationDecision.and.returnValue(
      of({
        id: 'declaration-1',
        serverId: 'server-1',
        declarationTypeKey: 'shared_household',
        title: 'Shared household',
        status: 'approved',
        statusReason: 'Valid declaration.',
        adminNotes: 'Reviewed by staff.',
        playerNotes: 'Accepted.',
        reviewedAt: '2026-04-30T12:00:00.000Z',
        reviewedByUserId: 'staff-user-1',
        updatedAt: '2026-04-30T12:00:00.000Z',
      }),
    );
    backend.getAll.and.callFake(((options: { table: string }) => {
      switch (options.table) {
        case TABLES.player_relationship_declarations:
          return of([declarationRow()]);
        case TABLES.player_relationship_declaration_participants:
          return of([participantRow()]);
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
        PlayerRelationshipDeclarationReview,
        { provide: Backend, useValue: backend },
        { provide: AntiAbuseDecisions, useValue: decisions },
        { provide: AntiAbuseDictionaries, useValue: dictionaries },
      ],
    });
    service = TestBed.inject(PlayerRelationshipDeclarationReview);
  });

  it('loads server-scoped staff declaration detail with staff-only review fields', async () => {
    const detail = await firstValueFrom(
      service.getDeclarationForStaff({
        serverId: ' server-1 ',
        declarationId: ' declaration-1 ',
      }),
    );

    expect(detail).toEqual(
      jasmine.objectContaining({
        id: 'declaration-1',
        serverId: 'server-1',
        declarationTypeLabel: 'Shared household',
        declarationTypeAdminDescription: 'Staff declaration guidance.',
        statusLabel: 'Submitted',
        statusReason: 'Pending staff review.',
        adminNotes: 'Staff-only declaration note.',
        playerStatusMessage: 'Player-visible note.',
        createdByHeroId: 'hero-creator',
        createdByUserId: 'user-creator',
      }),
    );
    expect(detail.participants[0]).toEqual(
      jasmine.objectContaining({
        heroId: 'hero-1',
        userId: 'user-1',
      }),
    );
    expect(detail.items[0].itemId).toBe('item-1');
    expect(detail.trades[0].tradeReference).toBe('Trade #1');
  });

  it('queries base declaration by id and server before linked reads', async () => {
    await firstValueFrom(
      service.getDeclarationForStaff({
        serverId: 'server-1',
        declarationId: 'declaration-1',
      }),
    );

    const firstCall = backend.getAll.calls.first().args[0];

    expect(firstCall).toEqual(
      jasmine.objectContaining({
        table: TABLES.player_relationship_declarations,
        filters: {
          id: { operator: FilterOperator.EQ, value: 'declaration-1' },
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
        },
        camelCase: false,
      }),
    );
  });

  it('does not query linked rows when declaration is not found for selected server', async () => {
    backend.getAll.and.callFake(((options: { table: string }) => {
      if (options.table === TABLES.player_relationship_declarations) {
        return of([]);
      }

      return throwError(() => new Error(`Unexpected linked read: ${options.table}`));
    }) as Backend['getAll']);

    await expectAsync(
      firstValueFrom(
        service.getDeclarationForStaff({
          serverId: 'server-1',
          declarationId: 'declaration-1',
        }),
      ),
    ).toBeRejectedWithError(
      'Player relationship declaration not found for selected server.',
    );
    expect(backend.getAll).toHaveBeenCalledTimes(1);
  });

  it('loads labels for inactive declaration types referenced by a detail row', async () => {
    dictionaries.getActiveDeclarationTypes.and.returnValue(of([]));

    const detail = await firstValueFrom(
      service.getDeclarationForStaff({
        serverId: 'server-1',
        declarationId: 'declaration-1',
      }),
    );

    expect(detail.declarationTypeLabel).toBe('Archived relationship');
    expect(detail.declarationTypeAdminDescription).toBe('Archived staff guidance.');
    expect(backend.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({
        table: TABLES.player_relationship_declaration_types,
        filters: { key: { operator: FilterOperator.EQ, value: 'shared_household' } },
      }),
    );
  });

  it('sets staff declaration decision through canonical decision workflow after server check', async () => {
    const decision = await firstValueFrom(
      service.setDeclarationDecision({
        serverId: 'server-1',
        declarationId: 'declaration-1',
        status: 'approved',
        statusReason: ' Valid declaration. ',
        adminNotes: 'Reviewed by staff.',
        playerNotes: 'Accepted.',
      }),
    );

    expect(decision.status).toBe('approved');
    expect(decisions.setRelationshipDeclarationDecision).toHaveBeenCalledOnceWith({
      declarationId: 'declaration-1',
      status: 'approved',
      statusReason: ' Valid declaration. ',
      adminNotes: 'Reviewed by staff.',
      playerNotes: 'Accepted.',
    });
  });

  it('does not call decision workflow when declaration is not in selected server', async () => {
    backend.getAll.and.returnValue(of([]));

    await expectAsync(
      firstValueFrom(
        service.setDeclarationDecision({
          serverId: 'server-1',
          declarationId: 'declaration-1',
          status: 'rejected',
          statusReason: 'Missing evidence.',
        }),
      ),
    ).toBeRejectedWithError(
      'Player relationship declaration not found for selected server.',
    );
    expect(decisions.setRelationshipDeclarationDecision).not.toHaveBeenCalled();
  });

  it('requires stable server and declaration ids', () => {
    expect(() =>
      service.getDeclarationForStaff({
        serverId: '',
        declarationId: 'declaration-1',
      }),
    ).toThrowError('serverId is required for staff declaration review.');

    expect(() =>
      service.setDeclarationDecision({
        serverId: 'server-1',
        declarationId: ' ',
        status: 'revoked',
        statusReason: 'No longer valid.',
      }),
    ).toThrowError('declarationId is required for staff declaration review.');
  });
});

function activeDeclarationType() {
  return {
    key: 'shared_household',
    label: 'Shared household',
    description: 'Shared household declaration.',
    helperText: null,
    adminDescription: 'Staff declaration guidance.',
    category: 'relationship',
    sortOrder: 10,
    isActive: true,
    minParticipants: 2,
    maxParticipants: 4,
    requiresAmount: false,
    requiresExpiration: false,
    requiresTradeSelection: false,
    requiresItemSelection: false,
  };
}

function inactiveDeclarationTypeRow(): Row<'player_relationship_declaration_types'> {
  return {
    admin_description: 'Archived staff guidance.',
    category: 'relationship',
    created_at: '2026-04-30T00:00:00.000Z',
    created_by: null,
    description: 'Archived relationship declaration.',
    helper_text: null,
    id: 'declaration-type-1',
    is_active: false,
    key: 'shared_household',
    label: 'Archived relationship',
    max_participants: 4,
    min_participants: 2,
    requires_amount: false,
    requires_expiration: false,
    requires_item_selection: false,
    requires_trade_selection: false,
    sort_order: 10,
    updated_at: '2026-04-30T00:00:00.000Z',
    updated_by: null,
  };
}

function declarationRow(): Row<'player_relationship_declarations'> {
  return {
    admin_notes: 'Staff-only declaration note.',
    amount_character_points: null,
    completed_at: null,
    created_at: '2026-04-30T09:00:00.000Z',
    created_by_hero_id: 'hero-creator',
    created_by_user_id: 'user-creator',
    declaration_type_key: 'shared_household',
    description: 'We share a household.',
    expires_at: null,
    id: 'declaration-1',
    player_notes: 'Player-visible note.',
    reviewed_at: null,
    reviewed_by_user_id: null,
    revoked_at: null,
    server_id: 'server-1',
    starts_at: null,
    status: 'submitted',
    status_reason: 'Pending staff review.',
    submitted_at: '2026-04-30T09:00:00.000Z',
    title: 'Shared household',
    updated_at: '2026-04-30T09:30:00.000Z',
  };
}

function participantRow(): Row<'player_relationship_declaration_participants'> {
  return {
    created_at: '2026-04-30T09:00:00.000Z',
    created_by_user_id: 'user-creator',
    declaration_id: 'declaration-1',
    description: 'Primary participant.',
    hero_id: 'hero-1',
    id: 'participant-1',
    reason: 'Shared household.',
    role_key: 'participant',
    user_id: 'user-1',
  };
}

function itemRow(): Row<'player_relationship_declaration_items'> {
  return {
    created_at: '2026-04-30T09:00:00.000Z',
    created_by_user_id: 'user-creator',
    declaration_id: 'declaration-1',
    description: 'Related item.',
    id: 'item-link-1',
    item_id: 'item-1',
    item_name_snapshot: 'Old ring',
    reason: 'Shared item.',
    role_key: 'related',
  };
}

function tradeRow(): Row<'player_relationship_declaration_trades'> {
  return {
    created_at: '2026-04-30T09:00:00.000Z',
    created_by_user_id: 'user-creator',
    declaration_id: 'declaration-1',
    description: 'Related trade.',
    id: 'trade-link-1',
    reason: 'Shared trade.',
    role_key: 'related',
    trade_id: null,
    trade_reference: 'Trade #1',
  };
}
