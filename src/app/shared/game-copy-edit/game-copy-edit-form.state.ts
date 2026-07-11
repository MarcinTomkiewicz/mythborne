import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { GameCopyTextEntry } from '../../core/domain/game-copy/game-copy-edit.model';

@Injectable()
export class GameCopyEditFormState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formRevision = signal(0);
  private locked = false;

  readonly formGroup = new FormGroup({
    value: new FormControl('', { nonNullable: true }),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  readonly activeEntry = signal<GameCopyTextEntry | null>(null);
  readonly dirtyGuardMessage = signal<string | null>(null);
  readonly userChanges = this.formGroup.valueChanges;
  readonly formValue = computed(() => {
    this.formRevision();

    return this.formGroup.getRawValue();
  });
  readonly dirty = computed(() => {
    const entry = this.activeEntry();

    return Boolean(
      entry?.exists
      && entry.isEditable
      && this.formValue().value !== (entry.value ?? ''),
    );
  });
  readonly canSave = computed(() => Boolean(
    this.dirty()
    && this.formValue().reason.trim().length > 0
    && this.formGroup.valid,
  ));

  constructor() {
    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.dirtyGuardMessage.set(null);
        this.bumpRevision();
      });

    this.formGroup.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.bumpRevision());
  }

  clear(): void {
    this.applyEntry(null, '');
  }

  patchEntry(entry: GameCopyTextEntry, reason: string): void {
    this.applyEntry(entry, reason);
  }

  setLocked(locked: boolean): void {
    this.locked = locked;
    this.applyControlAvailability();
    this.bumpRevision();
  }

  validateForSave(): boolean {
    this.formGroup.controls.reason.updateValueAndValidity();

    if (this.formGroup.invalid || !this.dirty()) {
      this.formGroup.markAllAsTouched();
      this.bumpRevision();
      return false;
    }

    return true;
  }

  showDirtyGuard(message: string | undefined): void {
    if (message) {
      this.dirtyGuardMessage.set(message);
    }
  }

  private applyEntry(entry: GameCopyTextEntry | null, reason: string): void {
    this.activeEntry.set(entry);
    this.dirtyGuardMessage.set(null);
    this.formGroup.setValue(
      {
        value: entry?.value ?? '',
        reason,
      },
      { emitEvent: false },
    );

    this.applyControlAvailability();
    this.formGroup.markAsPristine();
    this.bumpRevision();
  }

  private bumpRevision(): void {
    this.formRevision.update((revision) => revision + 1);
  }

  private applyControlAvailability(): void {
    const entry = this.activeEntry();

    if (this.locked) {
      this.formGroup.disable({ emitEvent: false });
      return;
    }

    this.formGroup.controls.reason.enable({ emitEvent: false });

    if (entry?.exists && entry.isEditable) {
      this.formGroup.controls.value.enable({ emitEvent: false });
    } else {
      this.formGroup.controls.value.disable({ emitEvent: false });
    }
  }
}
