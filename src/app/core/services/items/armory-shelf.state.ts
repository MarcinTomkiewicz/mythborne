import { computed, inject, Injectable, signal } from '@angular/core';
import { EMPTY, Observable, switchMap, tap } from 'rxjs';
import { HeroArmoryReadModel } from '../../domain/item/item-equipment.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { ItemLifecycleService } from './item-lifecycle';
import { ArmoryShelfMutationRunner } from './armory-shelf-mutation-runner';
import {
  MoveArmoryItemToShelfInput,
  PlayerArmory,
  RenameArmoryShelfInput,
} from './player-armory';

export type ArmoryShelfReadStatus =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'empty'
  | 'error';

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
      failureMessage: 'Armory shelf action failed.',
    });
  }

  vendorScrapItem(itemId: string, afterResponse?: () => void): void {
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
      afterResponse: input.afterResponse,
      successMessage: input.successMessage,
      failureMessage: 'Item lifecycle action failed.',
      committedRefreshFailureMessage:
        'Armory refresh failed after item lifecycle action.',
      hasCommitted: () => lifecycleSucceeded,
      operation: (_requestId, _requestContextKey, acceptsCurrentContext) => {
        const actorHeroId = requiredActorHeroId(this.activeHero.state());
        const itemId = requiredItemId(input.itemId);

        return input.operation(actorHeroId, itemId).pipe(
          tap(() => {
            lifecycleSucceeded = true;
            if (!acceptsCurrentContext()) {
              return;
            }

            this.actionMessage.set(input.successMessage);
            input.afterResponse?.();
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

interface ArmoryMutationOptions {
  operation: (
    requestId: number,
    requestContextKey: string,
    acceptsCurrentContext: () => boolean,
  ) => Observable<HeroArmoryReadModel>;
  afterResponse?: () => void;
  successMessage?: string;
  failureMessage: string;
  committedRefreshFailureMessage?: string;
  hasCommitted?: () => boolean;
}

interface ArmoryLifecycleMutationInput<T> {
  itemId: string;
  operation: (actorHeroId: string, itemId: string) => Observable<T>;
  afterResponse?: () => void;
  successMessage: string;
}

function requiredItemId(itemId: string): string {
  const normalizedItemId = itemId.trim();

  if (!normalizedItemId) {
    throw new Error('itemId is required for item lifecycle action.');
  }

  return normalizedItemId;
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
