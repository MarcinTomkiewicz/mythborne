import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { CombatOpponentDefinitionReadModel } from '../../../core/domain/combat/combat-opponent.model';
import { CombatOpponentAdmin } from '../../../core/services/combat/combat-opponent-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { nextSortOrder } from '../../../core/utils/admin-form-helpers';
import { RequestToken } from '../../../core/utils/request-token';
import { toSlug } from '../../../core/utils/slug';
import {
  createCombatOpponentDefinitionForm,
  definitionFormValue,
} from './combat-opponents-forms';
import { CombatOpponentsPageState } from './combat-opponents-page.state';
import {
  markCombatOpponentReasonInvalid,
  runCombatOpponentWorkflowAction,
} from './combat-opponents-workflow-actions';

@Injectable()
export class CombatOpponentDefinitionActionsState {
  private readonly page = inject(CombatOpponentsPageState);
  private readonly admin = inject(CombatOpponentAdmin);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly token = new RequestToken();

  readonly form = createCombatOpponentDefinitionForm();
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
      definitionFormValue(
        this.page.data(),
        this.page.selectedOpponentView(),
        nextSortOrder(this.page.data()?.opponents ?? [], (row) => row.sortOrder),
      ),
      { emitEvent: false },
    );
  }

  save(): void {
    const currentId = this.form.controls.opponentDefinitionId.value;

    if (this.markInvalid()) {
      return;
    }

    this.run(
      () => this.admin.saveDefinition(this.form.getRawValue()),
      'Opponent definition saved.',
      'Failed to save combat opponent definition.',
      (row) => this.page.selectOpponent(row.id ?? currentId),
    );
  }

  deactivate(): void {
    const opponentId = this.form.controls.opponentDefinitionId.value;

    if (!opponentId || this.markInvalid()) {
      return;
    }

    this.run(
      () => this.admin.deactivateDefinition(opponentId, this.form.controls.reason.value),
      'Opponent definition deactivated.',
      'Failed to deactivate combat opponent definition.',
    );
  }

  private markInvalid(): boolean {
    this.form.markAllAsTouched();
    return this.form.invalid ||
      markCombatOpponentReasonInvalid(this.reasonError, this.form.controls.reason);
  }

  private run(
    call: () => Observable<CombatOpponentDefinitionReadModel>,
    successMessage: string,
    failureMessage: string,
    onSuccess?: (value: CombatOpponentDefinitionReadModel) => void,
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
      onSuccess: (value) => {
        onSuccess?.(value);
        this.page.loadInitialData();
      },
    });
  }
}
