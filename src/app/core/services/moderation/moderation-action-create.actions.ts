import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ModerationActionType } from '../../domain/moderation/moderation-action.model';
import { ToastService } from '../ui/toast';
import { ModerationActions } from './moderation-actions';
import { ModerationTargetSearchState } from './moderation-target-search.state';

@Injectable()
export class ModerationActionCreateActions {
  private readonly moderationActions = inject(ModerationActions);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly createForm = this.formBuilder.nonNullable.group({
    actionTypeKey: ['', Validators.required],
    scopeKey: '',
    targetUserId: ['', Validators.required],
    targetHeroId: '',
    reason: ['', Validators.required],
    operatorNotes: '',
    playerVisibleNote: '',
    sourceEntityType: '',
    sourceEntityId: '',
    sourceSnapshotId: '',
    expiresAt: '',
  });
  readonly selectedActionTypeKey = toSignal(
    this.createForm.controls.actionTypeKey.valueChanges,
    { initialValue: this.createForm.controls.actionTypeKey.value },
  );
  readonly targets = new ModerationTargetSearchState(
    this.moderationActions,
    this.destroyRef,
    {
      setUserTargetId: (userId) => {
        this.createForm.controls.targetUserId.setValue(userId);
        this.createForm.controls.targetUserId.markAsDirty();
      },
      clearUserTargetId: () => {
        this.createForm.controls.targetUserId.setValue('');
      },
      setHeroTargetIds: (userId, heroId) => {
        this.createForm.patchValue({ targetUserId: userId, targetHeroId: heroId });
        this.createForm.controls.targetUserId.markAsDirty();
        this.createForm.controls.targetHeroId.markAsDirty();
      },
      clearHeroTargetId: () => {
        this.createForm.controls.targetHeroId.setValue('');
      },
      setError: (summary, error) => this.handleError(summary, error),
    },
  );
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);

  onActionTypeChange(actionType: ModerationActionType | null): void {
    if (!actionType?.scopeRequired) {
      this.createForm.controls.scopeKey.setValue('');
    }
  }

  ensureSelectedActionType(visibleActionTypes: readonly ModerationActionType[]): void {
    const current = this.createForm.controls.actionTypeKey.value;

    if (visibleActionTypes.some((entry) => entry.key === current)) {
      return;
    }

    this.createForm.patchValue({
      actionTypeKey: visibleActionTypes[0]?.key ?? '',
      scopeKey: '',
    });
  }

  createAction(
    serverId: string | null,
    canModerate: boolean,
    actionType: ModerationActionType | null,
    onCreated: () => void,
  ): void {
    this.createForm.markAllAsTouched();

    if (!serverId || !canModerate || !actionType || this.createForm.invalid) {
      this.toast.show(
        'warn',
        'Moderation action incomplete',
        'Select an action type, target user and reason before creating an action.',
      );
      return;
    }

    if (actionType.scopeRequired && !this.createForm.controls.scopeKey.value.trim()) {
      this.toast.show(
        'warn',
        'Scope required',
        'Select an allowed moderation scope before creating this action.',
      );
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);
    this.moderationActions
      .createAction({
        serverId,
        actionTypeKey: this.createForm.controls.actionTypeKey.value,
        targetUserId: this.createForm.controls.targetUserId.value,
        targetHeroId: this.createForm.controls.targetHeroId.value,
        scopeKey: this.createForm.controls.scopeKey.value,
        reason: this.createForm.controls.reason.value,
        operatorNotes: this.createForm.controls.operatorNotes.value,
        playerVisibleNote: this.createForm.controls.playerVisibleNote.value,
        sourceEntityType: this.createForm.controls.sourceEntityType.value,
        sourceEntityId: this.createForm.controls.sourceEntityId.value,
        sourceSnapshotId: this.createForm.controls.sourceSnapshotId.value,
        expiresAt: this.createForm.controls.expiresAt.value,
        metadataJson: undefined,
      })
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.show('success', 'Moderation action created', 'The action was recorded.');
          this.resetAfterSuccess();
          onCreated();
        },
        error: (error) => this.handleError('Moderation action failed', error),
      });
  }

  reset(): void {
    this.createForm.reset({
      actionTypeKey: '',
      scopeKey: '',
      targetUserId: '',
      targetHeroId: '',
      reason: '',
      operatorNotes: '',
      playerVisibleNote: '',
      sourceEntityType: '',
      sourceEntityId: '',
      sourceSnapshotId: '',
      expiresAt: '',
    });
    this.targets.reset();
  }

  private resetAfterSuccess(): void {
    this.createForm.patchValue({
      targetUserId: '',
      targetHeroId: '',
      reason: '',
      operatorNotes: '',
      playerVisibleNote: '',
      sourceEntityType: '',
      sourceEntityId: '',
      sourceSnapshotId: '',
      expiresAt: '',
    });
    this.targets.reset();
    this.createForm.markAsPristine();
    this.createForm.markAsUntouched();
  }

  private handleError(summary: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.error.set(message);
    this.toast.show('error', summary, message);
  }
}
