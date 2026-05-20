import { computed, inject, Injectable, signal } from '@angular/core';
import { EMPTY, map, Observable, switchMap, tap } from 'rxjs';
import {
  BulkVendorScrapHeroItemsResult,
  VendorScrapHeroItemResult,
} from '../../domain/item/item-lifecycle.model';
import { BulkMoveArmoryItemsToShelfResult } from '../../domain/item/armory-actions.model';
import { HeroArmoryReadModel } from '../../domain/item/item-equipment.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import {
  BulkMoveArmoryItemsToShelfInput,
  MoveArmoryItemToShelfInput,
  RenameArmoryShelfInput,
} from '../../interfaces/item/armory-actions.interface';
import {
  ArmoryBulkLifecycleMutationInput,
  ArmoryLifecycleMutationInput,
  ArmoryMutationOptions,
} from '../../interfaces/item/armory-shelf-mutation.interface';
import { ArmoryShelfReadStatus } from '../../types/armory-shelf.types';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { ItemLifecycleService } from './item-lifecycle';
import { ArmoryShelfMutationRunner } from './armory-shelf-mutation-runner';
import { PlayerArmory } from './player-armory';

@Injectable()
export class ArmoryShelfState {
  private readonly activeHero = inject(ActiveHero);
  private readonly armory = inject(PlayerArmory);
  private readonly lifecycle = inject(ItemLifecycleService);
  private readonly mutationRunner = new ArmoryShelfMutationRunner();
  private loadRequestId = 0;

  readonly readModel = signal<HeroArmoryReadModel | null>(null);
  readonly status = signal<ArmoryShelfReadStatus>('idle');
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionMessage = signal<string | null>(null);
  readonly isMutating = signal(false);
  readonly isLoading = computed(() => this.status() === 'loading');
  readonly isEmpty = computed(() => this.status() === 'empty');
  readonly shelves = computed(() => this.readModel()?.shelves ?? []);
  readonly visibleItems = computed(() => this.readModel()?.visibleItems ?? []);
  readonly visibility = computed(() => this.readModel()?.visibility ?? null);

  load(): void {
    const requestId = ++this.loadRequestId;
    const requestContextKey = this.currentContextKey();

    this.readModel.set(null);
    this.error.set(null);
    this.actionError.set(null);
    this.actionMessage.set(null);

    if (!requestContextKey) {
      this.status.set('error');
      this.error.set('No active hero for armory shelves.');
      return;
    }

    this.status.set('loading');

    this.armory.getArmory().subscribe({
      next: (readModel) => {
        if (!this.acceptsLoadResponse(requestId, requestContextKey)) {
          return;
        }

        this.readModel.set(readModel);
        this.status.set(readModel.visibleItems.length ? 'loaded' : 'empty');
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, requestContextKey)) {
          return;
        }

        this.readModel.set(null);
        this.status.set('error');
        this.error.set(getErrorMessage(error, 'Failed to load armory shelves.'));
      },
    });
  }

  refresh(): void {
    this.load();
  }

  clear(): void {
    this.loadRequestId++;
    this.mutationRunner.invalidate();
    this.readModel.set(null);
    this.status.set('idle');
    this.error.set(null);
    this.actionError.set(null);
    this.actionMessage.set(null);
    this.isMutating.set(false);
  }

  renameShelf(input: RenameArmoryShelfInput): void {
    this.runMutation({
      operation: () => this.armory.renameShelf(input),
      failureMessage: 'Armory shelf action failed.',
    });
  }

  moveItemToShelf(input: MoveArmoryItemToShelfInput): void {
    this.runMutation({
      operation: () => this.armory.moveItemToShelf(input),
      successMessage: 'Item moved.',
      failureMessage: 'Armory shelf action failed.',
    });
  }

  bulkMoveItemsToShelf(
    input: BulkMoveArmoryItemsToShelfInput,
    afterResponse?: (result: BulkMoveArmoryItemsToShelfResult) => void,
  ): void {
    let bulkMoveSucceeded = false;
    this.runMutation({
      failureMessage: 'Armory shelf action failed.',
      committedRefreshFailureMessage:
        'Armory refresh failed after moving selected items.',
      hasCommitted: () => bulkMoveSucceeded,
      operation: (_requestId, _requestContextKey, acceptsCurrentContext) =>
        this.armory.bulkMoveItemsToShelf(input).pipe(
          tap(({ result }) => {
            bulkMoveSucceeded = result.movedCount > 0 || result.skippedCount > 0;
            if (acceptsCurrentContext()) {
              afterResponse?.(result);
            }
          }),
          map(({ readModel }) => readModel),
        ),
    });
  }

  vendorScrapItem(
    itemId: string,
    afterResponse?: (result: VendorScrapHeroItemResult) => void,
  ): void {
    this.runLifecycleMutation({
      itemId,
      afterResponse,
      successMessage: 'Item sold to vendor.',
      operation: (actorHeroId, normalizedItemId) =>
        this.lifecycle.vendorScrapHeroItem({
          actorHeroId,
          itemId: normalizedItemId,
          reason: 'Player vendor scrap',
        }),
    });
  }

  bulkVendorScrapItems(
    itemIds: readonly string[],
    afterResponse?: (result: BulkVendorScrapHeroItemsResult) => void,
  ): void {
    this.runBulkLifecycleMutation({
      itemIds,
      afterResponse,
      successMessage: 'Selected items sold to vendor.',
      operation: (actorHeroId, normalizedItemIds) =>
        this.lifecycle.bulkVendorScrapHeroItems({
          actorHeroId,
          items: normalizedItemIds.map((itemId) => ({ itemId })),
          reason: 'Player bulk vendor scrap',
        }),
    });
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsLoadResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.loadRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.readModel.set(null);
      this.status.set('error');
      this.error.set('Armory shelf context changed.');
      return false;
    }

    return true;
  }

  private runMutation(options: ArmoryMutationOptions): void {
    this.mutationRunner.run({
      ...options,
      currentContextKey: () => this.currentContextKey(),
      applyReadModel: (readModel) => this.applyReadModel(readModel),
      markContextChanged: () => this.markActionContextChanged(),
      markReadModelError: () => this.markReadModelError(),
      setActionError: (message) => this.actionError.set(message),
      setActionMessage: (message) => this.actionMessage.set(message),
      setMutating: (isMutating) => this.isMutating.set(isMutating),
    });
  }

  private runLifecycleMutation<T>(input: ArmoryLifecycleMutationInput<T>): void {
    let lifecycleSucceeded = false;
    this.runMutation({
      successMessage: input.successMessage,
      failureMessage: 'Item lifecycle action failed.',
      committedRefreshFailureMessage:
        'Armory refresh failed after item lifecycle action.',
      hasCommitted: () => lifecycleSucceeded,
      operation: (_requestId, _requestContextKey, acceptsCurrentContext) => {
        const actorHeroId = requiredActorHeroId(this.activeHero.state());
        const itemId = requiredItemId(input.itemId);

        return input.operation(actorHeroId, itemId).pipe(
          tap((result) => {
            lifecycleSucceeded = true;
            if (!acceptsCurrentContext()) {
              return;
            }

            this.actionMessage.set(input.successMessage);
            input.afterResponse?.(result);
          }),
          switchMap(() => {
            if (!acceptsCurrentContext()) {
              return EMPTY;
            }

            return this.armory.getArmory();
          }),
        );
      },
    });
  }

  private runBulkLifecycleMutation<T>(
    input: ArmoryBulkLifecycleMutationInput<T>,
  ): void {
    let lifecycleSucceeded = false;
    this.runMutation({
      successMessage: input.successMessage,
      failureMessage: 'Item lifecycle action failed.',
      committedRefreshFailureMessage:
        'Armory refresh failed after item lifecycle action.',
      hasCommitted: () => lifecycleSucceeded,
      operation: (_requestId, _requestContextKey, acceptsCurrentContext) => {
        const actorHeroId = requiredActorHeroId(this.activeHero.state());
        const itemIds = requiredItemIds(input.itemIds);

        return input.operation(actorHeroId, itemIds).pipe(
          tap((result) => {
            lifecycleSucceeded = true;
            if (!acceptsCurrentContext()) {
              return;
            }

            this.actionMessage.set(input.successMessage);
            input.afterResponse?.(result);
          }),
          switchMap(() => {
            if (!acceptsCurrentContext()) {
              return EMPTY;
            }

            return this.armory.getArmory();
          }),
        );
      },
    });
  }

  private applyReadModel(readModel: HeroArmoryReadModel): void {
    this.readModel.set(readModel);
    this.status.set(readModel.visibleItems.length ? 'loaded' : 'empty');
  }

  private markActionContextChanged(): void {
    this.readModel.set(null);
    this.status.set('error');
    this.isMutating.set(false);
    this.actionError.set('Armory shelf context changed.');
  }

  private markReadModelError(): void {
    this.readModel.set(null);
    this.status.set('error');
  }
}

function requiredItemId(itemId: string): string {
  const normalizedItemId = itemId.trim();

  if (!normalizedItemId) {
    throw new Error('itemId is required for item lifecycle action.');
  }

  return normalizedItemId;
}

function requiredItemIds(itemIds: readonly string[]): string[] {
  const normalizedItemIds = itemIds
    .map(requiredItemId)
    .filter((itemId, index, ids) => ids.indexOf(itemId) === index);

  if (!normalizedItemIds.length) {
    throw new Error('itemIds are required for item lifecycle action.');
  }

  return normalizedItemIds;
}

function requiredActorHeroId(state: Pick<ActiveHeroState, 'heroId'> | null): string {
  const actorHeroId = state?.heroId ?? null;

  if (!actorHeroId) {
    throw new Error('No active hero for item lifecycle action.');
  }

  return actorHeroId;
}

function toContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
