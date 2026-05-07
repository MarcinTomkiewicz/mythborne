import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  ArmoryItemDetailReadModel,
  HeroArmoryReadModel,
} from '../../domain/item/item-equipment.model';
import {
  GetHeroArmoryItemDetailRpcArgs,
  GetHeroArmoryItemDetailRpcRow,
  GetHeroArmoryItemsRpcArgs,
  GetHeroArmoryItemsRpcRow,
  GetHeroArmoryVisibilityStateRpcArgs,
  GetHeroArmoryVisibilityStateRpcRow,
  MoveHeroArmoryItemToShelfRpcArgs,
  MoveHeroArmoryItemToShelfRpcRow,
  RenameHeroArmoryShelfRpcArgs,
  RenameHeroArmoryShelfRpcRow,
} from '../../types/item-equipment-rpc.types';
import { mapHeroArmoryReadModel } from '../../utils/item-equipment-mappers';
import { mapArmoryItemDetail } from '../../utils/item-detail-mappers';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

export interface RenameArmoryShelfInput {
  shelfPosition: number;
  newName: string;
  // Reserved for a future RPC contract; current generated Args do not expose p_request_id.
  requestId?: string | null;
}

export interface MoveArmoryItemToShelfInput {
  itemId: string;
  targetShelfPosition: number;
  // Reserved for a future RPC contract; current generated Args do not expose p_request_id.
  requestId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PlayerArmory {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getArmory(): Observable<HeroArmoryReadModel> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => this.getArmoryForHero(context.heroId)),
    );
  }

  getArmoryItemDetail(itemId: string): Observable<ArmoryItemDetailReadModel> {
    const normalizedItemId = requiredText(itemId, 'itemId');

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetHeroArmoryItemDetailRpcArgs = {
          p_hero_id: context.heroId,
          p_item_id: normalizedItemId,
        };

        return this.backend
          .rpc<GetHeroArmoryItemDetailRpcRow[]>(
            RPC.get_hero_armory_item_detail,
            args,
          )
          .pipe(
            map((rows) =>
              mapArmoryItemDetail(
                firstRow(rows, RPC.get_hero_armory_item_detail),
              ),
            ),
          );
      }),
    );
  }

  renameShelf(input: RenameArmoryShelfInput): Observable<HeroArmoryReadModel> {
    const shelfPosition = playerShelfPosition(input.shelfPosition);
    const newName = requiredText(input.newName, 'newName');

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: RenameHeroArmoryShelfRpcArgs = {
          p_hero_id: context.heroId,
          p_new_name: newName,
          p_shelf_position: shelfPosition,
        };

        return this.backend
          .rpc<RenameHeroArmoryShelfRpcRow[]>(
            RPC.rename_hero_armory_shelf,
            args,
          )
          .pipe(
            map((rows) => assertMutationSucceeded(
              rows,
              RPC.rename_hero_armory_shelf,
            )),
            switchMap(() => this.getArmoryForHero(context.heroId)),
          );
      }),
    );
  }

  moveItemToShelf(
    input: MoveArmoryItemToShelfInput,
  ): Observable<HeroArmoryReadModel> {
    const itemId = requiredText(input.itemId, 'itemId');
    const targetShelfPosition = armoryShelfPosition(input.targetShelfPosition);

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: MoveHeroArmoryItemToShelfRpcArgs = {
          p_hero_id: context.heroId,
          p_item_id: itemId,
          p_target_shelf_position: targetShelfPosition,
        };

        return this.backend
          .rpc<MoveHeroArmoryItemToShelfRpcRow[]>(
            RPC.move_hero_armory_item_to_shelf,
            args,
          )
          .pipe(
            map((rows) => assertMutationSucceeded(
              rows,
              RPC.move_hero_armory_item_to_shelf,
            )),
            switchMap(() => this.getArmoryForHero(context.heroId)),
          );
      }),
    );
  }

  private getArmoryForHero(heroId: string): Observable<HeroArmoryReadModel> {
    return forkJoin({
      visibility: this.getVisibility(heroId),
      items: this.getVisibleItems(heroId),
    }).pipe(
      map((data) =>
        mapHeroArmoryReadModel(
          heroId,
          firstRow(data.visibility, RPC.get_hero_armory_visibility_state),
          data.items,
        ),
      ),
    );
  }

  private getVisibility(
    heroId: string,
  ): Observable<GetHeroArmoryVisibilityStateRpcRow[]> {
    const args: GetHeroArmoryVisibilityStateRpcArgs = {
      p_hero_id: heroId,
    };

    return this.backend.rpc<GetHeroArmoryVisibilityStateRpcRow[]>(
      RPC.get_hero_armory_visibility_state,
      args,
    );
  }

  private getVisibleItems(heroId: string): Observable<GetHeroArmoryItemsRpcRow[]> {
    const args: GetHeroArmoryItemsRpcArgs = {
      p_hero_id: heroId,
    };

    return this.backend.rpc<GetHeroArmoryItemsRpcRow[]>(
      RPC.get_hero_armory_items,
      args,
    );
  }
}

function firstRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no row.`);
  }

  return row;
}

function assertMutationSucceeded<T>(rows: readonly T[], rpcName: string): T {
  const row = firstRow(rows, rpcName);
  const record = row as Record<string, unknown>;

  if (record['success'] === false) {
    const message = stringField(record, 'message')
      ?? stringField(record, 'reason')
      ?? `${rpcName} returned an unsuccessful armory operation.`;

    throw new Error(message);
  }

  return row;
}

function stringField(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];

  return typeof value === 'string' && value.trim() ? value : null;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for armory RPC.`);
  }

  return normalized;
}

function playerShelfPosition(value: number): number {
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new Error('shelfPosition must be an integer from 1 to 10.');
  }

  return value;
}

function armoryShelfPosition(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 10) {
    throw new Error('targetShelfPosition must be an integer from 0 to 10.');
  }

  return value;
}
