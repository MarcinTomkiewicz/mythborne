import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/ui/toast';
import { CombatOpponentAdmin } from '../../../core/services/combat/combat-opponent-admin';
import { nextSortOrder } from '../../../core/utils/admin-form-helpers';
import { RequestToken } from '../../../core/utils/request-token';
import { toSlug } from '../../../core/utils/slug';
import {
  createCombatOpponentFamilyForm,
  familyFormValue,
} from './combat-opponents-forms';
import { CombatOpponentsPageState } from './combat-opponents-page.state';
import {
  markCombatOpponentReasonInvalid,
  runCombatOpponentWorkflowAction,
} from './combat-opponents-workflow-actions';

@Injectable()
export class CombatOpponentFamilyActionsState {
  private readonly page = inject(CombatOpponentsPageState);
  private readonly admin = inject(CombatOpponentAdmin);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly token = new RequestToken();

  readonly form = createCombatOpponentFamilyForm();
  readonly isSaving = signal(false);
  readonly reasonError = signal<string | null>(null);

  constructor() {
    this.form.controls.label.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((label) => {
        if (!this.form.controls.allowKeyOverride.value) {
          this.form.controls.key.setValue(toSlug(label), { emitEvent: false });
        }
      });
  }

  syncForm(): void {
    this.form.reset(
      familyFormValue(
        this.page.selectedFamily(),
        nextSortOrder(this.page.data()?.families ?? [], (row) => row.sortOrder),
      ),
      { emitEvent: false },
    );
  }

  save(): void {
    if (this.markInvalid()) {
      return;
    }

    this.run(
      () => this.admin.saveFamily(this.form.getRawValue()),
      'Family saved.',
      'Failed to save combat opponent family.',
    );
  }

  deactivate(): void {
    const family = this.page.selectedFamily();

    if (!family || this.markInvalid()) {
      return;
    }

    this.run(
      () => this.admin.deactivateFamily(family.key, this.form.controls.reason.value),
      'Family deactivated.',
      'Failed to deactivate combat opponent family.',
    );
  }

  private markInvalid(): boolean {
    this.form.markAllAsTouched();
    return this.form.invalid ||
      markCombatOpponentReasonInvalid(this.reasonError, this.form.controls.reason);
  }

  private run<T>(
    call: () => ReturnType<CombatOpponentAdmin['saveFamily']>,
    successMessage: string,
    failureMessage: string,
  ): void {
    runCombatOpponentWorkflowAction({
      token: this.token,
      destroyRef: this.destroyRef,
      toast: this.toast,
      isSaving: this.isSaving,
      setError: (message) => this.page.setError(message),
      call,
      successMessage,
      failureMessage,
      onSuccess: () => this.page.loadInitialData(),
    });
  }
}
