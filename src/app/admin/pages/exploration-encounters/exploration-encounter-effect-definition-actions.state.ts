import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import { ExplorationEffectDefinitionAdminView } from '../../../core/domain/exploration/exploration-encounter-admin.model';
import { ExplorationEncounterAdmin } from '../../../core/services/exploration/exploration-encounter-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimToNull } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import { toSlug } from '../../../core/utils/slug';
import { parseMetadataJson, requiredFormValue } from './exploration-encounter-action-utils';
import { ExplorationEncounterFormFactory } from './exploration-encounter-form.factory';
import { ExplorationEncounterDefinitionActionsState } from './exploration-encounter-definition-actions.state';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';
import {
  markReasonInvalid,
  nextSortOrder,
  runEncounterWorkflowAction,
} from './exploration-encounter-workflow-actions';

@Injectable()
export class ExplorationEncounterEffectDefinitionActionsState {
  private readonly admin = inject(ExplorationEncounterAdmin);
  private readonly page = inject(ExplorationEncountersPageState);
  private readonly definitionActions = inject(ExplorationEncounterDefinitionActionsState);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formFactory = inject(ExplorationEncounterFormFactory);
  private readonly saveToken = new RequestToken();
  private isSyncingForm = false;

  readonly selectedEffectDefinitionId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly reasonError = signal<string | null>(null);
  readonly form = this.formFactory.createExplorationEffectDefinitionForm();
  readonly selectedEffectDefinition = computed(() => {
    const effectId = this.selectedEffectDefinitionId();

    return this.page.effectDefinitions().find((row) => row.effect.id === effectId) ?? null;
  });

  constructor() {
    effect(() => {
      this.page.selectedEncounterId();
      untracked(() => this.startNewEffectDefinition());
    });

    this.form.controls.label.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((label) => this.syncGeneratedKey(label));
  }

  selectEffectDefinition(effectDefinitionId: string | null): void {
    this.selectedEffectDefinitionId.set(effectDefinitionId);
    this.syncForm(this.selectedEffectDefinition());
  }

  startNewEffectDefinition(): void {
    this.selectedEffectDefinitionId.set(null);
    this.syncForm(null);
  }

  saveEffectDefinition(onSaved?: (effectId: string, effectKind: string) => void): void {
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

    if (this.definitionActions.hasUnsavedEncounterKindChange()) {
      this.page.error.set('Save the encounter definition kind before editing kind-specific configuration.');
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
          this.admin.upsertExplorationEffectDefinition({
            effectDefinitionId: this.form.controls.effectDefinitionId.value,
            key: requiredFormValue(this.form.controls.key.value, 'Key'),
            label: requiredFormValue(this.form.controls.label.value, 'Label'),
            description: requiredFormValue(this.form.controls.description.value, 'Description'),
            helperText: trimToNull(this.form.controls.helperText.value),
            adminDescription: trimToNull(this.form.controls.adminDescription.value),
            effectKind: requiredFormValue(this.form.controls.effectKind.value, 'Effect kind'),
            bonusTemplateId: this.form.controls.bonusTemplateId.value,
            defaultValue: this.form.controls.defaultValue.value,
            defaultDurationSteps: this.form.controls.defaultDurationSteps.value,
            sortOrder: this.form.controls.sortOrder.value,
            isActive: this.form.controls.isActive.value,
            metadataJson,
            reason,
          }),
        successMessage: 'Effect definition saved.',
        failureMessage: 'Effect definition action failed.',
        onSuccess: (effect) => {
          this.selectedEffectDefinitionId.set(effect.id);
          onSaved?.(effect.id, effect.effectKind);
        },
      });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Effect definition validation failed.'));
    }
  }

  deactivateEffectDefinition(): void {
    const effect = this.selectedEffectDefinition();

    if (!effect) {
      this.page.error.set('Select an effect definition first.');
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
        call: () => this.admin.deactivateExplorationEffectDefinition(effect.effect.id, reason),
        successMessage: 'Effect definition deactivated.',
        failureMessage: 'Effect definition action failed.',
      });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Effect definition validation failed.'));
    }
  }

  private syncForm(row: ExplorationEffectDefinitionAdminView | null): void {
    this.reasonError.set(null);
    this.isSyncingForm = true;
    this.form.reset(this.formFactory.effectDefinitionValue(row));
    this.isSyncingForm = false;

    if (!row) {
      const encounterKind = this.page.selectedEncounter()?.encounter.encounterKind;

      if (encounterKind === ENCOUNTER_KIND.buff || encounterKind === ENCOUNTER_KIND.debuff) {
        this.form.controls.effectKind.setValue(encounterKind, { emitEvent: false });
      }

      this.form.controls.sortOrder.setValue(
        nextSortOrder(this.page.effectDefinitions(), (entry) => entry.effect.sortOrder),
      );
    }
  }

  private syncGeneratedKey(label: string): void {
    if (
      this.isSyncingForm ||
      this.selectedEffectDefinitionId() ||
      this.form.controls.effectDefinitionId.value ||
      this.form.controls.allowKeyOverride.value
    ) {
      return;
    }

    const nextKey = toSlug(label);

    if (this.form.controls.key.value !== nextKey) {
      this.form.controls.key.setValue(nextKey, { emitEvent: false });
    }
  }

  private currentGuard(): () => boolean {
    const selectedEffectDefinitionId = this.selectedEffectDefinitionId();
    const formEffectDefinitionId = this.form.controls.effectDefinitionId.value;

    return () =>
      this.selectedEffectDefinitionId() === selectedEffectDefinitionId &&
      this.form.controls.effectDefinitionId.value === formEffectDefinitionId;
  }
}
