import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  CurrentEquipmentLoadout,
  EquipmentOperationJournal,
  EquipmentSlot,
  EquipmentSlotKey,
} from '../../domain/item/item-equipment.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Json } from '../../types/database.types';
import {
  BulkEquipHeroItemsRpcArgs,
  BulkEquipHeroItemsRpcRow,
  EquipHeroItemRpcArgs,
  EquipHeroItemRpcRow,
  GetHeroEquipmentRuntimeSlotsRpcArgs,
  GetHeroEquipmentRuntimeSlotsRpcRow,
  UnequipHeroItemRpcArgs,
  UnequipHeroItemRpcRow,
} from '../../types/item-equipment-rpc.types';
import { Row } from '../../types/supabase.types';
import {
  mapEquipmentSlot,
  mapCurrentEquipmentLoadout,
  mapEquipmentOperationJournal,
} from '../../utils/item-equipment-mappers';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

export interface EquipHeroItemInput {
  itemId: string;
  targetSlotKey?: EquipmentSlotKey | null;
  requestId?: string | null;
}

export interface UnequipHeroSlotInput {
  slotKey: EquipmentSlotKey;
  requestId?: string | null;
}

export interface BulkEquipHeroItemInput {
  itemId: string;
  targetSlotKey: EquipmentSlotKey;
}

export interface BulkEquipHeroItemsInput {
  items: readonly BulkEquipHeroItemInput[];
  requestId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PlayerEquipment {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getEquipmentSlots(): Observable<EquipmentSlot[]> {
    return this.backend
      .getAll<Row<'equipment_slot_definitions'>>({
        table: TABLES.equipment_slot_definitions,
        filters: {
          is_active: { operator: FilterOperator.EQ, value: true },
        },
        orderBy: [
          { column: 'sort_order' },
          { column: 'key' },
        ],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapEquipmentSlot)));
  }

  getCurrentEquipment(): Observable<CurrentEquipmentLoadout> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetHeroEquipmentRuntimeSlotsRpcArgs = {
          p_hero_id: context.heroId,
        };

        return this.backend
          .rpc<GetHeroEquipmentRuntimeSlotsRpcRow[]>(
            RPC.get_hero_equipment_runtime_slots,
            args,
          )
          .pipe(
            map((rows) => mapCurrentEquipmentLoadout(context.heroId, rows)),
          );
      }),
    );
  }

  equipItem(input: EquipHeroItemInput): Observable<EquipmentOperationJournal> {
    const itemId = requiredText(input.itemId, 'itemId');
    const targetSlotKey = nullableText(input.targetSlotKey);
    const requestId = nullableText(input.requestId);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: EquipHeroItemRpcArgs = {
          p_hero_id: context.heroId,
          p_item_id: itemId,
          p_request_id: requestId,
        };
        if (targetSlotKey) {
          args.p_target_slot_key = targetSlotKey;
        }

        return this.backend
          .rpc<EquipHeroItemRpcRow[]>(RPC.equip_hero_item, args)
          .pipe(map((rows) => mapEquipmentOperationJournal(
            firstRow(rows, RPC.equip_hero_item),
          )));
      }),
    );
  }

  unequipSlot(
    input: UnequipHeroSlotInput,
  ): Observable<EquipmentOperationJournal> {
    const slotKey = requiredText(input.slotKey, 'slotKey');
    const requestId = nullableText(input.requestId);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: UnequipHeroItemRpcArgs = {
          p_hero_id: context.heroId,
          p_request_id: requestId,
          p_slot_key: slotKey,
        };

        return this.backend
          .rpc<UnequipHeroItemRpcRow[]>(RPC.unequip_hero_item, args)
          .pipe(map((rows) => mapEquipmentOperationJournal(
            firstRow(rows, RPC.unequip_hero_item),
          )));
      }),
    );
  }

  bulkEquipItems(
    input: BulkEquipHeroItemsInput,
  ): Observable<EquipmentOperationJournal> {
    const items = input.items.map((item, index) => ({
      itemId: requiredText(item.itemId, `items[${index}].itemId`),
      targetSlotKey: requiredText(
        item.targetSlotKey,
        `items[${index}].targetSlotKey`,
      ),
    }));
    const requestId = nullableText(input.requestId);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: BulkEquipHeroItemsRpcArgs = {
          p_hero_id: context.heroId,
          p_items_json: items as unknown as Json,
          p_request_id: requestId,
        };

        return this.backend
          .rpc<BulkEquipHeroItemsRpcRow[]>(RPC.bulk_equip_hero_items, args)
          .pipe(map((rows) => mapEquipmentOperationJournal(
            firstRow(rows, RPC.bulk_equip_hero_items),
          )));
      }),
    );
  }
}

function firstRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no equipment operation row.`);
  }

  return row;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for equipment RPC.`);
  }

  return normalized;
}

function nullableText(value: string | null | undefined): string | undefined {
  return trimText(value) || undefined;
}
