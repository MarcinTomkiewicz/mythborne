import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { EquipmentOperationJournal } from '../../domain/item/item-equipment.model';
import {
  PlayerArmoryPageContextReadModel,
} from '../../domain/item/player-armory-page-context.model';
import type {
  ArmoryEquipmentMutationHandlers,
} from '../../interfaces/item/armory-page-mutation-handlers.interface';
import {
  armoryEquippableItems,
} from '../../utils/armory/armory-page-inventory-selection';
import {
  equippedArmorySlotsByItemIds,
} from '../../utils/armory-page-equipment-slots.mapper';
import {
  armoryContextWithEquipmentJournal,
} from '../../utils/armory-page-context-state';
import { armoryContextKey } from '../../utils/armory-context-key';
import { ActiveHeroRuntimeInvalidation } from '../hero/active-hero-runtime-invalidation';
import { HeroEquipment } from './hero-equipment';

@Injectable()
export class ArmoryPageEquipmentMutationState {
  private readonly equipment = inject(HeroEquipment);
  private readonly runtimeInvalidation = inject(ActiveHeroRuntimeInvalidation);
  private readonly destroyRef = inject(DestroyRef);
  private actionToken = 0;

  readonly isMutating = signal(false);

  equipInventoryItem(
    context: PlayerArmoryPageContextReadModel | null,
    itemId: string,
    handlers: ArmoryEquipmentMutationHandlers,
    afterSuccess?: () => void,
  ): void {
    if (!context || this.isMutating()) {
      return;
    }

    const selectedItems = armoryEquippableItems(context, [itemId]);

    if (!selectedItems) {
      return;
    }

    this.runEquipmentAction(
      context,
      () => this.equipment.equipItem({ itemId }),
      handlers,
      afterSuccess,
      'armory_equipment_mutation_committed',
    );
  }

  bulkEquipInventoryItems(
    context: PlayerArmoryPageContextReadModel | null,
    itemIds: readonly string[],
    handlers: ArmoryEquipmentMutationHandlers,
    afterSuccess?: () => void,
  ): void {
    if (!context || this.isMutating() || !itemIds.length) {
      return;
    }

    const selectedItems = armoryEquippableItems(context, itemIds);

    if (!selectedItems) {
      return;
    }

    this.runEquipmentAction(
      context,
      () => this.equipment.bulkEquipItems({
        items: selectedItems.map((item) => ({ itemId: item.itemId })),
      }),
      handlers,
      afterSuccess,
      'armory_bulk_equipment_mutation_committed',
    );
  }

  bulkUnequipEquipmentItems(
    context: PlayerArmoryPageContextReadModel | null,
    itemIds: readonly string[],
    handlers: ArmoryEquipmentMutationHandlers,
    afterSuccess?: () => void,
  ): void {
    if (!context || this.isMutating() || !itemIds.length) {
      return;
    }

    const equippedItems = equippedArmorySlotsByItemIds(context.equipmentSlots, itemIds);

    if (equippedItems.length !== itemIds.length) {
      return;
    }

    this.runEquipmentAction(
      context,
      () => this.equipment.bulkUnequipItems({
        items: equippedItems.map((slot) => ({ itemId: slot.itemId })),
      }),
      handlers,
      afterSuccess,
      'armory_bulk_equipment_mutation_committed',
    );
  }

  reset(): void {
    this.isMutating.set(false);
  }

  private runEquipmentAction(
    context: PlayerArmoryPageContextReadModel,
    operation: () => Observable<EquipmentOperationJournal>,
    handlers: ArmoryEquipmentMutationHandlers,
    afterSuccess: (() => void) | undefined,
    invalidationReason: string,
  ): void {
    const token = ++this.actionToken;
    const contextKey = armoryContextKey(context);

    this.isMutating.set(true);
    operation().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (journal) => {
        if (!this.acceptsActionResponse(token, contextKey, handlers)) {
          return;
        }

        const nextContext = armoryContextWithEquipmentJournal(context, journal);

        handlers.applyContext(nextContext.context);

        if (!nextContext.appliedReadModel) {
          handlers.reload();
        }
        this.isMutating.set(false);
        afterSuccess?.();
        this.runtimeInvalidation.invalidateActiveHeroDashboardContext(
          invalidationReason,
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

  private acceptsActionResponse(
    token: number,
    contextKey: string | null,
    handlers: ArmoryEquipmentMutationHandlers,
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
