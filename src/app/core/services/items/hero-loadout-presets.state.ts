import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import {
  EquipmentSlot,
  LoadoutPreset,
  LoadoutPresetPreview,
} from '../../domain/item/item-equipment.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { HeroEquipment } from './hero-equipment';

@Injectable()
export class HeroLoadoutPresetsState {
  private readonly activeHero = inject(ActiveHero);
  private readonly equipment = inject(HeroEquipment);
  private loadRequestId = 0;
  private actionRequestId = 0;
  private previewRequestId = 0;

  readonly presets = signal<LoadoutPreset[]>([]);
  readonly preview = signal<LoadoutPresetPreview | null>(null);
  readonly previewSlots = signal<EquipmentSlot[]>([]);
  readonly status = signal<'idle' | 'loading' | 'loaded' | 'empty' | 'error'>('idle');
  readonly previewStatus = signal<'idle' | 'loading' | 'loaded' | 'empty' | 'error'>('idle');
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionMessage = signal<string | null>(null);
  readonly previewError = signal<string | null>(null);
  readonly isLoading = computed(() => this.status() === 'loading');
  readonly isEmpty = computed(() => this.status() === 'empty');
  readonly isPreviewLoading = computed(() => this.previewStatus() === 'loading');
  readonly isMutating = signal(false);

  load(): void {
    const requestId = ++this.loadRequestId;
    const requestContextKey = this.currentContextKey();

    this.error.set(null);

    if (!requestContextKey) {
      this.presets.set([]);
      this.status.set('error');
      this.error.set('No active hero for loadout presets.');
      return;
    }

    this.status.set('loading');

    this.equipment.getLoadoutPresets().subscribe({
      next: (presets) => {
        if (!this.acceptsLoadResponse(requestId, requestContextKey)) {
          return;
        }

        this.presets.set(presets);
        this.status.set(presets.length ? 'loaded' : 'empty');
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, requestContextKey)) {
          return;
        }

        this.presets.set([]);
        this.status.set('error');
        this.error.set(
          getErrorMessage(error, 'Failed to load loadout presets.'),
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
    this.previewRequestId++;
    this.presets.set([]);
    this.preview.set(null);
    this.previewSlots.set([]);
    this.status.set('idle');
    this.previewStatus.set('idle');
    this.error.set(null);
    this.actionError.set(null);
    this.actionMessage.set(null);
    this.previewError.set(null);
    this.isMutating.set(false);
  }

  renamePreset(input: { presetNumber: number; name: string }): void {
    this.runPresetAction(
      () => this.equipment.renameLoadoutPreset(input),
      (result) => `Preset ${result.presetNumber} renamed.`,
    );
  }

  saveCurrentLoadout(input: { presetNumber: number; name?: string | null }): void {
    this.runPresetAction(
      () => this.equipment.saveCurrentLoadoutPreset(input),
      (result) =>
        `Preset ${result.presetNumber} saved with ${result.savedSlotCount} slots.`,
    );
  }

  clearPreset(input: { presetNumber: number }): void {
    this.runPresetAction(
      () => this.equipment.clearLoadoutPreset(input),
      (result) =>
        `Preset ${result.presetNumber} cleared from ${result.clearedSlotCount} slots.`,
    );
  }

  previewPreset(input: { presetNumber: number }): void {
    const requestId = ++this.previewRequestId;
    const requestContextKey = this.currentContextKey();

    this.preview.set(null);
    this.previewError.set(null);

    if (!requestContextKey) {
      this.previewStatus.set('error');
      this.previewError.set('No active hero for loadout preset preview.');
      return;
    }

    this.previewStatus.set('loading');

    forkJoin({
      preview: this.equipment.previewLoadoutPreset(input),
      slots: this.equipment.getEquipmentSlots(),
    }).subscribe({
      next: ({ preview, slots }) => {
        if (!this.acceptsPreviewResponse(requestId, requestContextKey)) {
          return;
        }

        this.preview.set(preview);
        this.previewSlots.set(slots);
        this.previewStatus.set(preview.slotItems.length ? 'loaded' : 'empty');
      },
      error: (error: unknown) => {
        if (!this.acceptsPreviewResponse(requestId, requestContextKey)) {
          return;
        }

        this.preview.set(null);
        this.previewSlots.set([]);
        this.previewStatus.set('error');
        this.previewError.set(
          getErrorMessage(error, 'Failed to preview loadout preset.'),
        );
      },
    });
  }

  private runPresetAction<T>(
    operation: () => Observable<T>,
    successMessage: (result: T) => string,
  ): void {
    const requestId = ++this.actionRequestId;
    const requestContextKey = this.currentContextKey();

    this.actionError.set(null);
    this.actionMessage.set(null);

    if (!requestContextKey) {
      this.actionError.set('No active hero for loadout preset action.');
      return;
    }

    this.isMutating.set(true);

    let request: Observable<T>;
    try {
      request = operation();
    } catch (error: unknown) {
      if (requestId === this.actionRequestId) {
        this.isMutating.set(false);
        this.actionError.set(presetActionErrorMessage(error));
      }
      return;
    }

    request.subscribe({
      next: (result) => {
        if (!this.acceptsActionResponse(requestId, requestContextKey)) {
          return;
        }

        this.isMutating.set(false);
        this.actionMessage.set(successMessage(result));
        this.preview.set(null);
        this.previewStatus.set('idle');
        this.previewError.set(null);
        this.refresh();
      },
      error: (error: unknown) => {
        if (!this.acceptsActionResponse(requestId, requestContextKey)) {
          return;
        }

        this.isMutating.set(false);
        this.actionError.set(presetActionErrorMessage(error));
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
      this.presets.set([]);
      this.status.set('error');
      this.error.set('Loadout preset context changed.');
      return false;
    }

    return true;
  }

  private acceptsActionResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.actionRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.presets.set([]);
      this.status.set('error');
      this.isMutating.set(false);
      this.actionError.set('Loadout preset context changed.');
      return false;
    }

    return true;
  }

  private acceptsPreviewResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.previewRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.preview.set(null);
      this.previewSlots.set([]);
      this.previewStatus.set('error');
      this.previewError.set('Loadout preset context changed.');
      return false;
    }

    return true;
  }
}

function presetActionErrorMessage(error: unknown): string {
  const message = getErrorMessage(error, 'Loadout preset action failed.');

  return message === 'rename_hero_loadout_preset_name_invalid'
    ? 'Preset name is required.'
    : message;
}

function toContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
