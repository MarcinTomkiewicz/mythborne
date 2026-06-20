import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  PlayerArmoryItemReadModel,
  PlayerArmoryPageContextReadModel,
} from '../../domain/item/player-armory-page-context.model';
import {
  ArmoryBulkMoveInventoryItemsInput,
  ArmoryRenameInventoryShelfInput,
} from '../../interfaces/item/armory-page-actions.interface';
import type {
  ArmoryInventoryMutationHandlers,
} from '../../interfaces/item/armory-page-mutation-handlers.interface';
import {
  armoryBulkMoveSelection,
  armoryVendorScrapItems,
} from '../../utils/armory/armory-page-inventory-selection';
import { armoryContextKey } from '../../utils/armory-context-key';
import { mapArmoryMutationReadModel } from '../../utils/player-armory-page-context.mapper';
import { ActiveHeroRuntimeInvalidation } from '../hero/active-hero-runtime-invalidation';
import { ItemLifecycleService } from './item-lifecycle';
import { PlayerArmory } from './player-armory';

@Injectable()
export class ArmoryPageInventoryMutationState {
  private readonly armory = inject(PlayerArmory);
  private readonly lifecycle = inject(ItemLifecycleService);
  private readonly runtimeInvalidation = inject(ActiveHeroRuntimeInvalidation);
  private readonly destroyRef = inject(DestroyRef);
  private actionToken = 0;

  readonly isMutating = signal(false);

  vendorScrapSelection(
    context: PlayerArmoryPageContextReadModel | null,
    itemIds: readonly string[],
  ): readonly PlayerArmoryItemReadModel[] | null {
    return context ? armoryVendorScrapItems(context, itemIds) : null;
  }

  vendorScrapInventoryItem(
    context: PlayerArmoryPageContextReadModel | null,
    itemId: string,
    handlers: ArmoryInventoryMutationHandlers,
    afterSuccess?: () => void,
  ): void {
    if (!context || this.isMutating()) {
      return;
    }

    const selectedItems = armoryVendorScrapItems(context, [itemId]);

    if (!selectedItems) {
      return;
    }

    const token = ++this.actionToken;
    const contextKey = armoryContextKey(context);

    this.isMutating.set(true);
    this.lifecycle.vendorScrapHeroItem({
      actorHeroId: context.heroId,
      itemId: selectedItems[0].itemId,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        if (!this.acceptsActionResponse(token, contextKey, handlers)) {
          return;
        }

        handlers.reload();
        afterSuccess?.();
        this.runtimeInvalidation.invalidateActiveHeroDashboardContext(
          'armory_vendor_scrap_committed',
          { serverId: context.serverId, heroId: context.heroId },
        );
      },
      error: () => {
        if (!this.acceptsActionResponse(token, contextKey, handlers)) {
          return;
        }

        this.isMutating.set(false);
      },
    });
  }

  bulkVendorScrapInventoryItems(
    context: PlayerArmoryPageContextReadModel | null,
    itemIds: readonly string[],
    handlers: ArmoryInventoryMutationHandlers,
    afterSuccess?: () => void,
  ): void {
    if (!context || this.isMutating() || !itemIds.length) {
      return;
    }

    const selectedItems = armoryVendorScrapItems(context, itemIds);

    if (!selectedItems) {
      return;
    }

    const token = ++this.actionToken;
    const contextKey = armoryContextKey(context);

    this.isMutating.set(true);
    this.lifecycle.bulkVendorScrapHeroItems({
      actorHeroId: context.heroId,
      items: selectedItems.map((item) => ({ itemId: item.itemId })),
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (result) => {
        if (!this.acceptsActionResponse(token, contextKey, handlers)) {
          return;
        }

        handlers.applyReadModel(mapArmoryMutationReadModel(
          context.readModel,
          result.visibleArmoryItemsJson,
          result.armoryStateJson,
        ));
        this.isMutating.set(false);
        afterSuccess?.();
        this.runtimeInvalidation.invalidateActiveHeroDashboardContext(
          'armory_bulk_vendor_scrap_committed',
          { serverId: context.serverId, heroId: context.heroId },
        );
      },
      error: () => {
        if (!this.acceptsActionResponse(token, contextKey, handlers)) {
          return;
        }

        this.isMutating.set(false);
      },
    });
  }

  bulkMoveInventoryItems(
    context: PlayerArmoryPageContextReadModel | null,
    input: ArmoryBulkMoveInventoryItemsInput,
    handlers: ArmoryInventoryMutationHandlers,
    afterSuccess?: () => void,
  ): void {
    if (!context || this.isMutating() || !input.itemIds.length) {
      return;
    }

    const selection = armoryBulkMoveSelection(
      context,
      input.itemIds,
      input.targetShelfPosition,
    );

    if (!selection) {
      return;
    }

    const token = ++this.actionToken;
    const contextKey = armoryContextKey(context);

    this.isMutating.set(true);
    this.armory.bulkMoveItemsToShelf({
      items: selection.selectedItems.map((item) => ({ itemId: item.itemId })),
      targetShelfPosition: input.targetShelfPosition,
    }, context.readModel).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: ({ readModel }) => {
        if (!this.acceptsActionResponse(token, contextKey, handlers)) {
          return;
        }

        handlers.applyReadModel(readModel);
        this.isMutating.set(false);
        afterSuccess?.();
      },
      error: () => {
        if (!this.acceptsActionResponse(token, contextKey, handlers)) {
          return;
        }

        this.isMutating.set(false);
      },
    });
  }

  renameInventoryShelf(
    context: PlayerArmoryPageContextReadModel | null,
    input: ArmoryRenameInventoryShelfInput,
    handlers: ArmoryInventoryMutationHandlers,
    afterSuccess?: () => void,
  ): void {
    if (!context || this.isMutating()) {
      return;
    }

    const token = ++this.actionToken;
    const contextKey = armoryContextKey(context);

    this.isMutating.set(true);
    this.armory.renameShelf({
      shelfPosition: input.shelfPosition,
      newName: input.name,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        if (!this.acceptsActionResponse(token, contextKey, handlers)) {
          return;
        }

        handlers.reload();
        afterSuccess?.();
      },
      error: () => {
        if (!this.acceptsActionResponse(token, contextKey, handlers)) {
          return;
        }

        this.isMutating.set(false);
      },
    });
  }

  reset(): void {
    this.isMutating.set(false);
  }

  private acceptsActionResponse(
    token: number,
    contextKey: string | null,
    handlers: ArmoryInventoryMutationHandlers,
  ): boolean {
    if (token !== this.actionToken) {
      return false;
    }

    if (contextKey !== handlers.currentContextKey()) {
      this.isMutating.set(false);
      return false;
    }

    return true;
  }
}
