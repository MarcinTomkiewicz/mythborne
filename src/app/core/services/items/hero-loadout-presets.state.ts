import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { ActiveHero } from '../hero/active-hero';
import { HeroEquipment } from './hero-equipment';

@Injectable()
export class HeroLoadoutPresetsState {
  private readonly activeHero = inject(ActiveHero);
  private readonly equipment = inject(HeroEquipment);
  private actionRequestId = 0;

  readonly actionError = signal<unknown | null>(null);
  readonly isMutating = signal(false);

  clear(): void {
    this.actionRequestId++;
    this.actionError.set(null);
    this.isMutating.set(false);
  }

  renamePreset(input: { presetNumber: number; name: string }, afterResponse?: () => void): void {
    this.runPresetAction(
      () => this.equipment.renameLoadoutPreset(input),
      afterResponse,
    );
  }

  saveCurrentLoadout(
    input: { presetNumber: number; name?: string | null },
    afterResponse?: () => void,
  ): void {
    this.runPresetAction(
      () => this.equipment.saveCurrentLoadoutPreset(input),
      afterResponse,
    );
  }

  clearPreset(input: { presetNumber: number }, afterResponse?: () => void): void {
    this.runPresetAction(
      () => this.equipment.clearLoadoutPreset(input),
      afterResponse,
    );
  }

  private runPresetAction<T>(
    operation: () => Observable<T>,
    afterResponse?: () => void,
  ): void {
    const requestId = ++this.actionRequestId;
    const requestContextKey = this.currentContextKey();

    this.actionError.set(null);

    if (!requestContextKey) {
      return;
    }

    this.isMutating.set(true);

    let request: Observable<T>;
    try {
      request = operation();
    } catch (error: unknown) {
      if (requestId === this.actionRequestId) {
        this.isMutating.set(false);
        this.actionError.set(error);
      }
      return;
    }

    request.subscribe({
      next: () => {
        if (!this.acceptsActionResponse(requestId, requestContextKey)) {
          return;
        }

        this.isMutating.set(false);
        afterResponse?.();
      },
      error: (error: unknown) => {
        if (!this.acceptsActionResponse(requestId, requestContextKey)) {
          return;
        }

        this.isMutating.set(false);
        this.actionError.set(error);
      },
    });
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsActionResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.actionRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.isMutating.set(false);
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
