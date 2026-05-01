import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { EncounterCombatCandidateAdminView } from '../../../core/domain/exploration/exploration-encounter-admin.model';
import { ExplorationEncounterAdmin } from '../../../core/services/exploration/exploration-encounter-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import {
  candidateFormValue,
  createEncounterCombatCandidateForm,
} from './exploration-encounters-forms';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';
import { requiredFormValue } from './exploration-encounter-action-utils';

@Injectable()
export class ExplorationEncounterCandidateActionsState {
  private readonly admin = inject(ExplorationEncounterAdmin);
  private readonly page = inject(ExplorationEncountersPageState);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly saveToken = new RequestToken();

  readonly selectedCandidateId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly selectedCandidate = computed(() => {
    const candidateId = this.selectedCandidateId();

    return this.page.combatCandidates().find((row) => row.candidate.id === candidateId) ?? null;
  });
  readonly candidateForm = createEncounterCombatCandidateForm();

  constructor() {
    effect(() => {
      this.page.selectedEncounterId();
      this.selectedCandidateId.set(null);
      this.resetCandidateForm();
    });
  }

  selectCandidate(candidateId: string | null): void {
    this.selectedCandidateId.set(candidateId);
    this.syncCandidateForm(this.selectedCandidate());
  }

  startNewCandidate(): void {
    this.selectedCandidateId.set(null);
    this.resetCandidateForm();
  }

  saveCandidate(): void {
    const encounter = this.page.selectedEncounter();

    if (!encounter?.isCombatEncounter) {
      this.page.error.set('Combat candidates can be edited only for combat encounters.');
      return;
    }

    try {
      const guard = this.currentCandidateGuard();
      const reason = requiredFormValue(this.candidateForm.controls.reason.value, 'Reason');
      const candidateKind = this.candidateForm.controls.candidateKind.value;
      const token = this.saveToken.next();

      this.isSaving.set(true);
      this.page.error.set(null);
      this.admin
        .upsertEncounterCombatCandidate({
          candidateId: this.candidateForm.controls.candidateId.value,
          encounterDefinitionId: encounter.encounter.id,
          candidateKind,
          opponentDefinitionId:
            candidateKind === 'opponent'
              ? this.candidateForm.controls.opponentDefinitionId.value
              : null,
          familyKey: candidateKind === 'family' ? this.candidateForm.controls.familyKey.value : null,
          scalingFormulaId: this.candidateForm.controls.scalingFormulaId.value,
          difficultyMultiplier: this.candidateForm.controls.difficultyMultiplier.value,
          weight: this.candidateForm.controls.weight.value,
          minHeroLevel: this.candidateForm.controls.minHeroLevel.value,
          maxHeroLevel: this.candidateForm.controls.maxHeroLevel.value,
          sortOrder: this.candidateForm.controls.sortOrder.value,
          isActive: this.candidateForm.controls.isActive.value,
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
          next: (candidate) => {
            if (!this.saveToken.isCurrent(token) || !guard()) {
              return;
            }

            this.toast.show('success', 'Exploration encounters', 'Encounter combat candidate saved.');
            this.selectedCandidateId.set(candidate.id);
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
      this.page.error.set(getErrorMessage(error, 'Combat candidate validation failed.'));
    }
  }

  deactivateCandidate(): void {
    const candidate = this.selectedCandidate();

    if (!candidate) {
      this.page.error.set('Select a combat candidate first.');
      return;
    }

    try {
      const guard = this.currentCandidateGuard();
      const reason = requiredFormValue(this.candidateForm.controls.reason.value, 'Reason');
      const token = this.saveToken.next();

      this.isSaving.set(true);
      this.page.error.set(null);
      this.admin
        .deactivateEncounterCombatCandidate(candidate.candidate.id, reason)
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

            this.toast.show('success', 'Exploration encounters', 'Encounter combat candidate deactivated.');
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
      this.page.error.set(getErrorMessage(error, 'Combat candidate validation failed.'));
    }
  }

  private syncCandidateForm(row: EncounterCombatCandidateAdminView | null): void {
    this.candidateForm.reset(candidateFormValue(row));
  }

  private resetCandidateForm(): void {
    this.syncCandidateForm(null);
  }

  private currentCandidateGuard(): () => boolean {
    const selectedEncounterId = this.page.selectedEncounterId();
    const selectedCandidateId = this.selectedCandidateId();
    const formCandidateId = this.candidateForm.controls.candidateId.value;

    return () =>
      this.page.selectedEncounterId() === selectedEncounterId &&
      this.selectedCandidateId() === selectedCandidateId &&
      this.candidateForm.controls.candidateId.value === formCandidateId;
  }
}
