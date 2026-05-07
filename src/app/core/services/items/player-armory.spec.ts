import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  GetHeroArmoryItemsRpcRow,
  GetHeroArmoryVisibilityStateRpcRow,
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
