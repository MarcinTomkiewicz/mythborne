import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { ARMORY_FEEDBACK_KEYS } from '../../constants/armory-feedback-keys.const';
import {
  PlayerArmoryPageContextReadModel,
  PlayerArmoryReadModel,
} from '../../domain/item/player-armory-page-context.model';
import { BulkMoveArmoryItemsToShelfResult } from '../../domain/item/armory-actions.model';
import {
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
import { mapBulkMoveArmoryItemsToShelfResult } from '../../utils/armory-actions-mappers';
import {
  mapArmoryMutationReadModel,
  mapPlayerArmoryPageContext,
} from '../../utils/player-armory-page-context.mapper';
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

  getArmoryReadModel(): Observable<PlayerArmoryReadModel> {
    return this.getArmoryPageContext().pipe(
      map((context) => context.readModel),
    );
  }

  getArmory(): Observable<PlayerArmoryReadModel> {
    return this.getArmoryReadModel();
  }

  renameShelf(input: RenameArmoryShelfInput): Observable<PlayerArmoryReadModel> {
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
            switchMap(() => this.getArmoryReadModel()),
          );
      }),
    );
  }

  moveItemToShelf(
    input: MoveArmoryItemToShelfInput,
    currentReadModel?: PlayerArmoryReadModel,
  ): Observable<PlayerArmoryReadModel> {
    const itemId = requiredArmoryText(input.itemId, 'itemId');
    const targetShelfPosition = movableArmoryShelfPosition(input.targetShelfPosition);

    return this.currentReadModel(currentReadModel).pipe(
      switchMap((readModel) =>
        this.activeHero.requireActiveHero().pipe(
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
                map((row) => mapArmoryMutationReadModel(
                  readModel,
                  row.visible_items_json,
                  row.armory_state_json,
                )),
              );
          }),
        ),
      ),
    );
  }

  bulkMoveItemsToShelf(
    input: BulkMoveArmoryItemsToShelfInput,
    currentReadModel?: PlayerArmoryReadModel,
  ): Observable<{
    result: BulkMoveArmoryItemsToShelfResult;
    readModel: PlayerArmoryReadModel;
  }> {
    const items = input.items.map((item, index) => ({
      itemId: requiredArmoryText(item.itemId, `items[${index}].itemId`),
    }));
    const targetShelfPosition =
      movableArmoryShelfPosition(input.targetShelfPosition);
    const requestId = nullableArmoryText(input.requestId);

    if (!items.length) {
      throw new Error(ARMORY_FEEDBACK_KEYS.ui.bulkMoveMissingItems);
    }

    return this.currentReadModel(currentReadModel).pipe(
      switchMap((readModel) =>
        this.activeHero.requireActiveHero().pipe(
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
                map((rows) => firstRpcRow(
                  rows,
                  RPC.bulk_move_hero_armory_items_to_shelf,
                )),
                map((row) => {
                  const result = mapBulkMoveArmoryItemsToShelfResult(row);
                  const nextReadModel = mapArmoryMutationReadModel(
                    readModel,
                    row.visible_items_json,
                    row.armory_state_json,
                  );

                  return { result, readModel: nextReadModel };
                }),
              );
          }),
        ),
      ),
    );
  }

  private currentReadModel(
    currentReadModel: PlayerArmoryReadModel | undefined,
  ): Observable<PlayerArmoryReadModel> {
    return currentReadModel
      ? of(currentReadModel)
      : this.getArmoryReadModel();
  }
}

function requiredArmoryText(value: string | null | undefined, field: string): string {
  return requiredTrimmedText(value, field, 'armory RPC');
}

function nullableArmoryText(value: string | null | undefined): string | null {
  return trimToNull(value);
}
