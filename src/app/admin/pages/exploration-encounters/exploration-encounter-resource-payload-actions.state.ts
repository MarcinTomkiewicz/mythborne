import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { EncounterResourcePayloadAdminView } from '../../../core/domain/exploration/exploration-encounter-admin.model';
import { ExplorationEncounterAdmin } from '../../../core/services/exploration/exploration-encounter-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimToNull } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import { parseMetadataJson, requiredFormValue } from './exploration-encounter-action-utils';
import {
  createEncounterResourcePayloadForm,
  resourcePayloadFormValue,
} from './exploration-encounters-forms';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';
import {
  markReasonInvalid,
  nextSortOrder,
  runEncounterWorkflowAction,
} from './exploration-encounter-workflow-actions';

@Injectable()
export class ExplorationEncounterResourcePayloadActionsState {
  private readonly admin = inject(ExplorationEncounterAdmin);
  private readonly page = inject(ExplorationEncountersPageState);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly saveToken = new RequestToken();

  readonly selectedPayloadId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly reasonError = signal<string | null>(null);
  readonly form = createEncounterResourcePayloadForm();
  readonly selectedPayload = computed(() => {
    const payloadId = this.selectedPayloadId();

    return this.page.resourcePayloads().find((row) => row.payload.id === payloadId) ?? null;
  });

  constructor() {
    effect(() => {
      this.page.selectedEncounterId();
      this.startNewPayload();
    });
  }

  selectPayload(payloadId: string | null): void {
    this.selectedPayloadId.set(payloadId);
    this.syncForm(this.selectedPayload());
  }

  startNewPayload(): void {
    this.selectedPayloadId.set(null);
    this.syncForm(null);
  }

  savePayload(): void {
    const encounter = this.page.selectedEncounter();
    this.page.error.set(null);
    const metadataJson = parseMetadataJson(
      this.form.controls.metadataJsonText.value,
      (message) => this.page.error.set(message),
    );

    this.form.markAllAsTouched();
    const hasInvalidReason = markReasonInvalid(this.reasonError, this.form.controls.reason);

    if (this.form.invalid || hasInvalidReason || metadataJson === null) {
      return;
    }

    if (!encounter) {
      this.page.error.set('Select a resource encounter first.');
      return;
    }

    if (encounter.encounter.encounterKind !== 'resource') {
      this.page.error.set('Resource payloads can be edited only for resource encounters.');
      return;
    }

    try {
      const guard = this.currentGuard();
      const reason = requiredFormValue(this.form.controls.reason.value, 'Reason');

      runEncounterWorkflowAction({
        token: this.saveToken,
        destroyRef: this.destroyRef,
        page: this.page,
        toast: this.toast,
        isSaving: this.isSaving,
        guard,
        call: () =>
          this.admin.upsertEncounterResourcePayload({
            payloadId: this.form.controls.payloadId.value,
            encounterDefinitionId: encounter.encounter.id,
            resourceType: requiredFormValue(this.form.controls.resourceType.value, 'Resource type'),
            amountMode: requiredFormValue(this.form.controls.amountMode.value, 'Amount mode'),
            minAmount: this.form.controls.minAmount.value,
            maxAmount: this.form.controls.maxAmount.value,
            formulaId: this.form.controls.formulaId.value,
            chancePercent: this.form.controls.chancePercent.value,
            description: trimToNull(this.form.controls.description.value),
            helperText: trimToNull(this.form.controls.helperText.value),
            adminDescription: trimToNull(this.form.controls.adminDescription.value),
            sortOrder: this.form.controls.sortOrder.value,
            isActive: this.form.controls.isActive.value,
            metadataJson,
            reason,
          }),
        successMessage: 'Resource payload saved.',
        failureMessage: 'Resource payload action failed.',
        onSuccess: (payload) => this.selectedPayloadId.set(payload.id),
      });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Resource payload validation failed.'));
    }
  }

  deactivatePayload(): void {
    const payload = this.selectedPayload();

    if (!payload) {
      this.page.error.set('Select a resource payload first.');
      return;
    }

    this.page.error.set(null);
    this.form.markAllAsTouched();
    if (markReasonInvalid(this.reasonError, this.form.controls.reason)) {
      return;
    }

    try {
      const guard = this.currentGuard();
      const reason = requiredFormValue(this.form.controls.reason.value, 'Reason');

      runEncounterWorkflowAction({
        token: this.saveToken,
        destroyRef: this.destroyRef,
        page: this.page,
        toast: this.toast,
        isSaving: this.isSaving,
        guard,
        call: () => this.admin.deactivateEncounterResourcePayload(payload.payload.id, reason),
        successMessage: 'Resource payload deactivated.',
        failureMessage: 'Resource payload action failed.',
      });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Resource payload validation failed.'));
    }
  }

  private syncForm(row: EncounterResourcePayloadAdminView | null): void {
    this.reasonError.set(null);
    this.form.reset(resourcePayloadFormValue(row));

    if (!row) {
      this.form.controls.sortOrder.setValue(
        nextSortOrder(this.page.resourcePayloads(), (entry) => entry.payload.sortOrder),
      );
    }
  }

  private currentGuard(): () => boolean {
    const selectedEncounterId = this.page.selectedEncounterId();
    const selectedPayloadId = this.selectedPayloadId();
    const formPayloadId = this.form.controls.payloadId.value;

    return () =>
      this.page.selectedEncounterId() === selectedEncounterId &&
      this.selectedPayloadId() === selectedPayloadId &&
      this.form.controls.payloadId.value === formPayloadId;
  }
}
