import { PlayerRelationshipDeclarationTypeEntry } from '../domain/anti-abuse/anti-abuse-dictionary.model';
import { Row } from '../types/supabase.types';
import {
  mapPlayerRelationshipDeclarationItem,
  mapPlayerRelationshipDeclarationListItem,
  mapPlayerRelationshipDeclarationParticipant,
  mapPlayerRelationshipDeclarationTrade,
} from './player-relationship-declaration-view';

describe('player relationship declaration view mappers', () => {
  it('maps player-facing declaration list item without staff-only fields', () => {
    const item = mapPlayerRelationshipDeclarationListItem(declarationRow(), {
      declarationTypes: [declarationType()],
      participants: [mapPlayerRelationshipDeclarationParticipant(participantRow())],
      items: [mapPlayerRelationshipDeclarationItem(itemRow())],
      trades: [mapPlayerRelationshipDeclarationTrade(tradeRow())],
    });

    expect(item).toEqual(
      jasmine.objectContaining({
        id: 'declaration-1',
        declarationTypeKey: 'shared_household',
        declarationTypeLabel: 'Shared household',
        status: 'rejected',
        statusLabel: 'Rejected',
        playerStatusMessage: 'Player-visible note.',
      }),
    );
    expect(item.participants[0].heroId).toBe('hero-2');
    expect(item.items[0].itemNameSnapshot).toBe('Ancient sword');
    expect(item.trades[0].tradeReference).toBe('Trade #1');
    expect(item as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        adminNotes: jasmine.any(String),
        adminDescription: jasmine.any(String),
        statusReason: jasmine.any(String),
        userId: jasmine.any(String),
      }),
    );
    expect(item.participants[0] as unknown as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        userId: jasmine.any(String),
      }),
    );
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

function declarationRow(): Row<'player_relationship_declarations'> {
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
    player_notes: 'Player-visible note.',
    reviewed_at: '2026-04-30T10:00:00.000Z',
    reviewed_by_user_id: 'staff-1',
    revoked_at: null,
    server_id: 'server-1',
    starts_at: null,
    status: 'rejected',
    status_reason: 'Staff-only status reason.',
    submitted_at: '2026-04-30T09:23:00.000Z',
    title: 'Shared household',
    updated_at: '2026-04-30T10:00:00.000Z',
  };
}

function participantRow(): Row<'player_relationship_declaration_participants'> {
  return {
    created_at: '2026-04-30T09:24:00.000Z',
    created_by_user_id: 'user-1',
    declaration_id: 'declaration-1',
    description: 'Sibling.',
    hero_id: 'hero-2',
    id: 'participant-1',
    reason: 'Same household.',
    role_key: 'related_player',
    user_id: 'user-2',
  };
}

function itemRow(): Row<'player_relationship_declaration_items'> {
  return {
    created_at: '2026-04-30T09:25:00.000Z',
    created_by_user_id: 'user-1',
    declaration_id: 'declaration-1',
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
    declaration_id: 'declaration-1',
    description: null,
    id: 'trade-link-1',
    reason: null,
    role_key: 'related',
    trade_id: 'trade-1',
    trade_reference: 'Trade #1',
  };
}
