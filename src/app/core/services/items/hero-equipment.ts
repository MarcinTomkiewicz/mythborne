import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  CurrentEquipmentLoadout,
  EquipmentOperationJournal,
  EquipmentSlot,
  EquipmentSlotKey,
  LoadoutPreset,
  LoadoutPresetNumber,
  LoadoutPresetPreview,
  SaveLoadoutPresetResult,
  RenameLoadoutPresetResult,
  ClearLoadoutPresetResult,
} from '../../domain/item/item-equipment.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Json } from '../../types/database.types';
import {
  BulkEquipHeroItemsRpcArgs,
  BulkEquipHeroItemsRpcRow,
  ApplyHeroLoadoutPresetRpcArgs,
  ApplyHeroLoadoutPresetRpcRow,
  ClearHeroLoadoutPresetRpcArgs,
  ClearHeroLoadoutPresetRpcRow,
  EquipHeroItemRpcArgs,
  EquipHeroItemRpcRow,
  GetHeroEquipmentRuntimeSlotsRpcArgs,
  GetHeroEquipmentRuntimeSlotsRpcRow,
  GetHeroLoadoutPresetsRpcArgs,
  GetHeroLoadoutPresetsRpcRow,
  PreviewHeroLoadoutPresetRpcArgs,
  PreviewHeroLoadoutPresetRpcRow,
  RenameHeroLoadoutPresetRpcArgs,
  RenameHeroLoadoutPresetRpcRow,
  SaveCurrentHeroLoadoutPresetRpcArgs,
  SaveCurrentHeroLoadoutPresetRpcRow,
  UnequipHeroItemRpcArgs,
  UnequipHeroItemRpcRow,
} from '../../types/item-equipment-rpc.types';
import { Row } from '../../types/supabase.types';
import {
  mapEquipmentSlot,
  mapCurrentEquipmentLoadout,
  mapEquipmentOperationJournal,
  mapLoadoutPreset,
  mapLoadoutPresetPreview,
  mapSaveLoadoutPresetResult,
  mapRenameLoadoutPresetResult,
  mapClearLoadoutPresetResult,
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
  targetSlotKey?: EquipmentSlotKey | null;
}

export interface BulkEquipHeroItemsInput {
  items: readonly BulkEquipHeroItemInput[];
  requestId?: string | null;
}

export interface LoadoutPresetInput {
  presetNumber: LoadoutPresetNumber;
  requestId?: string | null;
}

export interface SaveCurrentLoadoutPresetInput extends LoadoutPresetInput {
  name?: string | null;
}

export interface RenameLoadoutPresetInput extends LoadoutPresetInput {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class HeroEquipment {
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

  getLoadoutPresets(): Observable<LoadoutPreset[]> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetHeroLoadoutPresetsRpcArgs = {
          p_hero_id: context.heroId,
        };

        return this.backend
          .rpc<GetHeroLoadoutPresetsRpcRow[]>(
            RPC.get_hero_loadout_presets,
            args,
          )
          .pipe(map((rows) => {
            assertRowsBelongToHero(
              rows,
              context.heroId,
              RPC.get_hero_loadout_presets,
            );

            return rows
              .map(mapLoadoutPreset)
              .sort((left, right) => left.presetNumber - right.presetNumber);
          }));
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
            firstEquipmentOperationRow(rows, RPC.equip_hero_item),
          )));
      }),
    );
  }

  saveCurrentLoadoutPreset(
    input: SaveCurrentLoadoutPresetInput,
  ): Observable<SaveLoadoutPresetResult> {
    const presetNumber = presetNumberValue(input.presetNumber);
    const name = nullableText(input.name);
    const requestId = nullableText(input.requestId);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: SaveCurrentHeroLoadoutPresetRpcArgs = {
          p_hero_id: context.heroId,
          p_preset_number: presetNumber,
          p_name: name,
          p_request_id: requestId,
        };

        return this.backend
          .rpc<SaveCurrentHeroLoadoutPresetRpcRow[]>(
            RPC.save_current_hero_loadout_preset,
            args,
          )
          .pipe(map((rows) => {
            assertPresetRowsMatch(
              rows,
              context.heroId,
              presetNumber,
              RPC.save_current_hero_loadout_preset,
            );

            return mapSaveLoadoutPresetResult(
              firstPresetMutationRow(rows, RPC.save_current_hero_loadout_preset),
            );
          }));
      }),
    );
  }

  renameLoadoutPreset(
    input: RenameLoadoutPresetInput,
  ): Observable<RenameLoadoutPresetResult> {
    const presetNumber = presetNumberValue(input.presetNumber);
    const name = presetNameValue(input.name);
    const requestId = nullableText(input.requestId);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: RenameHeroLoadoutPresetRpcArgs = {
          p_hero_id: context.heroId,
          p_preset_number: presetNumber,
          p_name: name,
          p_request_id: requestId,
        };

        return this.backend
          .rpc<RenameHeroLoadoutPresetRpcRow[]>(
            RPC.rename_hero_loadout_preset,
            args,
          )
          .pipe(map((rows) => {
            assertPresetRowsMatch(
              rows,
              context.heroId,
              presetNumber,
              RPC.rename_hero_loadout_preset,
            );

            return mapRenameLoadoutPresetResult(
              firstPresetMutationRow(rows, RPC.rename_hero_loadout_preset),
            );
          }));
      }),
    );
  }

  clearLoadoutPreset(
    input: LoadoutPresetInput,
  ): Observable<ClearLoadoutPresetResult> {
    const presetNumber = presetNumberValue(input.presetNumber);
    const requestId = nullableText(input.requestId);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: ClearHeroLoadoutPresetRpcArgs = {
          p_hero_id: context.heroId,
          p_preset_number: presetNumber,
          p_request_id: requestId,
        };

        return this.backend
          .rpc<ClearHeroLoadoutPresetRpcRow[]>(
            RPC.clear_hero_loadout_preset,
            args,
          )
          .pipe(map((rows) => {
            assertPresetRowsMatch(
              rows,
              context.heroId,
              presetNumber,
              RPC.clear_hero_loadout_preset,
            );

            return mapClearLoadoutPresetResult(
              firstPresetMutationRow(rows, RPC.clear_hero_loadout_preset),
            );
          }));
      }),
    );
  }

  previewLoadoutPreset(
    input: Pick<LoadoutPresetInput, 'presetNumber'>,
  ): Observable<LoadoutPresetPreview> {
    const presetNumber = presetNumberValue(input.presetNumber);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const presetArgs: GetHeroLoadoutPresetsRpcArgs = {
          p_hero_id: context.heroId,
        };
        const previewArgs: PreviewHeroLoadoutPresetRpcArgs = {
          p_hero_id: context.heroId,
          p_preset_number: presetNumber,
        };

        return forkJoin({
          presets: this.backend.rpc<GetHeroLoadoutPresetsRpcRow[]>(
            RPC.get_hero_loadout_presets,
            presetArgs,
          ),
          rows: this.backend.rpc<PreviewHeroLoadoutPresetRpcRow[]>(
            RPC.preview_hero_loadout_preset,
            previewArgs,
          ),
        }).pipe(
          map((data) => {
            assertRowsBelongToHero(
              data.presets,
              context.heroId,
              RPC.get_hero_loadout_presets,
            );
            assertPresetRowsMatch(
              data.rows,
              context.heroId,
              presetNumber,
              RPC.preview_hero_loadout_preset,
            );
            const presetRow = data.presets
              .find((entry) => entry.preset_number === presetNumber);

            if (!presetRow) {
              throw new Error('preview_hero_loadout_preset returned no preset header.');
            }

            assertPresetRowsMatch(
              [presetRow],
              context.heroId,
              presetNumber,
              RPC.get_hero_loadout_presets,
            );

            return mapLoadoutPresetPreview(
              mapLoadoutPreset(presetRow),
              data.rows.filter((row) => row.preset_number === presetNumber),
            );
          }),
        );
      }),
    );
  }

  applyLoadoutPreset(
    input: LoadoutPresetInput,
  ): Observable<EquipmentOperationJournal> {
    const presetNumber = presetNumberValue(input.presetNumber);
    const requestId = nullableText(input.requestId);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: ApplyHeroLoadoutPresetRpcArgs = {
          p_hero_id: context.heroId,
          p_preset_number: presetNumber,
          p_request_id: requestId,
        };

        return this.backend
          .rpc<ApplyHeroLoadoutPresetRpcRow[]>(
            RPC.apply_hero_loadout_preset,
            args,
          )
          .pipe(map((rows) => {
            assertPresetRowsMatch(
              rows,
              context.heroId,
              presetNumber,
              RPC.apply_hero_loadout_preset,
            );

            return mapEquipmentOperationJournal(
              firstEquipmentOperationRow(rows, RPC.apply_hero_loadout_preset),
            );
          }));
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
            firstEquipmentOperationRow(rows, RPC.unequip_hero_item),
          )));
      }),
    );
  }

  bulkEquipItems(
    input: BulkEquipHeroItemsInput,
  ): Observable<EquipmentOperationJournal> {
    const items = input.items.map((item, index) => {
      const payload: Record<string, string> = {
        itemId: requiredText(item.itemId, `items[${index}].itemId`),
      };
      const targetSlotKey = nullableText(item.targetSlotKey);

      if (targetSlotKey) {
        payload['targetSlotKey'] = targetSlotKey;
      }

      return payload;
    });
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
            firstEquipmentOperationRow(rows, RPC.bulk_equip_hero_items),
          )));
      }),
    );
  }
}

function firstEquipmentOperationRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no equipment operation row.`);
  }

  return row;
}

function firstPresetMutationRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no preset row.`);
  }

  return row;
}

function assertRowsBelongToHero<T extends { hero_id: string }>(
  rows: readonly T[],
  heroId: string,
  rpcName: string,
): void {
  if (rows.some((row) => row.hero_id !== heroId)) {
    throw new Error(`${rpcName} returned a row for a different hero.`);
  }
}

function assertPresetRowsMatch<T extends {
  hero_id: string;
  preset_number: number;
}>(
  rows: readonly T[],
  heroId: string,
  presetNumber: number,
  rpcName: string,
): void {
  assertRowsBelongToHero(rows, heroId, rpcName);

  if (rows.some((row) => row.preset_number !== presetNumber)) {
    throw new Error(`${rpcName} returned a row for a different preset.`);
  }
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

function presetNumberValue(value: number): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('presetNumber must be a positive integer for equipment RPC.');
  }

  return value;
}

function presetNameValue(value: string | null | undefined): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error('rename_hero_loadout_preset_name_invalid');
  }

  return normalized;
}
