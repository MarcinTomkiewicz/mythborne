import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { RewardProfileReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import { RewardProfileAdmin } from '../../../core/services/exploration/reward-profile-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { trimToNull } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import {
  markReasonInvalid,
  nextSortOrder,
  parseMetadataJson,
} from '../../../core/utils/admin-form-helpers';
import { profileFormValue } from './reward-profiles-forms';
import { RewardProfilesPageState } from './reward-profiles-page.state';
import { runRewardProfileWorkflowAction } from './reward-profile-workflow-actions';

@Injectable()
export class RewardProfileProfileActionsState {
  private readonly admin = inject(RewardProfileAdmin);
  private readonly destroyRef = inject(DestroyRef);
  private readonly page = inject(RewardProfilesPageState);
  private readonly toast = inject(ToastService);
  private readonly token = new RequestToken();

  readonly isSaving = signal(false);
  readonly reasonError = signal<string | null>(null);

  startNewProfile(): void {
    this.page.selectProfile(null);
    this.page.profileForm.patchValue(profileFormValue(null), { emitEvent: false });
    this.page.profileForm.controls.sortOrder.setValue(
      nextSortOrder(this.page.data()?.profiles ?? [], (row) => row.sortOrder),
    );
  }

  saveProfile(): void {
    if (this.page.markInvalidProfile(this.reasonError, this.page.profileForm)) {
      return;
    }

    const metadataJson = parseMetadataJson(
      this.page.profileForm.controls.metadataJsonText.value,
      (message) => this.page.error.set(message),
    );

    if (metadataJson === null) {
      return;
    }

    const value = this.page.profileForm.getRawValue();

    this.run({
      guard: () =>
        this.page.selectedProfileId() === value.rewardProfileId &&
        this.page.profileForm.controls.rewardProfileId.value === value.rewardProfileId,
      call: () => this.admin.upsertProfile({
        rewardProfileId: value.rewardProfileId,
        key: value.key,
        label: value.label,
        category: value.category,
        description: value.description,
        helperText: trimToNull(value.helperText),
        adminDescription: trimToNull(value.adminDescription),
        sortOrder: value.sortOrder,
        isActive: value.isActive,
        metadataJson,
        reason: value.reason,
      }),
      successMessage: 'Reward profile saved.',
      failureMessage: 'Failed to save reward profile.',
      onSuccess: (profile) => {
        this.clearValidationState();
        this.page.selectProfile(profile.id);
      },
    });
  }

  deactivateProfile(): void {
    const profileId = this.page.selectedProfileId();

    if (
      !profileId ||
      markReasonInvalid(this.reasonError, this.page.profileForm.controls.reason)
    ) {
      return;
    }

    this.run({
      guard: () =>
        this.page.selectedProfileId() === profileId &&
        this.page.profileForm.controls.rewardProfileId.value === profileId,
      call: () => this.admin.deactivateProfile(
        profileId,
        this.page.profileForm.controls.reason.value,
      ),
      successMessage: 'Reward profile deactivated.',
      failureMessage: 'Failed to deactivate reward profile.',
      onSuccess: () => this.clearValidationState(),
    });
  }

  private run(action: {
    guard: () => boolean;
    call: () => ReturnType<RewardProfileAdmin['upsertProfile']>;
    successMessage: string;
    failureMessage: string;
    onSuccess?: (value: RewardProfileReadModel) => void;
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
    this.page.profileForm.controls.reason.reset('', { emitEvent: false });
    this.page.profileForm.controls.reason.markAsPristine();
    this.page.profileForm.controls.reason.markAsUntouched();
  }
}
