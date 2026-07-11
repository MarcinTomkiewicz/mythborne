import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { GAME_COPY_DEFAULT_LOCALE } from '../../core/constants/game-copy.const';
import type {
  GameCopyEditUi,
  GameCopyEditTarget,
  GameCopyLocale,
  GameCopyTextEntry,
  GameCopyTextUpdateResult,
} from '../../core/domain/game-copy/game-copy-edit.model';
import { getErrorMessage } from '../../core/utils/error-message';
import {
  gameCopyTextEntryFromUpdateResult,
  mapGameCopyEditEntrySelection,
} from '../../core/domain/game-copy/game-copy-edit.mapper';
import { RequestToken } from '../../core/utils/request-token';
import { GameCopy } from '../../core/services/game-copy/game-copy';
import { GameCopySignalLoader } from '../../core/services/game-copy/game-copy-signal-loader';
import { GameCopyEditAdmin } from '../../core/services/game-copy-edit/game-copy-edit-admin';
import { ToastService } from '../../core/services/ui/toast';
import type { GameCopyRegistryKind } from '../../core/types/game-copy-registry.types';
import { GameCopyEditFormState } from './game-copy-edit-form.state';

@Injectable()
export class GameCopyEditState {
  private readonly admin = inject(GameCopyEditAdmin);
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameCopy = inject(GameCopy);
  private readonly loader = inject(GameCopySignalLoader);
  private readonly toast = inject(ToastService);
  private readonly copyToken = new RequestToken();
  private readonly loadToken = new RequestToken();
  private readonly saveToken = new RequestToken();
  readonly formState = inject(GameCopyEditFormState);

  readonly visible = signal(false);
  readonly target = signal<GameCopyEditTarget | null>(null);
  readonly locales = signal<GameCopyLocale[]>([]);
  readonly entriesByLocale = signal<Record<string, GameCopyTextEntry>>({});
  readonly selectedLocale = signal<string | null>(null);
  readonly loading = signal(false);
  readonly copyLoading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorKind = signal<'load' | 'save' | null>(null);
  readonly copyError = signal<string | null>(null);
  readonly copy = signal<GameCopyEditUi | null>(null);
  readonly savedResult = signal<GameCopyTextUpdateResult | null>(null);
  readonly dialogTitle = computed(() =>
    this.copy()?.dialog.title ?? 'Game Copy editor',
  );
  readonly closeAriaLabel = computed(
    () => this.copy()?.actions.close.ariaLabel ?? 'Close',
  );

  readonly canSave = computed(() => Boolean(
    this.copy()
    && !this.loading()
    && !this.saving()
    && this.formState.canSave(),
  ));

  constructor() {
    this.formState.userChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearFeedback());
  }

  open(target: GameCopyEditTarget): void {
    if (this.saving() || (this.visible() && this.formState.dirty())) {
      this.formState.showDirtyGuard(this.copy()?.messages.dirtyGuard);
      return;
    }

    this.ensureCopyLoaded();
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
    this.clearFeedback();
    this.formState.clear();
  }

  switchLocale(locale: string): void {
    if (this.loading() || this.saving()) {
      return;
    }

    if (this.formState.dirty()) {
      this.formState.showDirtyGuard(this.copy()?.messages.dirtyGuard);
      return;
    }

    const entry = this.entriesByLocale()[locale];

    if (!entry) {
      return;
    }

    this.selectedLocale.set(locale);
    this.clearFeedback();

    this.formState.patchEntry(entry, '');
  }

  saveCurrentLocale(): void {
    const target = this.target();
    const entry = this.formState.activeEntry();
    const locale = this.selectedLocale();

    if (
      !target
      || !entry
      || !locale
      || !this.copy()
      || this.loading()
      || this.saving()
    ) {
      return;
    }

    if (!this.formState.validateForSave()) {
      return;
    }

    const token = this.saveToken.next();
    const value = this.formState.formGroup.controls.value.value;
    const reason = this.formState.formGroup.controls.reason.value.trim();

    this.saving.set(true);
    this.formState.setLocked(true);
    this.clearFeedback();

    this.admin
      .updateEntry(target.gameCopyKind, target.copyPath, locale, value, reason)
      .pipe(
        finalize(() => {
          if (this.saveToken.isCurrent(token)) {
            this.saving.set(false);
            this.formState.setLocked(false);
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
          this.formState.patchEntry(updatedEntry, '');
          this.gameCopy.refreshCopy(target.gameCopyKind, locale);
        },
        error: (error: unknown) => {
          if (!this.saveToken.isCurrent(token)) {
            return;
          }

          this.error.set(
            getErrorMessage(error, 'update_game_copy_text_entry:error'),
          );
          this.errorKind.set('save');
        },
      });
  }

  notifyRefreshFailure(kind: GameCopyRegistryKind, locale: string): void {
    const copy = this.copy();

    if (copy) {
      this.toast.show(
        'error',
        copy.messages.loadError,
        `${kind}:${locale}`,
      );
    }
  }

  private loadTarget(target: GameCopyEditTarget): void {
    const token = this.loadToken.next();

    this.locales.set([]);
    this.entriesByLocale.set({});
    this.selectedLocale.set(target.locale);
    this.loading.set(true);
    this.saving.set(false);
    this.clearFeedback();
    this.formState.clear();

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

          const selection = mapGameCopyEditEntrySelection(
            entryLocales,
            target.locale,
          );

          this.locales.set(selection.locales);
          this.entriesByLocale.set(selection.entriesByLocale);
          this.selectedLocale.set(target.locale);
          this.clearFeedback();
          this.formState.patchEntry(selection.selectedEntry, '');
        },
        error: (error: unknown) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.error.set(
            getErrorMessage(error, 'get_game_copy_text_entry_locales:error'),
          );
          this.errorKind.set('load');
        },
      });
  }

  private ensureCopyLoaded(): void {
    if (this.copy() || this.copyLoading()) {
      return;
    }

    this.loader.load({
      kind: 'admin.gameCopy.edit',
      args: { locale: GAME_COPY_DEFAULT_LOCALE },
      requestToken: this.copyToken,
      destroyRef: this.destroyRef,
      loading: this.copyLoading,
      target: this.copy,
      preserveCurrent: false,
      onStart: () => this.copyError.set(null),
      onSuccess: () => this.copyError.set(null),
      onError: (error) => {
        this.copyError.set(
          getErrorMessage(error, 'admin_game_copy_edit:load_error'),
        );
      },
    });
  }

  private clearFeedback(): void {
    this.error.set(null);
    this.errorKind.set(null);
    this.savedResult.set(null);
  }
}
