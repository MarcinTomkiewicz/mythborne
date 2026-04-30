import {
  mapCreatedPlayerRelationshipDeclaration,
  toCreatePlayerRelationshipDeclarationRpcArgs,
} from './player-relationship-declaration-rpc';

describe('player relationship declaration rpc mapper', () => {
  it('maps required declaration submission args and linked JSON rows', () => {
    const args = toCreatePlayerRelationshipDeclarationRpcArgs({
      serverId: ' server-1 ',
      declarationTypeKey: ' shared_household ',
      title: ' Shared household ',
      description: ' We share a household. ',
      createdByHeroId: ' hero-1 ',
      amountCharacterPoints: 25,
      startsAt: '2026-04-30T00:00:00.000Z',
      expiresAt: '2026-05-30T00:00:00.000Z',
      requestId: ' request-1 ',
      participants: [
        {
          heroId: ' hero-2 ',
          userId: ' user-2 ',
          roleKey: 'related_player',
          reason: 'Same household.',
          description: 'Sibling.',
        },
      ],
      items: [
        {
          itemId: ' item-1 ',
          itemNameSnapshot: 'Ancient sword',
          roleKey: 'shared_item',
        },
      ],
      trades: [
        {
          tradeId: ' trade-1 ',
          tradeReference: 'Trade #1',
          roleKey: 'related_trade',
        },
      ],
    });

    expect(args).toEqual(
      jasmine.objectContaining({
        p_server_id: 'server-1',
        p_declaration_type_key: 'shared_household',
        p_title: 'Shared household',
        p_description: 'We share a household.',
        p_created_by_hero_id: 'hero-1',
        p_amount_character_points: 25,
        p_starts_at: '2026-04-30T00:00:00.000Z',
        p_expires_at: '2026-05-30T00:00:00.000Z',
        p_request_id: 'request-1',
      }),
    );
    const payload = args as Record<string, unknown>;

    expect(payload['p_participants_json']).toEqual([
      {
        heroId: 'hero-2',
        userId: 'user-2',
        roleKey: 'related_player',
        reason: 'Same household.',
        description: 'Sibling.',
      },
    ]);
    expect(payload['p_items_json']).toEqual([
      {
        itemId: 'item-1',
        itemNameSnapshot: 'Ancient sword',
        roleKey: 'shared_item',
        reason: null,
        description: null,
      },
    ]);
    expect(payload['p_trades_json']).toEqual([
      {
        tradeId: 'trade-1',
        tradeReference: 'Trade #1',
        roleKey: 'related_trade',
        reason: null,
        description: null,
      },
    ]);
  });

  it('omits empty optional JSON arrays and trims request fields', () => {
    const args = toCreatePlayerRelationshipDeclarationRpcArgs({
      serverId: 'server-1',
      declarationTypeKey: 'shared_household',
      title: 'Shared household',
      description: 'We share a household.',
      createdByHeroId: 'hero-1',
      participants: [
        {
          heroId: '',
          userId: '',
          roleKey: '',
        },
      ],
      items: [{ itemId: '', itemNameSnapshot: '', roleKey: '' }],
      trades: [{ tradeId: '', tradeReference: '', roleKey: '' }],
      requestId: ' ',
    });

    expect(args as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        p_participants_json: jasmine.anything(),
        p_items_json: jasmine.anything(),
        p_trades_json: jasmine.anything(),
        p_request_id: jasmine.anything(),
      }),
    );
  });

  it('filters empty linked rows without sending them to the declaration RPC', () => {
    const args = toCreatePlayerRelationshipDeclarationRpcArgs({
      serverId: 'server-1',
      declarationTypeKey: 'shared_household',
      title: 'Shared household',
      description: 'We share a household.',
      createdByHeroId: 'hero-1',
      participants: [{ roleKey: 'related_player' }],
      items: [{ roleKey: 'related_item' }],
      trades: [{ roleKey: 'related_trade' }],
    });

    expect(args as Record<string, unknown>).not.toEqual(
      jasmine.objectContaining({
        p_participants_json: jasmine.anything(),
        p_items_json: jasmine.anything(),
        p_trades_json: jasmine.anything(),
      }),
    );
  });

  it('uses related as default role key for item and trade links with real data', () => {
    const args = toCreatePlayerRelationshipDeclarationRpcArgs({
      serverId: 'server-1',
      declarationTypeKey: 'shared_household',
      title: 'Shared household',
      description: 'We share a household.',
      createdByHeroId: 'hero-1',
      items: [{ itemId: 'item-1' }, { itemNameSnapshot: 'Legacy item' }],
      trades: [{ tradeId: 'trade-1' }, { tradeReference: 'Manual trade ref' }],
    }) as Record<string, unknown>;

    expect(args['p_items_json']).toEqual([
      {
        itemId: 'item-1',
        itemNameSnapshot: null,
        roleKey: 'related',
        reason: null,
        description: null,
      },
      {
        itemId: null,
        itemNameSnapshot: 'Legacy item',
        roleKey: 'related',
        reason: null,
        description: null,
      },
    ]);
    expect(args['p_trades_json']).toEqual([
      {
        tradeId: 'trade-1',
        tradeReference: null,
        roleKey: 'related',
        reason: null,
        description: null,
      },
      {
        tradeId: null,
        tradeReference: 'Manual trade ref',
        roleKey: 'related',
        reason: null,
        description: null,
      },
    ]);
  });

  it('validates required submission fields before RPC', () => {
    expect(() =>
      toCreatePlayerRelationshipDeclarationRpcArgs({
        serverId: '',
        declarationTypeKey: 'shared_household',
        title: 'Shared household',
        description: 'We share a household.',
        createdByHeroId: 'hero-1',
      }),
    ).toThrowError('serverId is required for relationship declaration submission.');
  });

  it('rejects negative Character Points amount instead of normalizing it to zero', () => {
    expect(() =>
      toCreatePlayerRelationshipDeclarationRpcArgs({
        serverId: 'server-1',
        declarationTypeKey: 'shared_household',
        title: 'Shared household',
        description: 'We share a household.',
        createdByHeroId: 'hero-1',
        amountCharacterPoints: -1,
      }),
    ).toThrowError(
      'p_amount_character_points must be a non-negative integer for relationship declaration submission.',
    );
  });

  it('maps created declaration RPC row', () => {
    expect(
      mapCreatedPlayerRelationshipDeclaration({
        declaration_id: 'declaration-1',
      }),
    ).toEqual({ declarationId: 'declaration-1' });
  });
});
