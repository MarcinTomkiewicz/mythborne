import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import {
  REWARD_AMOUNT_MODE,
  REWARD_ENTRY_KIND,
} from '../../../core/constants/reward-runtime-keys.const';
import { RewardProfileEntryReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import { RewardProfileAdmin } from '../../../core/services/exploration/reward-profile-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { trimText, trimToNull } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import {
  markReasonInvalid,
  nextSortOrder,
  parseMetadataJson,
} from '../../../core/utils/admin-form-helpers';
import { entryFormValue } from './reward-profiles-forms';
import { RewardProfilesPageState } from './reward-profiles-page.state';
import { runRewardProfileWorkflowAction } from './reward-profile-workflow-actions';

@Injectable()
export class RewardProfileEntryActionsState {
  private readonly admin = inject(RewardProfileAdmin);
  private readonly destroyRef = inject(DestroyRef);
  private readonly page = inject(RewardProfilesPageState);
  private readonly toast = inject(ToastService);
  private readonly token = new RequestToken();

  readonly isSaving = signal(false);
  readonly reasonError = signal<string | null>(null);

  startNewEntry(): void {
    this.page.selectedEntryId.set(null);
    this.page.entryForm.patchValue(entryFormValue(null), { emitEvent: false });
    this.page.entryForm.controls.sortOrder.setValue(
      nextSortOrder(this.page.entriesForSelectedProfile(), (row) => row.sortOrder),
    );
  }

  saveEntry(): void {
    const profileId = this.page.selectedProfileId();

    if (!profileId || this.markInvalidEntry()) {
      return;
    }

    const metadataJson = parseMetadataJson(
      this.page.entryForm.controls.metadataJsonText.value,
      (message) => this.page.error.set(message),
    );

    if (metadataJson === null) {
      return;
    }

    const value = this.page.entryForm.getRawValue();
    const isNumericEntry = this.page.isNumericEntryKind(value.entryKind);
    const isItemGeneration = value.entryKind === REWARD_ENTRY_KIND.itemGeneration;
    const isExplorationEffect = value.entryKind === REWARD_ENTRY_KIND.explorationEffect;

    this.run({
      guard: () =>
        this.page.selectedProfileId() === profileId &&
        this.page.selectedEntryId() === value.entryId &&
        this.page.entryForm.controls.entryId.value === value.entryId,
      call: () => this.admin.upsertEntry({
        entryId: value.entryId,
        rewardProfileId: profileId,
        entryKind: value.entryKind,
        label: value.label,
        description: value.description,
        helperText: trimToNull(value.helperText),
        adminDescription: trimToNull(value.adminDescription),
        amountMode: value.amountMode,
        minAmount: isNumericEntry ? value.minAmount : null,
        maxAmount: isNumericEntry && value.amountMode === REWARD_AMOUNT_MODE.range
          ? value.maxAmount
          : isNumericEntry
            ? value.minAmount
            : null,
        resourceType: value.entryKind === REWARD_ENTRY_KIND.resource ? value.resourceType : null,
        formulaId: isNumericEntry && value.amountMode === REWARD_AMOUNT_MODE.formula
          ? value.formulaId
          : null,
        chancePercent: value.chancePercent,
        minItemCount: isItemGeneration ? value.minItemCount : null,
        maxItemCount: isItemGeneration ? value.maxItemCount : null,
        maxQualityKey: isItemGeneration ? value.maxQualityKey : null,
        bucketProfileId: isItemGeneration ? value.bucketProfileId : null,
        effectDefinitionId: isExplorationEffect
          ? value.effectDefinitionId
          : null,
        sortOrder: value.sortOrder,
        isActive: value.isActive,
        metadataJson,
        reason: value.reason,
      }),
      successMessage: 'Reward profile entry saved.',
      failureMessage: 'Failed to save reward profile entry.',
      onSuccess: (entry) => {
        this.clearValidationState();
        this.page.selectEntry(entry.id);
      },
    });
  }

  deactivateEntry(): void {
    const entryId = this.page.selectedEntryId();

    if (!entryId || markReasonInvalid(this.reasonError, this.page.entryForm.controls.reason)) {
      return;
    }

    this.run({
      guard: () =>
        this.page.selectedEntryId() === entryId &&
        this.page.entryForm.controls.entryId.value === entryId,
      call: () => this.admin.deactivateEntry(entryId, this.page.entryForm.controls.reason.value),
      successMessage: 'Reward profile entry deactivated.',
      failureMessage: 'Failed to deactivate reward profile entry.',
      onSuccess: () => this.clearValidationState(),
    });
  }

  private markInvalidEntry(): boolean {
    const form = this.page.entryForm;
    let invalid = markReasonInvalid(this.reasonError, form.controls.reason);

    form.controls.label.markAsTouched();
    form.controls.description.markAsTouched();

    if (form.controls.label.invalid || form.controls.description.invalid) {
      invalid = true;
    }

    if (!this.page.isNumericEntryKind(form.controls.entryKind.value)) {
      form.controls.amountMode.setValue(REWARD_AMOUNT_MODE.none, { emitEvent: false });
    }

    if (form.controls.entryKind.value === REWARD_ENTRY_KIND.resource) {
      form.controls.resourceType.markAsTouched();
      invalid = invalid || !trimText(form.controls.resourceType.value);
    }

    if (
      this.page.isNumericEntryKind(form.controls.entryKind.value) &&
      form.controls.amountMode.value === REWARD_AMOUNT_MODE.formula
    ) {
      form.controls.formulaId.markAsTouched();
      invalid = invalid || !form.controls.formulaId.value;
    }

    if (form.controls.entryKind.value === REWARD_ENTRY_KIND.itemGeneration) {
      form.controls.bucketProfileId.markAsTouched();
      form.controls.maxQualityKey.markAsTouched();
      invalid = invalid || !form.controls.bucketProfileId.value || !form.controls.maxQualityKey.value;
    }

    if (form.controls.entryKind.value === REWARD_ENTRY_KIND.explorationEffect) {
      form.controls.effectDefinitionId.markAsTouched();
      invalid = invalid || !form.controls.effectDefinitionId.value;
    }

    return invalid;
  }

  private run(action: {
    guard: () => boolean;
    call: () => ReturnType<RewardProfileAdmin['upsertEntry']>;
    successMessage: string;
    failureMessage: string;
    onSuccess?: (value: RewardProfileEntryReadModel) => void;
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
    this.page.entryForm.controls.reason.reset('', { emitEvent: false });
    this.page.entryForm.controls.reason.markAsPristine();
    this.page.entryForm.controls.reason.markAsUntouched();
  }
}
