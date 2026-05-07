import { computed, inject, Injectable, signal } from '@angular/core';
import { HeroArmoryReadModel } from '../../domain/item/item-equipment.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { PlayerArmory } from './player-armory';

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
  private loadRequestId = 0;

  readonly readModel = signal<HeroArmoryReadModel | null>(null);
  readonly status = signal<ArmoryShelfReadStatus>('idle');
  readonly error = signal<string | null>(null);
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
    this.readModel.set(null);
    this.status.set('idle');
    this.error.set(null);
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
}

function toContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
