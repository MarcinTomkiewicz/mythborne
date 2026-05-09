import { computed, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CreateGuildInput, GuildCreateResult } from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { PlayerGuild } from './player-guild';

@Injectable({ providedIn: 'root' })
export class GuildCreateState {
  private readonly activeHero = inject(ActiveHero);
  private readonly currentGuild = inject(CurrentGuildState);
  private readonly playerGuild = inject(PlayerGuild);
  private loadRequestId = 0;
  private submitRequestId = 0;

  readonly form = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tag: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', { nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true }),
  });
  readonly creationDrachmaCost = signal<number | null>(null);
  readonly canCreateGuild = signal(false);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly result = signal<GuildCreateResult | null>(null);
  readonly isReady = computed(() =>
    !this.isLoading() && this.creationDrachmaCost() !== null,
  );

  load(): void {
    const requestId = ++this.loadRequestId;
    const contextKey = this.currentContextKey();

    this.creationDrachmaCost.set(null);
    this.canCreateGuild.set(false);
    this.error.set(null);
    this.message.set(null);
    this.result.set(null);

    if (!contextKey) {
      this.isLoading.set(false);
      this.error.set('No active hero for guild creation.');
      return;
    }

    this.isLoading.set(true);

    forkJoin({
      config: this.playerGuild.getGuildConfigSummary(),
      guild: this.playerGuild.getActiveHeroGuild(),
    }).subscribe({
      next: ({ config, guild }) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.creationDrachmaCost.set(config.creationDrachmaCost);
        this.canCreateGuild.set(guild.state.canCreateGuild && !guild.state.guild);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Failed to load guild creation state.'));
        this.isLoading.set(false);
      },
    });
  }

  submit(): void {
    const requestId = ++this.submitRequestId;
    const contextKey = this.currentContextKey();

    this.form.markAllAsTouched();
    this.error.set(null);
    this.message.set(null);
    this.result.set(null);

    if (!contextKey) {
      this.error.set('No active hero for guild creation.');
      return;
    }

    if (!this.canCreateGuild()) {
      this.error.set('Current hero cannot create another guild.');
      return;
    }

    if (this.form.invalid) {
      this.error.set('Guild name and tag are required.');
      return;
    }

    this.isSubmitting.set(true);

    this.playerGuild.createGuildForActiveHero(this.createInput()).subscribe({
      next: (result) => {
        if (!this.acceptsSubmitResponse(requestId, contextKey)) {
          return;
        }

        this.result.set(result);
        this.canCreateGuild.set(false);
        this.message.set(`Guild ${result.name} created.`);
        this.isSubmitting.set(false);
        this.currentGuild.load();
      },
      error: (error: unknown) => {
        if (!this.acceptsSubmitResponse(requestId, contextKey)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Failed to create guild.'));
        this.isSubmitting.set(false);
      },
    });
  }

  clear(): void {
    this.loadRequestId++;
    this.submitRequestId++;
    this.form.reset({
      name: '',
      tag: '',
      description: '',
      reason: '',
    });
    this.creationDrachmaCost.set(null);
    this.canCreateGuild.set(false);
    this.isLoading.set(false);
    this.isSubmitting.set(false);
    this.error.set(null);
    this.message.set(null);
    this.result.set(null);
  }

  private createInput(): CreateGuildInput {
    return {
      name: this.form.controls.name.value,
      tag: this.form.controls.tag.value,
      description: this.form.controls.description.value,
      reason: this.form.controls.reason.value,
    };
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsLoadResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.loadRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.creationDrachmaCost.set(null);
      this.canCreateGuild.set(false);
      this.isLoading.set(false);
      this.error.set(null);
      this.message.set(null);
      this.result.set(null);
      return false;
    }

    return true;
  }

  private acceptsSubmitResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.submitRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.isSubmitting.set(false);
      this.error.set(null);
      this.message.set(null);
      this.result.set(null);
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
