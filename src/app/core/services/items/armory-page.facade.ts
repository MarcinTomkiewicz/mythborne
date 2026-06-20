import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  PlayerArmoryPageContextReadModel,
  PlayerArmoryItemReadModel,
  PlayerArmoryReadModel,
} from '../../domain/item/player-armory-page-context.model';
import {
  ArmoryBulkMoveInventoryItemsInput,
  ArmoryRenameInventoryShelfInput,
} from '../../interfaces/item/armory-page-actions.interface';
import type {
  ArmoryEquipmentMutationHandlers,
  ArmoryInventoryMutationHandlers,
} from '../../interfaces/item/armory-page-mutation-handlers.interface';
import { getErrorMessage } from '../../utils/error-message';
import {
  armoryContextWithReadModel,
} from '../../utils/armory-page-context-state';
import { armoryContextKey } from '../../utils/armory-context-key';
import { PlayerArmory } from './player-armory';
import { ARMORY_FEEDBACK_KEYS } from '../../constants/armory-feedback-keys.const';
import {
  ArmoryPageEquipmentMutationState,
} from './armory-page-equipment-mutation.state';
import {
  ArmoryPageInventoryMutationState,
} from './armory-page-inventory-mutation.state';

@Injectable()
export class ArmoryPageFacade {
  private readonly armory = inject(PlayerArmory);
  private readonly equipmentMutations = inject(ArmoryPageEquipmentMutationState);
  private readonly inventoryMutations = inject(ArmoryPageInventoryMutationState);
  private readonly destroyRef = inject(DestroyRef);
  private loadToken = 0;

  readonly status = signal<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  readonly error = signal<string | null>(null);
  readonly context = signal<PlayerArmoryPageContextReadModel | null>(null);
  readonly readModel = computed(() => this.context()?.readModel ?? null);
  readonly loadoutPresets = computed(() => this.context()?.loadoutPresets ?? []);
  readonly equipmentSlots = computed(() => this.context()?.equipmentSlots ?? []);
  readonly isInventoryMutating = computed(() => this.inventoryMutations.isMutating());
  readonly isEquipmentMutating = computed(() => this.equipmentMutations.isMutating());

  vendorScrapSelection(
    itemIds: readonly string[],
  ): readonly PlayerArmoryItemReadModel[] | null {
    return this.inventoryMutations.vendorScrapSelection(this.context(), itemIds);
  }

  loadData(): void {
    const token = ++this.loadToken;

    this.status.set('loading');
    this.error.set(null);
    this.context.set(null);
    this.inventoryMutations.reset();
    this.equipmentMutations.reset();

    this.armory.getArmoryPageContext().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (context) => {
        if (token !== this.loadToken) {
          return;
        }

        this.context.set(context);
        this.status.set('loaded');
      },
      error: (error: unknown) => {
        if (token !== this.loadToken) {
          return;
        }

        this.context.set(null);
        this.status.set('error');
        this.error.set(getErrorMessage(error, ARMORY_FEEDBACK_KEYS.ui.pageLoadFailed));
      },
    });
  }

  vendorScrapInventoryItem(
    itemId: string,
    afterSuccess?: () => void,
  ): void {
    this.inventoryMutations.vendorScrapInventoryItem(
      this.context(),
      itemId,
      this.inventoryMutationHandlers(),
      afterSuccess,
    );
  }

  bulkVendorScrapInventoryItems(
    itemIds: readonly string[],
    afterSuccess?: () => void,
  ): void {
    this.inventoryMutations.bulkVendorScrapInventoryItems(
      this.context(),
      itemIds,
      this.inventoryMutationHandlers(),
      afterSuccess,
    );
  }

  bulkMoveInventoryItems(
    input: ArmoryBulkMoveInventoryItemsInput,
    afterSuccess?: () => void,
  ): void {
    this.inventoryMutations.bulkMoveInventoryItems(
      this.context(),
      input,
      this.inventoryMutationHandlers(),
      afterSuccess,
    );
  }

  equipInventoryItem(
    itemId: string,
    afterSuccess?: () => void,
  ): void {
    if (this.isInventoryMutating()) {
      return;
    }

    this.equipmentMutations.equipInventoryItem(
      this.context(),
      itemId,
      this.equipmentMutationHandlers(),
      afterSuccess,
    );
  }

  bulkEquipInventoryItems(
    itemIds: readonly string[],
    afterSuccess?: () => void,
  ): void {
    if (this.isInventoryMutating()) {
      return;
    }

    this.equipmentMutations.bulkEquipInventoryItems(
      this.context(),
      itemIds,
      this.equipmentMutationHandlers(),
      afterSuccess,
    );
  }

  bulkUnequipEquipmentItems(
    itemIds: readonly string[],
    afterSuccess?: () => void,
  ): void {
    if (this.isInventoryMutating()) {
      return;
    }

    this.equipmentMutations.bulkUnequipEquipmentItems(
      this.context(),
      itemIds,
      this.equipmentMutationHandlers(),
      afterSuccess,
    );
  }

  renameInventoryShelf(
    input: ArmoryRenameInventoryShelfInput,
    afterSuccess?: () => void,
  ): void {
    this.inventoryMutations.renameInventoryShelf(
      this.context(),
      input,
      this.inventoryMutationHandlers(),
      afterSuccess,
    );
  }

  private inventoryMutationHandlers(): ArmoryInventoryMutationHandlers {
    return {
      currentContextKey: () => armoryContextKey(this.context()),
      applyReadModel: (readModel: PlayerArmoryReadModel) => this.applyReadModel(readModel),
      reload: () => this.loadData(),
    };
  }

  private equipmentMutationHandlers(): ArmoryEquipmentMutationHandlers {
    return {
      currentContextKey: () => armoryContextKey(this.context()),
      applyContext: (context: PlayerArmoryPageContextReadModel) =>
        this.context.set(context),
      reload: () => this.loadData(),
    };
  }

  private applyReadModel(readModel: PlayerArmoryReadModel): void {
    const context = this.context();

    if (!context) {
      return;
    }

    this.context.set(armoryContextWithReadModel(context, readModel));
  }

}
