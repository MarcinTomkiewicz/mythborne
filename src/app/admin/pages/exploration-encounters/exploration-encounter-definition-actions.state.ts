import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ExplorationEncounterAdmin } from '../../../core/services/exploration/exploration-encounter-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimToNull } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import { toSlug } from '../../../core/utils/slug';
import {
  createEncounterDefinitionForm,
  encounterFormValue,
} from './exploration-encounters-forms';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';
import { parseMetadataJson, requiredFormValue } from './exploration-encounter-action-utils';

@Injectable()
export class ExplorationEncounterDefinitionActionsState {
  private readonly admin = inject(ExplorationEncounterAdmin);
  private readonly page = inject(ExplorationEncountersPageState);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly saveToken = new RequestToken();
  private isSyncingForm = false;

  readonly encounterForm = createEncounterDefinitionForm();
  readonly isSaving = signal(false);

  constructor() {
    effect(() => {
      this.page.selectedEncounterId();
      this.syncFormFromSelection();
    });

    this.encounterForm.controls.label.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((label) => this.syncGeneratedKey(label));
  }

  startNewEncounter(): void {
    this.page.selectEncounter(null);
    this.encounterForm.reset(encounterFormValue(this.page.data(), null));
  }

  saveEncounter(): void {
    const metadataJson = parseMetadataJson(
      this.encounterForm.controls.metadataJsonText.value,
      (message) => this.page.error.set(message),
    );

    if (metadataJson === null) {
      return;
    }

    try {
      const guard = this.currentEncounterGuard();
      const reason = requiredFormValue(this.encounterForm.controls.reason.value, 'Reason');
      const token = this.saveToken.next();

      this.isSaving.set(true);
      this.page.error.set(null);
      this.admin
        .upsertEncounterDefinition({
          encounterDefinitionId: this.encounterForm.controls.encounterDefinitionId.value,
          key: this.encounterForm.controls.key.value,
          label: this.encounterForm.controls.label.value,
          description: this.encounterForm.controls.description.value,
          helperText: trimToNull(this.encounterForm.controls.helperText.value),
          adminDescription: trimToNull(this.encounterForm.controls.adminDescription.value),
          encounterKind: requiredFormValue(
            this.encounterForm.controls.encounterKind.value,
            'Encounter kind',
          ),
          minigameKey: this.encounterForm.controls.minigameKey.value,
          rewardProfileId: this.encounterForm.controls.rewardProfileId.value,
          minDifficultyKey: this.encounterForm.controls.minDifficultyKey.value,
          maxDifficultyKey: this.encounterForm.controls.maxDifficultyKey.value,
          minDistrictCode: this.encounterForm.controls.minDistrictCode.value,
          maxDistrictCode: this.encounterForm.controls.maxDistrictCode.value,
          sortOrder: this.encounterForm.controls.sortOrder.value,
          isActive: this.encounterForm.controls.isActive.value,
          metadataJson,
          reason,
        })
        .pipe(
          finalize(() => {
            if (this.saveToken.isCurrent(token)) {
              this.isSaving.set(false);
            }
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (encounter) => {
            if (!this.saveToken.isCurrent(token) || !guard()) {
              return;
            }

            this.toast.show('success', 'Exploration encounters', 'Encounter definition saved.');
            this.page.selectEncounter(encounter.id);
            this.page.loadInitialData();
          },
          error: (error: unknown) => {
            if (!this.saveToken.isCurrent(token) || !guard()) {
              return;
            }

            this.page.error.set(getErrorMessage(error, 'Encounter configuration action failed.'));
          },
        });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Encounter definition validation failed.'));
    }
  }

  deactivateEncounter(): void {
    const encounter = this.page.selectedEncounter();

    if (!encounter) {
      this.page.error.set('Select an encounter definition first.');
      return;
    }

    try {
      const guard = this.currentEncounterGuard();
      const reason = requiredFormValue(this.encounterForm.controls.reason.value, 'Reason');
      const token = this.saveToken.next();

      this.isSaving.set(true);
      this.page.error.set(null);
      this.admin
        .deactivateEncounterDefinition(encounter.encounter.id, reason)
        .pipe(
          finalize(() => {
            if (this.saveToken.isCurrent(token)) {
              this.isSaving.set(false);
            }
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => {
            if (!this.saveToken.isCurrent(token) || !guard()) {
              return;
            }

            this.toast.show('success', 'Exploration encounters', 'Encounter definition deactivated.');
            this.page.loadInitialData();
          },
          error: (error: unknown) => {
            if (!this.saveToken.isCurrent(token) || !guard()) {
              return;
            }

            this.page.error.set(getErrorMessage(error, 'Encounter configuration action failed.'));
          },
        });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Encounter deactivation validation failed.'));
    }
  }

  private syncFormFromSelection(): void {
    this.isSyncingForm = true;
    this.encounterForm.reset(encounterFormValue(this.page.data(), this.page.selectedEncounterId()));
    this.isSyncingForm = false;
  }

  private syncGeneratedKey(label: string): void {
    if (
      this.isSyncingForm ||
      this.page.selectedEncounterId() ||
      this.encounterForm.controls.encounterDefinitionId.value ||
      this.encounterForm.controls.allowKeyOverride.value
    ) {
      return;
    }

    const nextKey = toSlug(label);

    if (this.encounterForm.controls.key.value !== nextKey) {
      this.encounterForm.controls.key.setValue(nextKey, { emitEvent: false });
    }
  }

  private currentEncounterGuard(): () => boolean {
    const selectedEncounterId = this.page.selectedEncounterId();
    const formEncounterId = this.encounterForm.controls.encounterDefinitionId.value;

    return () =>
      this.page.selectedEncounterId() === selectedEncounterId &&
      this.encounterForm.controls.encounterDefinitionId.value === formEncounterId;
  }
}
