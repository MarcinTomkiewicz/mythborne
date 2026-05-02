import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { RewardOutcomeKindReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import { RewardProfileAdmin } from '../../../core/services/exploration/reward-profile-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { trimToNull } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import {
  markReasonInvalid,
  nextSortOrder,
  parseMetadataJson,
} from '../../../core/utils/admin-form-helpers';
import { outcomeKindFormValue } from './reward-profiles-forms';
import { RewardProfilesPageState } from './reward-profiles-page.state';
import { runRewardProfileWorkflowAction } from './reward-profile-workflow-actions';

@Injectable()
export class RewardProfileOutcomeActionsState {
  private readonly admin = inject(RewardProfileAdmin);
  private readonly destroyRef = inject(DestroyRef);
  private readonly page = inject(RewardProfilesPageState);
  private readonly toast = inject(ToastService);
  private readonly token = new RequestToken();

  readonly isSaving = signal(false);
  readonly reasonError = signal<string | null>(null);

  startNewOutcome(): void {
    this.page.selectedOutcome.set(null);
    this.page.outcomeForm.patchValue(outcomeKindFormValue(null), { emitEvent: false });
    this.page.outcomeForm.controls.sortOrder.setValue(
      nextSortOrder(this.page.data()?.outcomeKinds ?? [], (row) => row.sortOrder),
    );
  }

  saveOutcome(): void {
    if (this.page.markInvalidProfile(this.reasonError, this.page.outcomeForm)) {
      return;
    }

    const metadataJson = parseMetadataJson(
      this.page.outcomeForm.controls.metadataJsonText.value,
      (message) => this.page.error.set(message),
    );

    if (metadataJson === null) {
      return;
    }

    const value = this.page.outcomeForm.getRawValue();
    const selected = this.page.selectedOutcome();

    this.run({
      guard: () =>
        this.page.selectedOutcome()?.sourceKind === selected?.sourceKind &&
        this.page.selectedOutcome()?.key === selected?.key &&
        this.page.outcomeForm.controls.sourceKind.value === value.sourceKind &&
        this.page.outcomeForm.controls.key.value === value.key,
      call: () => this.admin.upsertOutcomeKind({
        sourceKind: value.sourceKind,
        key: value.key,
        label: value.label,
        description: value.description,
        helperText: trimToNull(value.helperText),
        adminDescription: trimToNull(value.adminDescription),
        sortOrder: value.sortOrder,
        isActive: value.isActive,
        metadataJson,
        reason: value.reason,
      }),
      successMessage: 'Reward outcome kind saved.',
      failureMessage: 'Failed to save reward outcome kind.',
      onSuccess: (outcome) => {
        this.clearValidationState();
        this.page.selectOutcome(outcome);
      },
    });
  }

  deactivateOutcome(): void {
    const selected = this.page.selectedOutcome();

    if (!selected || markReasonInvalid(this.reasonError, this.page.outcomeForm.controls.reason)) {
      return;
    }

    this.run({
      guard: () =>
        this.page.selectedOutcome()?.sourceKind === selected.sourceKind &&
        this.page.selectedOutcome()?.key === selected.key &&
        this.page.outcomeForm.controls.sourceKind.value === selected.sourceKind &&
        this.page.outcomeForm.controls.key.value === selected.key,
      call: () => this.admin.deactivateOutcomeKind(
        selected.sourceKind,
        selected.key,
        this.page.outcomeForm.controls.reason.value,
      ),
      successMessage: 'Reward outcome kind deactivated.',
      failureMessage: 'Failed to deactivate reward outcome kind.',
      onSuccess: () => this.clearValidationState(),
    });
  }

  private run(action: {
    guard: () => boolean;
    call: () => ReturnType<RewardProfileAdmin['upsertOutcomeKind']>;
    successMessage: string;
    failureMessage: string;
    onSuccess?: (value: RewardOutcomeKindReadModel) => void;
  }): void {
    runRewardProfileWorkflowAction({
      token: this.token,
      destroyRef: this.destroyRef,
      page: this.page,
      toast: this.toast,
      isSaving: this.isSaving,
      ...action,
    });
  }

  private clearValidationState(): void {
    this.reasonError.set(null);
    this.page.outcomeForm.controls.reason.reset('', { emitEvent: false });
    this.page.outcomeForm.controls.reason.markAsPristine();
    this.page.outcomeForm.controls.reason.markAsUntouched();
  }
}
