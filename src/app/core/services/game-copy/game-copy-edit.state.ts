import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  GameCopyEditTarget,
  GameCopyLocale,
  GameCopyTextEntry,
  GameCopyTextUpdateResult,
} from '../../domain/game-copy/game-copy-edit.model';
import { getErrorMessage } from '../../utils/error-message';
import {
  gameCopyTextEntryFromUpdateResult,
  missingGameCopyEntryState,
} from '../../utils/game-copy-edit.mapper';
import { RequestToken } from '../../utils/request-token';
import { GameCopy } from './game-copy';
import { GameCopyEditAdmin } from './game-copy-edit-admin';

@Injectable()
export class GameCopyEditState {
  private readonly admin = inject(GameCopyEditAdmin);
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameCopy = inject(GameCopy);
  private readonly loadToken = new RequestToken();
  private readonly saveToken = new RequestToken();
  private readonly formRevision = signal(0);

  readonly form = new FormGroup({
    value: new FormControl('', { nonNullable: true }),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly visible = signal(false);
  readonly target = signal<GameCopyEditTarget | null>(null);
  readonly locales = signal<GameCopyLocale[]>([]);
  readonly entriesByLocale = signal<Record<string, GameCopyTextEntry>>({});
  readonly selectedLocale = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly savedResult = signal<GameCopyTextUpdateResult | null>(null);

  readonly activeEntry = computed(() => {
    const locale = this.selectedLocale();

    return locale ? this.entriesByLocale()[locale] ?? null : null;
  });
  readonly formValue = computed(() => {
    this.formRevision();

    return this.form.getRawValue();
  });
  readonly dirty = computed(() => {
    const entry = this.activeEntry();

    if (!entry?.exists || !entry.isEditable) {
      return false;
    }

    return this.formValue().value !== (entry.value ?? '');
  });
  readonly canSave = computed(
    () =>
      this.isActiveEntryEditable()
      && this.dirty()
      && this.formValue().reason.trim().length > 0
      && this.form.valid
      && !this.loading()
      && !this.saving(),
  );

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.error.set(null);
        this.savedResult.set(null);
        this.bumpFormRevision();
      });

    this.form.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.bumpFormRevision());
  }

  open(target: GameCopyEditTarget): void {
    if (this.saving() || (this.visible() && this.dirty())) {
      return;
    }

    this.visible.set(true);
    this.target.set(target);
    this.loadTarget(target);
  }

  close(): void {
    if (this.saving()) {
      return;
    }

    this.loadToken.next();
    this.visible.set(false);
    this.target.set(null);
    this.locales.set([]);
    this.entriesByLocale.set({});
    this.selectedLocale.set(null);
    this.loading.set(false);
    this.error.set(null);
    this.savedResult.set(null);
    this.form.reset({ value: '', reason: '' }, { emitEvent: false });
    this.form.markAsPristine();
    this.bumpFormRevision();
  }

  switchLocale(locale: string): void {
    if (this.dirty()) {
      return;
    }

    this.selectedLocale.set(locale);
    this.error.set(null);
    this.savedResult.set(null);

    const entries = this.entriesByLocale();
    const entry = entries[locale] ?? missingGameCopyEntryState(locale);

    if (!entries[locale]) {
      this.entriesByLocale.set({ ...entries, [locale]: entry });
    }

    this.patchForm(entry, '');
  }

  saveCurrentLocale(): void {
    const target = this.target();
    const entry = this.activeEntry();
    const locale = this.selectedLocale();

    if (!target || !entry || !locale || this.loading() || this.saving()) {
      return;
    }

    if (!entry.exists || !entry.isEditable) {
      return;
    }

    this.form.controls.reason.updateValueAndValidity();

    if (this.form.invalid || !this.dirty()) {
      this.form.markAllAsTouched();
      this.bumpFormRevision();
      return;
    }

    const token = this.saveToken.next();
    const value = this.form.controls.value.value;
    const reason = this.form.controls.reason.value.trim();

    this.saving.set(true);
    this.error.set(null);
    this.savedResult.set(null);

    this.admin
      .updateEntry(target.gameCopyKind, target.copyPath, locale, value, reason)
      .pipe(
        finalize(() => {
          if (this.saveToken.isCurrent(token)) {
            this.saving.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!this.saveToken.isCurrent(token)) {
            return;
          }

          const updatedEntry = gameCopyTextEntryFromUpdateResult(result);

          this.entriesByLocale.set({
            ...this.entriesByLocale(),
            [locale]: updatedEntry,
          });
          this.savedResult.set(result);
          this.patchForm(updatedEntry, '');
          this.gameCopy.refreshCopy(target.gameCopyKind, locale);
        },
        error: (error: unknown) => {
          if (!this.saveToken.isCurrent(token)) {
            return;
          }

          this.error.set(
            getErrorMessage(error, 'update_game_copy_text_entry:error'),
          );
        },
      });
  }

  private loadTarget(target: GameCopyEditTarget): void {
    const token = this.loadToken.next();

    this.locales.set([]);
    this.entriesByLocale.set({});
    this.selectedLocale.set(target.locale);
    this.loading.set(true);
    this.saving.set(false);
    this.error.set(null);
    this.savedResult.set(null);
    this.form.reset(
      { value: '', reason: '' },
      { emitEvent: false },
    );
    this.bumpFormRevision();

    this.admin
      .getEntryLocales(target.gameCopyKind, target.copyPath)
      .pipe(
        finalize(() => {
          if (this.loadToken.isCurrent(token)) {
            this.loading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (entryLocales) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          const activeLocales = entryLocales.availableLocales.filter(
            (locale) => locale.isActive,
          );
          const entries = Object.fromEntries(
            entryLocales.entries.map((entry) => [entry.locale, entry]),
          );

          for (const locale of activeLocales) {
            entries[locale.locale] ??= missingGameCopyEntryState(locale.locale);
          }

          entries[target.locale] ??= missingGameCopyEntryState(target.locale);

          this.locales.set(activeLocales);
          this.entriesByLocale.set(entries);
          this.selectedLocale.set(target.locale);
          this.error.set(null);
          this.patchForm(entries[target.locale], '');
        },
        error: (error: unknown) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.error.set(
            getErrorMessage(error, 'get_game_copy_text_entry_locales:error'),
          );
        },
      });
  }

  private patchForm(entry: GameCopyTextEntry, reason: string): void {
    const valueControl = this.form.controls.value;

    this.form.setValue(
      {
        value: entry.value ?? '',
        reason,
      },
      { emitEvent: false },
    );

    if (entry.exists && entry.isEditable) {
      valueControl.enable({ emitEvent: false });
    } else {
      valueControl.disable({ emitEvent: false });
    }

    this.form.markAsPristine();
    this.bumpFormRevision();
  }

  private isActiveEntryEditable(): boolean {
    const entry = this.activeEntry();

    return Boolean(entry?.exists && entry.isEditable);
  }

  private bumpFormRevision(): void {
    this.formRevision.update((revision) => revision + 1);
  }
}
