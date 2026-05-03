import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { CombatOpponentEquipmentEntryReadModel } from '../../../core/domain/combat/combat-opponent.model';
import { CombatOpponentAdmin } from '../../../core/services/combat/combat-opponent-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { nextSortOrder } from '../../../core/utils/admin-form-helpers';
import {
  combatOpponentAffixOptions,
  combatOpponentBucketProfileOptions,
  combatOpponentManualBaseOptions,
  combatOpponentQualityOptions,
  combatOpponentSlotOptions,
} from '../../../core/utils/combat-opponent-admin-options';
import { RequestToken } from '../../../core/utils/request-token';
import {
  createCombatOpponentEquipmentForm,
  equipmentFormValue,
} from './combat-opponents-forms';
import {
  CombatOpponentsPageState,
  equipmentModeHelp,
} from './combat-opponents-page.state';
import {
  markCombatOpponentReasonInvalid,
  runCombatOpponentWorkflowAction,
} from './combat-opponents-workflow-actions';

@Injectable()
export class CombatOpponentEquipmentActionsState {
  private readonly page = inject(CombatOpponentsPageState);
  private readonly admin = inject(CombatOpponentAdmin);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly token = new RequestToken();

  readonly form = createCombatOpponentEquipmentForm();
  readonly isSaving = signal(false);
  readonly reasonError = signal<string | null>(null);

  readonly slotOptions = computed(() => combatOpponentSlotOptions(this.page.data()));
  readonly hasSlotConfigurationGap = computed(() => this.slotOptions().length === 0);
  readonly configurationGapMessage =
    'No active equipment slots were returned from equipment_slot_definitions. Configure active slots before saving opponent equipment entries.';
  readonly qualityOptions = computed(() => combatOpponentQualityOptions(this.page.data()));
  readonly baseOptions = computed(() => combatOpponentManualBaseOptions(this.page.data()));
  readonly prefixOptions = computed(() => combatOpponentAffixOptions(this.page.data(), 'prefixes'));
  readonly suffixOptions = computed(() => combatOpponentAffixOptions(this.page.data(), 'suffixes'));
  readonly bucketProfileOptions = computed(() => combatOpponentBucketProfileOptions(this.page.data()));
  readonly isGeneratedEntry = computed(() => this.form.controls.entryMode.value === 'generated');
  readonly entryModeHelp = computed(() =>
    equipmentModeHelp(this.page.data()?.equipmentModes ?? [], this.form.controls.entryMode.value),
  );

  syncForm(): void {
    this.form.reset(
      equipmentFormValue(
        this.page.data(),
        this.page.selectedEquipmentEntry(),
        nextSortOrder(
          this.page.selectedOpponentView()?.equipmentEntries ?? [],
          (row) => row.entry.sortOrder,
        ),
      ),
      { emitEvent: false },
    );
  }

  save(): void {
    const opponentDefinitionId = this.page.selectedOpponentId();

    if (this.hasSlotConfigurationGap()) {
      this.page.setError(this.configurationGapMessage);
      return;
    }

    if (!opponentDefinitionId || this.markInvalid()) {
      return;
    }

    runCombatOpponentWorkflowAction({
      token: this.token,
      destroyRef: this.destroyRef,
      toast: this.toast,
      isSaving: this.isSaving,
      setError: (message) => this.page.setError(message),
      call: () => this.admin.saveEquipmentEntry({
        ...this.form.getRawValue(),
        opponentDefinitionId,
      }),
      successMessage: 'Equipment entry saved.',
      failureMessage: 'Failed to save combat opponent equipment entry.',
      onSuccess: () => this.page.loadInitialData(),
    });
  }

  deactivate(): void {
    const equipmentEntryId = this.form.controls.equipmentEntryId.value;

    if (!equipmentEntryId || this.markInvalid()) {
      return;
    }

    runCombatOpponentWorkflowAction<CombatOpponentEquipmentEntryReadModel>({
      token: this.token,
      destroyRef: this.destroyRef,
      toast: this.toast,
      isSaving: this.isSaving,
      setError: (message) => this.page.setError(message),
      call: () => this.admin.deactivateEquipmentEntry(
        equipmentEntryId,
        this.form.controls.reason.value,
      ),
      successMessage: 'Equipment entry deactivated.',
      failureMessage: 'Failed to deactivate combat opponent equipment entry.',
      onSuccess: () => this.page.loadInitialData(),
    });
  }

  private markInvalid(): boolean {
    this.form.markAllAsTouched();
    return this.form.invalid ||
      markCombatOpponentReasonInvalid(this.reasonError, this.form.controls.reason);
  }
}
