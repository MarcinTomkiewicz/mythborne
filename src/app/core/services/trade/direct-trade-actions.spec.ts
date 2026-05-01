import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import { AuditWriter } from '../audit/audit-writer';
import { Backend } from '../backend/backend';
import { DirectTradeActions } from './direct-trade-actions';

describe('DirectTradeActions', () => {
  let auditWriter: jasmine.SpyObj<AuditWriter>;
  let backend: jasmine.SpyObj<Backend>;
  let service: DirectTradeActions;

  beforeEach(() => {
    auditWriter = jasmine.createSpyObj<AuditWriter>('AuditWriter', ['write']);
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'getAll',
      'create',
      'update',
      'delete',
      'rpc',
    ]);
    backend.rpc.and.returnValue(of('offer-1'));
    backend.getAll.and.callFake(((opts: { table: string }) => {
      switch (opts.table) {
        case TABLES.hero:
          return of([heroRow()]);
        case TABLES.items:
          return of([itemRow()]);
        default:
          return of([]);
      }
    }) as Backend['getAll']);

    TestBed.configureTestingModule({
      providers: [
        DirectTradeActions,
        { provide: AuditWriter, useValue: auditWriter },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(DirectTradeActions);
  });

  it('uses public direct trade RPCs for offer mutations', async () => {
    await firstValueFrom(
      service.createOffer({
        creatorHeroId: 'hero-1',
        targetHeroId: 'hero-2',
        creatorCharacterPoints: 10,
        creatorItemIds: ['item-1'],
      }),
    );
    await firstValueFrom(
      service.respondToOffer({
        offerId: 'offer-1',
        targetCharacterPoints: 5,
        targetItemIds: ['item-2'],
      }),
    );
    await firstValueFrom(service.confirmOffer({ offerId: 'offer-1' }));
    await firstValueFrom(service.cancelOffer({ offerId: 'offer-1' }));
    await firstValueFrom(service.rejectOffer({ offerId: 'offer-1' }));

    expect(backend.rpc.calls.allArgs()).toEqual([
      [
        RPC.create_player_direct_trade_offer,
        {
          p_creator_hero_id: 'hero-1',
          p_target_hero_id: 'hero-2',
          p_creator_character_points: 10,
          p_creator_item_ids: ['item-1'],
        },
      ],
      [
        RPC.respond_player_direct_trade_offer,
        {
          p_offer_id: 'offer-1',
          p_target_character_points: 5,
          p_target_item_ids: ['item-2'],
        },
      ],
      [RPC.confirm_player_direct_trade_offer, { p_offer_id: 'offer-1' }],
      [RPC.cancel_player_direct_trade_offer, { p_offer_id: 'offer-1' }],
      [RPC.reject_player_direct_trade_offer, { p_offer_id: 'offer-1' }],
    ]);
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(auditWriter.write).not.toHaveBeenCalled();
  });

  it('searches trade hero targets by server scope and excludes active hero', async () => {
    const targets = await firstValueFrom(
      service.searchHeroTargets({
        serverId: 'server-1',
        activeHeroId: 'hero-1',
        query: 'Target',
      }),
    );

    expect(targets[0]).toEqual({
      heroId: 'hero-2',
      heroName: 'Target hero',
      label: 'Target hero',
      description: 'Hero ID: hero-2',
    });
    expect(backend.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({
        table: TABLES.hero,
        select: 'id, name',
        filters: {
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
          id: { operator: FilterOperator.NE, value: 'hero-1' },
          name: { operator: FilterOperator.LIKE, value: '%Target%' },
        },
        camelCase: false,
      }),
    );
  });

  it('searches only active own item targets by selected server and hero scope', async () => {
    const targets = await firstValueFrom(
      service.searchOwnItemTargets({
        serverId: 'server-1',
        heroId: 'hero-1',
        query: 'Blade',
      }),
    );

    expect(targets[0]).toEqual({
      itemId: 'item-1',
      itemName: 'Trade blade',
      itemStatus: 'active',
      drachmaValue: 120,
      label: 'Trade blade',
      description: 'Value: 120',
    });
    expect(backend.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({
        table: TABLES.items,
        select: 'id, name, status, drachma_value',
        filters: {
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
          heroId: { operator: FilterOperator.EQ, value: 'hero-1' },
          status: { operator: FilterOperator.EQ, value: 'active' },
          name: { operator: FilterOperator.LIKE, value: '%Blade%' },
        },
        camelCase: false,
      }),
    );
  });
});

function heroRow(): Pick<Row<'hero'>, 'id' | 'name'> {
  return { id: 'hero-2', name: 'Target hero' };
}

function itemRow(): Pick<Row<'items'>, 'id' | 'name' | 'status' | 'drachma_value'> {
  return {
    id: 'item-1',
    name: 'Trade blade',
    status: 'active',
    drachma_value: 120,
  };
}
