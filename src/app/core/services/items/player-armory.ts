import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  ArmoryItemDetailReadModel,
  HeroArmoryReadModel,
} from '../../domain/item/item-equipment.model';
import { PlayerArmoryPageContextReadModel } from '../../domain/item/player-armory-page-context.model';
import { BulkMoveArmoryItemsToShelfResult } from '../../domain/item/armory-actions.model';
import {
  GetHeroArmoryItemDetailRpcArgs,
  GetHeroArmoryItemDetailRpcRow,
  GetHeroArmoryItemsRpcArgs,
  GetHeroArmoryItemsRpcRow,
  GetHeroArmoryVisibilityStateRpcArgs,
  GetHeroArmoryVisibilityStateRpcRow,
  GetHeroItemRequirementStatusRpcArgs,
  GetHeroItemRequirementStatusRpcRow,
  MoveHeroArmoryItemToShelfRpcArgs,
  MoveHeroArmoryItemToShelfRpcRow,
  BulkMoveHeroArmoryItemsToShelfRpcArgs,
  BulkMoveHeroArmoryItemsToShelfRpcRow,
  RenameHeroArmoryShelfRpcArgs,
  RenameHeroArmoryShelfRpcRow,
} from '../../types/item-equipment-rpc.types';
import {
  BulkMoveArmoryItemsToShelfInput,
  MoveArmoryItemToShelfInput,
  RenameArmoryShelfInput,
} from '../../interfaces/item/armory-actions.interface';
import { Database, Json } from '../../types/database.types';
import {
  movableArmoryShelfPosition,
  playerArmoryShelfPosition,
} from '../../utils/armory-shelf-position';
import { mapHeroArmoryReadModel } from '../../utils/item-equipment-mappers';
import { mapArmoryItemDetail } from '../../utils/item-detail-mappers';
import { mapItemRequirementPreview } from '../../utils/item-requirement-mappers';
import { mapBulkMoveArmoryItemsToShelfResult } from '../../utils/armory-actions-mappers';
import { mapPlayerArmoryPageContext } from '../../utils/player-armory-page-context.mapper';
import { requiredTrimmedText, trimToNull } from '../../utils/normalize-text';
import {
  assertSuccessfulRpcRow,
  firstRpcRow,
} from '../../utils/rpc-result';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerArmory {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getArmory(): Observable<HeroArmoryReadModel> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => this.getArmoryForHero(context.heroId)),
    );
  }

  getArmoryPageContext(): Observable<PlayerArmoryPageContextReadModel> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: Database['public']['Functions']['get_player_armory_page_context']['Args'] = {
          p_hero_id: context.heroId,
        };

        return this.backend.rpc<
          Database['public']['Functions']['get_player_armory_page_context']['Returns']
        >(
          RPC.get_player_armory_page_context,
          args,
        ).pipe(map(mapPlayerArmoryPageContext));
      }),
    );
  }

  getArmoryItemDetail(itemId: string): Observable<ArmoryItemDetailReadModel> {
    const normalizedItemId = requiredArmoryText(itemId, 'itemId');

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetHeroArmoryItemDetailRpcArgs = {
          p_hero_id: context.heroId,
          p_item_id: normalizedItemId,
        };

        return this.backend.rpc<GetHeroArmoryItemDetailRpcRow[]>(
          RPC.get_hero_armory_item_detail,
          args,
        ).pipe(
          switchMap((rows) => {
            const detail = firstRpcRow(rows, RPC.get_hero_armory_item_detail);

            return forkJoin({
              detail: of(detail),
              requirements: this.getItemRequirementPreview(
                context.heroId,
                detail.item_id,
              ),
            });
          }),
          map((data) => ({
            ...mapArmoryItemDetail(data.detail),
            requirementPreview: data.requirements,
          })),
        );
      }),
    );
  }

  renameShelf(input: RenameArmoryShelfInput): Observable<HeroArmoryReadModel> {
    const shelfPosition = playerArmoryShelfPosition(input.shelfPosition);
    const newName = requiredArmoryText(input.newName, 'newName');

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
            map((rows) => assertSuccessfulRpcRow(
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
    const itemId = requiredArmoryText(input.itemId, 'itemId');
    const targetShelfPosition = movableArmoryShelfPosition(input.targetShelfPosition);

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
            map((rows) => assertSuccessfulRpcRow(
              rows,
              RPC.move_hero_armory_item_to_shelf,
            )),
            switchMap(() => this.getArmoryForHero(context.heroId)),
          );
      }),
    );
  }

  bulkMoveItemsToShelf(
    input: BulkMoveArmoryItemsToShelfInput,
  ): Observable<{
    result: BulkMoveArmoryItemsToShelfResult;
    readModel: HeroArmoryReadModel;
  }> {
    const items = input.items.map((item, index) => ({
      itemId: requiredArmoryText(item.itemId, `items[${index}].itemId`),
    }));
    const targetShelfPosition =
      movableArmoryShelfPosition(input.targetShelfPosition);
    const requestId = nullableArmoryText(input.requestId);

    if (!items.length) {
      throw new Error('items are required for bulk armory shelf move.');
    }

    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: BulkMoveHeroArmoryItemsToShelfRpcArgs = {
          p_hero_id: context.heroId,
          p_items_json: items as unknown as Json,
          p_target_shelf_position: targetShelfPosition,
        };
        if (requestId) {
          args.p_request_id = requestId;
        }

        return this.backend
          .rpc<BulkMoveHeroArmoryItemsToShelfRpcRow[]>(
            RPC.bulk_move_hero_armory_items_to_shelf,
            args,
          )
          .pipe(
            switchMap((rows) => {
              const result = mapBulkMoveArmoryItemsToShelfResult(
                firstRpcRow(rows, RPC.bulk_move_hero_armory_items_to_shelf),
              );

              return forkJoin({
                result: of(result),
                readModel: this.getArmoryForHero(context.heroId),
              });
            }),
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
          firstRpcRow(data.visibility, RPC.get_hero_armory_visibility_state),
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

  private getItemRequirementPreview(
    heroId: string,
    itemId: string,
  ): Observable<ArmoryItemDetailReadModel['requirementPreview']> {
    const args: GetHeroItemRequirementStatusRpcArgs = {
      p_hero_id: heroId,
      p_item_id: itemId,
    };

    return this.backend.rpc<GetHeroItemRequirementStatusRpcRow[]>(
      RPC.get_hero_item_requirement_status,
      args,
    ).pipe(
      map((rows) => mapItemRequirementPreview({
        row: firstRpcRow(rows, RPC.get_hero_item_requirement_status),
      })),
    );
  }
}

function requiredArmoryText(value: string | null | undefined, field: string): string {
  return requiredTrimmedText(value, field, 'armory RPC');
}

function nullableArmoryText(value: string | null | undefined): string | null {
  return trimToNull(value);
}
