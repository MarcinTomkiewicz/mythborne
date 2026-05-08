import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CurrentEquipmentLoadout,
  EquipmentOperationJournal,
  EquipmentSlotKey,
  EquippedItemSummary,
} from '../../domain/item/item-equipment.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import {
  EquipHeroItemInput,
  BulkEquipHeroItemsInput,
  HeroEquipment,
  LoadoutPresetInput,
  UnequipHeroSlotInput,
} from './hero-equipment';

export type CurrentEquipmentReadStatus =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'empty'
  | 'error';

@Injectable()
export class CurrentEquipmentState {
  private readonly activeHero = inject(ActiveHero);
  private readonly equipment = inject(HeroEquipment);
  private loadRequestId = 0;
  private actionRequestId = 0;

  readonly loadout = signal<CurrentEquipmentLoadout | null>(null);
  readonly status = signal<CurrentEquipmentReadStatus>('idle');
  readonly error = signal<string | null>(null);
  readonly actionJournal = signal<EquipmentOperationJournal | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly isMutating = signal(false);
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
    this.actionRequestId++;
    this.loadout.set(null);
    this.status.set('idle');
    this.error.set(null);
    this.actionJournal.set(null);
    this.actionError.set(null);
    this.isMutating.set(false);
  }

  slot(slotKey: EquipmentSlotKey): EquippedItemSummary | null {
    return this.slotMap().get(slotKey) ?? null;
  }

  equipItem(input: EquipHeroItemInput, afterResponse?: () => void): void {
    this.runEquipmentAction(
      () => this.equipment.equipItem(input),
      afterResponse,
    );
  }

  bulkEquipItems(input: BulkEquipHeroItemsInput, afterResponse?: () => void): void {
    this.runEquipmentAction(
      () => this.equipment.bulkEquipItems(input),
      afterResponse,
    );
  }

  applyLoadoutPreset(input: LoadoutPresetInput, afterResponse?: () => void): void {
    this.runEquipmentAction(
      () => this.equipment.applyLoadoutPreset(input),
      afterResponse,
    );
  }

  unequipSlot(input: UnequipHeroSlotInput, afterResponse?: () => void): void {
    this.runEquipmentAction(
      () => this.equipment.unequipSlot(input),
      afterResponse,
    );
  }

  private runEquipmentAction(
    operation: () => Observable<EquipmentOperationJournal>,
    afterResponse?: () => void,
  ): void {
    const requestId = ++this.actionRequestId;
    const requestContextKey = this.currentContextKey();

    this.actionJournal.set(null);
    this.actionError.set(null);

    if (!requestContextKey) {
      this.actionError.set('No active hero for equipment action.');
      return;
    }

    this.isMutating.set(true);

    let request;
    try {
      request = operation();
    } catch (error: unknown) {
      if (requestId === this.actionRequestId) {
        this.isMutating.set(false);
        this.actionError.set(
          getErrorMessage(error, 'Equipment action failed.'),
        );
      }
      return;
    }

    request.subscribe({
      next: (journal) => {
        if (!this.acceptsActionResponse(requestId, requestContextKey)) {
          return;
        }

        this.actionJournal.set(journal);
        this.applyFinalEquipment(journal.finalEquipment);
        this.isMutating.set(false);
        afterResponse?.();
      },
      error: (error: unknown) => {
        if (!this.acceptsActionResponse(requestId, requestContextKey)) {
          return;
        }

        this.isMutating.set(false);
        this.actionError.set(
          getErrorMessage(error, 'Equipment action failed.'),
        );
      },
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
      this.loadout.set(null);
      this.status.set('error');
      this.error.set('Current equipment context changed.');
      return false;
    }

    return true;
  }

  private acceptsActionResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.actionRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.loadout.set(null);
      this.status.set('error');
      this.isMutating.set(false);
      this.actionError.set('Current equipment context changed.');
      return false;
    }

    return true;
  }

  private applyFinalEquipment(loadout: CurrentEquipmentLoadout | null): void {
    if (!loadout) {
      this.refresh();
      return;
    }

    this.loadout.set(loadout);
    this.status.set(loadout.slots.length ? 'loaded' : 'empty');
  }
}

function toContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
