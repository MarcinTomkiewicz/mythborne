import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Origin } from '../../domain/origin/origin.model';
import {
  PlayerArmoryEquipmentSlotReadModel,
  PlayerArmoryLoadoutPresetReadModel,
  PlayerArmoryPageCopyReadModel,
  PlayerArmoryPageContextReadModel,
  PlayerArmoryReadModel,
} from '../../domain/item/player-armory-page-context.model';
import {
  ArmoryBulkMoveInventoryItemsInput,
  ArmoryRenameInventoryShelfInput,
} from '../../interfaces/item/armory-page-actions.interface';
import { Json } from '../../types/database.types';
import { getErrorMessage } from '../../utils/error-message';
import {
  canVendorScrapInventoryItem,
  playerArmoryContextKey,
  visibleArmoryItemsById,
} from '../../domain/item/player-armory-page-helpers';
import { ActiveHeroRuntimeInvalidation } from '../hero/active-hero-runtime-invalidation';
import { ItemLifecycleService } from './item-lifecycle';
import { PlayerArmory } from './player-armory';

@Injectable()
export class ArmoryPageFacade {
  private readonly armory = inject(PlayerArmory);
  private readonly lifecycle = inject(ItemLifecycleService);
  private readonly runtimeInvalidation = inject(ActiveHeroRuntimeInvalidation);
  private readonly destroyRef = inject(DestroyRef);
  private loadToken = 0;
  private inventoryActionToken = 0;

  readonly status = signal<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  readonly error = signal<string | null>(null);
  readonly context = signal<PlayerArmoryPageContextReadModel | null>(null);
  readonly readModel = signal<PlayerArmoryReadModel | null>(null);
  readonly copyJson = signal<PlayerArmoryPageCopyReadModel | null>(null);
  readonly loadoutPresets = signal<PlayerArmoryLoadoutPresetReadModel[]>([]);
  readonly runtimeDerivedStats = signal<Json | null>(null);
  readonly heroLuck = signal(0);
  readonly equipmentSlots = signal<PlayerArmoryEquipmentSlotReadModel[]>([]);
  readonly origin = signal<Origin | null>(null);
  readonly isInventoryMutating = signal(false);

  loadData(): void {
    const token = ++this.loadToken;

    this.status.set('loading');
    this.error.set(null);
    this.context.set(null);
    this.readModel.set(null);
    this.copyJson.set(null);
    this.loadoutPresets.set([]);
    this.runtimeDerivedStats.set(null);
    this.equipmentSlots.set([]);
    this.origin.set(null);
    this.isInventoryMutating.set(false);

    this.armory.getArmoryPageContext().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (context) => {
        if (token !== this.loadToken) {
          return;
        }

        this.context.set(context);
        this.readModel.set(context.readModel);
        this.copyJson.set(context.copyJson);
        this.equipmentSlots.set(context.equipmentSlots);
        this.loadoutPresets.set(context.loadoutPresets);
        this.runtimeDerivedStats.set(context.runtimeDerivedStats);
        this.status.set('loaded');
      },
      error: (error: unknown) => {
        if (token !== this.loadToken) {
          return;
        }

        this.context.set(null);
        this.readModel.set(null);
        this.copyJson.set(null);
        this.loadoutPresets.set([]);
        this.runtimeDerivedStats.set(null);
        this.status.set('error');
        this.error.set(getErrorMessage(error, 'Failed to load armory page context.'));
      },
    });
  }

  vendorScrapInventoryItem(
    itemId: string,
    afterSuccess?: () => void,
  ): void {
    const context = this.context();

    if (!context || this.isInventoryMutating()) {
      return;
    }

    const selectedItems = visibleArmoryItemsById(context, [itemId]);

    if (
      selectedItems.length !== 1
      || selectedItems.some((item) => !canVendorScrapInventoryItem(item))
    ) {
      return;
    }

    const token = ++this.inventoryActionToken;
    const contextKey = playerArmoryContextKey(context);

    this.isInventoryMutating.set(true);
    this.lifecycle.vendorScrapHeroItem({
      actorHeroId: context.heroId,
      itemId: selectedItems[0].itemId,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        if (!this.acceptsInventoryActionResponse(token, contextKey)) {
          return;
        }

        afterSuccess?.();
        this.refreshAfterInventoryMutation();
        this.runtimeInvalidation.invalidateActiveHeroDashboardContext(
          'armory_vendor_scrap_committed',
          { serverId: context.serverId, heroId: context.heroId },
        );
      },
      error: () => {
        if (!this.acceptsInventoryActionResponse(token, contextKey)) {
          return;
        }

        this.isInventoryMutating.set(false);
      },
    });
  }

  bulkVendorScrapInventoryItems(
    itemIds: readonly string[],
    afterSuccess?: () => void,
  ): void {
    const context = this.context();

    if (!context || this.isInventoryMutating() || !itemIds.length) {
      return;
    }

    const selectedItems = visibleArmoryItemsById(context, itemIds);

    if (
      selectedItems.length !== itemIds.length
      || selectedItems.some((item) => !canVendorScrapInventoryItem(item))
    ) {
      return;
    }

    const token = ++this.inventoryActionToken;
    const contextKey = playerArmoryContextKey(context);

    this.isInventoryMutating.set(true);
    this.lifecycle.bulkVendorScrapHeroItems({
      actorHeroId: context.heroId,
      items: selectedItems.map((item) => ({ itemId: item.itemId })),
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        if (!this.acceptsInventoryActionResponse(token, contextKey)) {
          return;
        }

        afterSuccess?.();
        this.refreshAfterInventoryMutation();
        this.runtimeInvalidation.invalidateActiveHeroDashboardContext(
          'armory_bulk_vendor_scrap_committed',
          { serverId: context.serverId, heroId: context.heroId },
        );
      },
      error: () => {
        if (!this.acceptsInventoryActionResponse(token, contextKey)) {
          return;
        }

        this.isInventoryMutating.set(false);
      },
    });
  }

  bulkMoveInventoryItems(
    input: ArmoryBulkMoveInventoryItemsInput,
    afterSuccess?: () => void,
  ): void {
    const context = this.context();

    if (!context || this.isInventoryMutating() || !input.itemIds.length) {
      return;
    }

    const selectedItems = visibleArmoryItemsById(context, input.itemIds);
    const targetShelf = context.readModel.shelves.find((shelf) =>
      shelf.position === input.targetShelfPosition
      && shelf.isPersisted
      && !shelf.isUnsortedDropArea,
    );

    if (selectedItems.length !== input.itemIds.length || !targetShelf) {
      return;
    }

    const token = ++this.inventoryActionToken;
    const contextKey = playerArmoryContextKey(context);

    this.isInventoryMutating.set(true);
    this.armory.bulkMoveItemsToShelf({
      items: selectedItems.map((item) => ({ itemId: item.itemId })),
      targetShelfPosition: input.targetShelfPosition,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        if (!this.acceptsInventoryActionResponse(token, contextKey)) {
          return;
        }

        afterSuccess?.();
        this.refreshAfterInventoryMutation();
      },
      error: () => {
        if (!this.acceptsInventoryActionResponse(token, contextKey)) {
          return;
        }

        this.isInventoryMutating.set(false);
      },
    });
  }

  renameInventoryShelf(
    input: ArmoryRenameInventoryShelfInput,
    afterSuccess?: () => void,
  ): void {
    const context = this.context();

    if (!context || this.isInventoryMutating()) {
      return;
    }

    const token = ++this.inventoryActionToken;
    const contextKey = playerArmoryContextKey(context);

    this.isInventoryMutating.set(true);
    this.armory.renameShelf({
      shelfPosition: input.shelfPosition,
      newName: input.name,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        if (!this.acceptsInventoryActionResponse(token, contextKey)) {
          return;
        }

        afterSuccess?.();
        this.refreshAfterInventoryMutation();
      },
      error: () => {
        if (!this.acceptsInventoryActionResponse(token, contextKey)) {
          return;
        }

        this.isInventoryMutating.set(false);
      },
    });
  }

  private acceptsInventoryActionResponse(
    token: number,
    contextKey: string | null,
  ): boolean {
    if (token !== this.inventoryActionToken) {
      return false;
    }

    if (contextKey !== playerArmoryContextKey(this.context())) {
      this.isInventoryMutating.set(false);
      return false;
    }

    return true;
  }

  private refreshAfterInventoryMutation(): void {
    this.isInventoryMutating.set(false);
    this.loadData();
  }
}

