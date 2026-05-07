import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CurrentEquipmentLoadout,
  EquipmentSlotKey,
  EquippedItemSummary,
} from '../../domain/item/item-equipment.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { PlayerEquipment } from './player-equipment';

export type CurrentEquipmentReadStatus =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'empty'
  | 'error';

@Injectable()
export class CurrentEquipmentState {
  private readonly activeHero = inject(ActiveHero);
  private readonly equipment = inject(PlayerEquipment);
  private loadRequestId = 0;

  readonly loadout = signal<CurrentEquipmentLoadout | null>(null);
  readonly status = signal<CurrentEquipmentReadStatus>('idle');
  readonly error = signal<string | null>(null);
  readonly isLoading = computed(() => this.status() === 'loading');
  readonly isEmpty = computed(() => this.status() === 'empty');
  readonly slots = computed(() => this.loadout()?.slots ?? []);
  readonly slotMap = computed(() =>
    new Map(this.slots().map((slot) => [slot.slotKey, slot])),
  );

  load(): void {
    const requestId = ++this.loadRequestId;
    const requestContextKey = this.currentContextKey();

    this.loadout.set(null);
    this.error.set(null);

    if (!requestContextKey) {
      this.status.set('error');
      this.error.set('No active hero for current equipment.');
      return;
    }

    this.status.set('loading');

    this.equipment.getCurrentEquipment().subscribe({
      next: (loadout) => {
        if (!this.acceptsLoadResponse(requestId, requestContextKey)) {
          return;
        }

        this.loadout.set(loadout);
        this.status.set(loadout.slots.length ? 'loaded' : 'empty');
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, requestContextKey)) {
          return;
        }

        this.loadout.set(null);
        this.status.set('error');
        this.error.set(
          getErrorMessage(error, 'Failed to load current equipment.'),
        );
      },
    });
  }

  refresh(): void {
    this.load();
  }

  clear(): void {
    this.loadRequestId++;
    this.loadout.set(null);
    this.status.set('idle');
    this.error.set(null);
  }

  slot(slotKey: EquipmentSlotKey): EquippedItemSummary | null {
    return this.slotMap().get(slotKey) ?? null;
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsLoadResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.loadRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.loadout.set(null);
      this.status.set('error');
      this.error.set('Current equipment context changed.');
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
