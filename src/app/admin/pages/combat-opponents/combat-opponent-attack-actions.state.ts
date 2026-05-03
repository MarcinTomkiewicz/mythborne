import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CombatOpponentAttackSourceReadModel } from '../../../core/domain/combat/combat-opponent.model';
import { CombatOpponentAdmin } from '../../../core/services/combat/combat-opponent-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { nextSortOrder } from '../../../core/utils/admin-form-helpers';
import { RequestToken } from '../../../core/utils/request-token';
import { toSlug } from '../../../core/utils/slug';
import {
  attackFormValue,
  createCombatOpponentAttackForm,
} from './combat-opponents-forms';
import { CombatOpponentsPageState } from './combat-opponents-page.state';
import {
  markCombatOpponentReasonInvalid,
  runCombatOpponentWorkflowAction,
} from './combat-opponents-workflow-actions';

@Injectable()
export class CombatOpponentAttackActionsState {
  private readonly page = inject(CombatOpponentsPageState);
  private readonly admin = inject(CombatOpponentAdmin);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly token = new RequestToken();

  readonly form = createCombatOpponentAttackForm();
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
      attackFormValue(
        this.page.selectedAttackSource(),
        nextSortOrder(this.page.selectedOpponentView()?.naturalAttacks ?? [], (row) => row.attack.sortOrder),
      ),
      { emitEvent: false },
    );
  }

  save(): void {
    const opponentDefinitionId = this.page.selectedOpponentId();

    if (!opponentDefinitionId || this.markInvalid()) {
      return;
    }

    runCombatOpponentWorkflowAction({
      token: this.token,
      destroyRef: this.destroyRef,
      toast: this.toast,
      isSaving: this.isSaving,
      setError: (message) => this.page.setError(message),
      call: () => this.admin.saveAttackSource({
        ...this.form.getRawValue(),
        opponentDefinitionId,
      }),
      successMessage: 'Natural attack saved.',
      failureMessage: 'Failed to save combat opponent natural attack.',
      onSuccess: () => this.page.loadInitialData(),
    });
  }

  deactivate(): void {
    const attackSourceId = this.form.controls.attackSourceId.value;

    if (!attackSourceId || this.markInvalid()) {
      return;
    }

    runCombatOpponentWorkflowAction<CombatOpponentAttackSourceReadModel>({
      token: this.token,
      destroyRef: this.destroyRef,
      toast: this.toast,
      isSaving: this.isSaving,
      setError: (message) => this.page.setError(message),
      call: () => this.admin.deactivateAttackSource(
        attackSourceId,
        this.form.controls.reason.value,
      ),
      successMessage: 'Natural attack deactivated.',
      failureMessage: 'Failed to deactivate combat opponent natural attack.',
      onSuccess: () => this.page.loadInitialData(),
    });
  }

  private markInvalid(): boolean {
    this.form.markAllAsTouched();
    return this.form.invalid ||
      markCombatOpponentReasonInvalid(this.reasonError, this.form.controls.reason);
  }
}
