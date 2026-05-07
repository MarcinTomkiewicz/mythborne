import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  GetHeroArmoryItemDetailRpcRow,
  GetHeroArmoryItemsRpcRow,
  GetHeroArmoryVisibilityStateRpcRow,
  MoveHeroArmoryItemToShelfRpcRow,
  RenameHeroArmoryShelfRpcRow,
} from '../../types/item-equipment-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerArmory } from './player-armory';

describe('PlayerArmory', () => {
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let backend: jasmine.SpyObj<Backend>;
  let service: PlayerArmory;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', [
      'requireActiveHero',
    ]);
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'getAll',
      'rpc',
      'create',
      'update',
      'delete',
      'upsert',
    ]);

    activeHero.requireActiveHero.and.returnValue(of({
      heroRow: { id: 'hero-1' } as never,
      heroId: 'hero-1',
      hero: {} as never,
      userId: 'user-1',
      serverId: 'server-1',
      server: {} as never,
    }));
    backend.rpc.and.callFake(<T>(rpcName: string): Observable<T> => {
      if (rpcName === RPC.get_hero_armory_visibility_state) {
        return of([visibilityRow()] as T);
      }

      if (rpcName === RPC.get_hero_armory_items) {
        return of([
          armoryItemRow({
            item_id: 'item-2',
            item_name: 'Trade locked ring',
            item_status: 'locked_trade',
            armory_shelf_position: 2,
            shelf_name: 'Materials',
          }),
          armoryItemRow({
            item_id: 'item-1',
            item_name: 'Bronze blade',
            armory_shelf_position: 0,
            is_unsorted: true,
            shelf_name: 'Unsorted',
          }),
        ] as T);
      }

      if (rpcName === RPC.get_hero_armory_item_detail) {
        return of([armoryItemDetailRow()] as T);
      }

      if (rpcName === RPC.rename_hero_armory_shelf) {
        return of([renameShelfRow()] as T);
      }

      if (rpcName === RPC.move_hero_armory_item_to_shelf) {
        return of([moveItemRow()] as T);
      }

      return of([] as T);
    });

    TestBed.configureTestingModule({
      providers: [
        PlayerArmory,
        { provide: ActiveHero, useValue: activeHero },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(PlayerArmory);
  });

  it('loads armory visibility and item rows through canonical RPCs', async () => {
    const result = await firstValueFrom(service.getArmory());

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_hero_armory_visibility_state,
      { p_hero_id: 'hero-1' },
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_hero_armory_items,
      { p_hero_id: 'hero-1' },
    );
    expect(backend.getAll).not.toHaveBeenCalled();
    expect(result.shelves.length).toBe(11);
    expect(result.shelves[0]).toEqual(jasmine.objectContaining({
      position: 0,
      name: 'Unsorted',
      isUnsortedDropArea: true,
    }));
    expect(result.shelves[1]).toEqual(jasmine.objectContaining({
      position: 1,
      name: 'Shelf 1',
      isUnsortedDropArea: false,
    }));
    expect(result.shelves[1].isUnsortedDropArea).toBeFalse();
    expect(result.shelves[2].visibleItems[0].itemId).toBe('item-2');
    expect(result.shelves[2].visibleItems[0].lifecycleStatus).toBe('locked_trade');
    expect(result.visibility).toEqual(jasmine.objectContaining({
      totalOwnedItemCount: 5,
      visibleItemCount: 2,
      hiddenItemCount: 3,
      visibilityLimit: 2,
      visibilityLimitSource: 'visible_item_capacity',
      visibleStatuses: ['active', 'locked_trade', 'locked_auction'],
    }));
    expect(JSON.stringify(backend.rpc.calls.allArgs())).not.toContain('user-1');
  });

  it('does not mutate item/equipment tables', async () => {
    await firstValueFrom(service.getArmory());

    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });

  it('loads item detail through canonical RPC using active hero id', async () => {
    const result = await firstValueFrom(service.getArmoryItemDetail('item-1'));

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_hero_armory_item_detail,
      {
        p_hero_id: 'hero-1',
        p_item_id: 'item-1',
      },
    );
    expect(result.itemStats).toEqual([{
      label: 'Damage',
      displayValue: '2-9',
    }]);
    expect(result.baseTypeKey).toBe('one_handed_weapon');
    expect(result.drachmaValue).toBe(300);
    expect(result.bonuses.map((bonus) => bonus.label)).toEqual([
      'Maximum damage',
      'Critical chance',
    ]);
    expect(JSON.stringify(backend.rpc.calls.allArgs())).not.toContain('user-1');
    expect(backend.getAll).not.toHaveBeenCalled();
  });

  it('preserves the visibility_limit returned by the DB/RPC read model', async () => {
    backend.rpc.and.callFake(<T>(rpcName: string): Observable<T> => {
      if (rpcName === RPC.get_hero_armory_visibility_state) {
        return of([visibilityRow({ visibility_limit: 123 })] as T);
      }

      if (rpcName === RPC.get_hero_armory_items) {
        return of([] as T);
      }

      return of([] as T);
    });

    const result = await firstValueFrom(service.getArmory());

    expect(result.visibility.visibilityLimit).toBe(123);
    expect(result.visibility.visibilityLimitSource).toBe('visible_item_capacity');
  });

  it('renames shelves through the canonical RPC using active hero id', async () => {
    await firstValueFrom(service.renameShelf({
      shelfPosition: 2,
      newName: 'Materials',
    }));

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.rename_hero_armory_shelf,
      {
        p_hero_id: 'hero-1',
        p_new_name: 'Materials',
        p_shelf_position: 2,
      },
    );
    expect(JSON.stringify(backend.rpc.calls.allArgs())).not.toContain('user-1');
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });

  it('rejects DB-declared shelf rename failure before refreshing', async () => {
    backend.rpc.and.callFake(<T>(rpcName: string): Observable<T> => {
      if (rpcName === RPC.rename_hero_armory_shelf) {
        return of([
          {
            ...renameShelfRow(),
            success: false,
            reason: 'shelf_locked',
            message: 'Shelf rename denied.',
          },
        ] as T);
      }

      if (rpcName === RPC.get_hero_armory_visibility_state) {
        return of([visibilityRow()] as T);
      }

      if (rpcName === RPC.get_hero_armory_items) {
        return of([] as T);
      }

      return of([] as T);
    });

    await expectAsync(firstValueFrom(service.renameShelf({
      shelfPosition: 2,
      newName: 'Materials',
    }))).toBeRejectedWithError('Shelf rename denied.');

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.rename_hero_armory_shelf,
      jasmine.anything(),
    );
    expect(backend.rpc).not.toHaveBeenCalledWith(
      RPC.get_hero_armory_visibility_state,
      jasmine.anything(),
    );
    expect(backend.rpc).not.toHaveBeenCalledWith(
      RPC.get_hero_armory_items,
      jasmine.anything(),
    );
  });

  it('rejects blank shelf names and unsorted shelf rename before RPC', async () => {
    expect(() => service.renameShelf({
      shelfPosition: 1,
      newName: ' ',
    })).toThrowError('newName is required for armory RPC.');

    expect(() => service.renameShelf({
      shelfPosition: 0,
      newName: 'Unsorted',
    })).toThrowError(
      'shelfPosition must be an integer from 1 to 10.',
    );

    expect(backend.rpc).not.toHaveBeenCalledWith(
      RPC.rename_hero_armory_shelf,
      jasmine.anything(),
    );
  });

  it('moves armory items through canonical RPC and supports target shelf zero', async () => {
    await firstValueFrom(service.moveItemToShelf({
      itemId: 'item-1',
      targetShelfPosition: 0,
    }));

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.move_hero_armory_item_to_shelf,
      {
        p_hero_id: 'hero-1',
        p_item_id: 'item-1',
        p_target_shelf_position: 0,
      },
    );
    expect(JSON.stringify(backend.rpc.calls.allArgs())).not.toContain('user-1');
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });

  it('rejects DB-declared item move failure before refreshing', async () => {
    backend.rpc.and.callFake(<T>(rpcName: string): Observable<T> => {
      if (rpcName === RPC.move_hero_armory_item_to_shelf) {
        return of([
          {
            ...moveItemRow(),
            success: false,
            reason: 'item_not_visible',
          },
        ] as T);
      }

      if (rpcName === RPC.get_hero_armory_visibility_state) {
        return of([visibilityRow()] as T);
      }

      if (rpcName === RPC.get_hero_armory_items) {
        return of([] as T);
      }

      return of([] as T);
    });

    await expectAsync(firstValueFrom(service.moveItemToShelf({
      itemId: 'item-1',
      targetShelfPosition: 0,
    }))).toBeRejectedWithError('item_not_visible');

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.move_hero_armory_item_to_shelf,
      jasmine.anything(),
    );
    expect(backend.rpc).not.toHaveBeenCalledWith(
      RPC.get_hero_armory_visibility_state,
      jasmine.anything(),
    );
    expect(backend.rpc).not.toHaveBeenCalledWith(
      RPC.get_hero_armory_items,
      jasmine.anything(),
    );
  });

  it('rejects invalid move inputs before RPC', async () => {
    expect(() => service.moveItemToShelf({
      itemId: '',
      targetShelfPosition: 1,
    })).toThrowError('itemId is required for armory RPC.');

    expect(() => service.moveItemToShelf({
      itemId: 'item-1',
      targetShelfPosition: 11,
    })).toThrowError(
      'targetShelfPosition must be an integer from 0 to 10.',
    );

    expect(backend.rpc).not.toHaveBeenCalledWith(
      RPC.move_hero_armory_item_to_shelf,
      jasmine.anything(),
    );
  });
});

function visibilityRow(
  overrides: Partial<GetHeroArmoryVisibilityStateRpcRow> = {},
): GetHeroArmoryVisibilityStateRpcRow {
  return {
    armory_building_id: 'building-1',
    armory_building_key: 'armory',
    armory_building_level: 2,
    estate_id: 'estate-1',
    generated_at: '2026-05-07T10:00:00Z',
    hero_id: 'hero-1',
    hidden_item_count: 3,
    server_id: 'server-1',
    shelves_json: Array.from({ length: 10 }, (_, index) => ({
      id: `shelf-${index + 1}`,
      position: index + 1,
      name: `Shelf ${index + 1}`,
      updatedAt: '2026-05-07T10:00:00Z',
      isPersisted: true,
    })),
    source_config_json: { target: 'visible_item_capacity' },
    total_owned_item_count: 5,
    unsorted_json: {
      id: null,
      position: 0,
      name: 'Unsorted',
      isPersisted: false,
    },
    visibility_limit: 2,
    visibility_limit_source: 'visible_item_capacity',
    visibility_order: 'armory_shelf_position',
    visible_item_count: 2,
    visible_statuses: ['active', 'locked_trade', 'locked_auction'],
    ...overrides,
  };
}

function armoryItemRow(
  overrides: Partial<GetHeroArmoryItemsRpcRow> = {},
): GetHeroArmoryItemsRpcRow {
  return {
    armory_shelf_position: 1,
    created_at: '2026-05-07T10:00:00Z',
    drachma_value: 20,
    generated_at: '2026-05-07T10:00:00Z',
    generation_base_id: 'base-1',
    generation_quality_key: 'normal',
    hero_id: 'hero-1',
    is_unsorted: false,
    is_visible: true,
    item_id: 'item-1',
    item_name: 'Bronze blade',
    item_status: 'active',
    prefix_affix_id: null,
    server_id: 'server-1',
    shelf_name: 'Shelf 1',
    suffix_affix_id: null,
    visibility_index: 1,
    visibility_limit: 2,
    ...overrides,
  } as GetHeroArmoryItemsRpcRow;
}

function armoryItemDetailRow(
  overrides: Partial<GetHeroArmoryItemDetailRpcRow> = {},
): GetHeroArmoryItemDetailRpcRow {
  return {
    armory_shelf_position: 1,
    bonuses_json: {
      itemStats: {
        rows: [{ key: 'damage', label: 'Damage', displayValue: '2-9' }],
        bonusRows: [
          {
            label: 'Max Damage Flat',
            targetKey: 'max_damage',
            targetLabel: 'Max Damage Flat',
            rowKind: 'modifier_bonus',
            displaySection: 'bonuses',
            numericValue: 4,
            displayValue: '+4',
            sortOrder: 10,
          },
          {
            label: 'Critical Chance Flat',
            targetKey: 'critical_chance',
            targetLabel: 'Critical Chance Flat',
            rowKind: 'modifier_bonus',
            displaySection: 'bonuses',
            numericValue: 2,
            displayValue: '+2%',
            sortOrder: 20,
          },
        ],
      },
      modifierRows: [
        {
          label: 'Max Damage Flat',
          targetKey: 'max_damage',
          targetLabel: 'Max Damage Flat',
          rowKind: 'modifier_bonus',
          displaySection: 'bonuses',
          numericValue: 4,
          displayValue: '+4',
          sortOrder: 10,
        },
        {
          label: 'Critical Chance Flat',
          targetKey: 'critical_chance',
          targetLabel: 'Critical Chance Flat',
          rowKind: 'modifier_bonus',
          displaySection: 'bonuses',
          numericValue: 2,
          displayValue: '+2%',
          sortOrder: 20,
        },
      ],
    },
    created_at: '2026-05-07T10:00:00Z',
    drachma_value: 300,
    generated_at: '2026-05-07T10:00:00Z',
    generation_base_id: 'base-1',
    generation_quality_key: 'normal',
    hero_id: 'hero-1',
    base_key: 'dagger',
    base_name: 'Dagger',
    base_type_key: 'one_handed_weapon',
    item_id: 'item-1',
    item_name: 'Demonic Dagger',
    item_status: 'active',
    prefix_affix_id: 'prefix-1',
    prefix_key: 'demonic',
    prefix_name: 'Demonic',
    quality_multiplier: 1,
    server_id: 'server-1',
    shelf_name: 'Shelf 1',
    suffix_affix_id: '',
    suffix_key: '',
    suffix_name: '',
    visibility_index: 1,
    visibility_limit: 30,
    ...overrides,
  };
}

function renameShelfRow(
  overrides: Partial<RenameHeroArmoryShelfRpcRow> = {},
): RenameHeroArmoryShelfRpcRow {
  return {
    armory_state_json: {},
    hero_id: 'hero-1',
    operation: 'rename_hero_armory_shelf',
    server_id: 'server-1',
    shelf_id: 'shelf-2',
    shelf_name: 'Materials',
    shelf_position: 2,
    ...overrides,
  };
}

function moveItemRow(
  overrides: Partial<MoveHeroArmoryItemToShelfRpcRow> = {},
): MoveHeroArmoryItemToShelfRpcRow {
  return {
    armory_state_json: {},
    hero_id: 'hero-1',
    is_visible: true,
    item_id: 'item-1',
    item_status: 'active',
    operation: 'move_hero_armory_item_to_shelf',
    previous_shelf_position: 1,
    server_id: 'server-1',
    shelf_name: 'Unsorted',
    target_shelf_position: 0,
    visibility_index: 1,
    visibility_limit: 2,
    visible_items_json: [],
    ...overrides,
  };
}
