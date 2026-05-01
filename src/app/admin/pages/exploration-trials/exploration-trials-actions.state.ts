import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
import { Json } from '../../../core/types/database.types';
import { TrialCombatCandidateAdminView } from '../../../core/domain/exploration/exploration-trial-admin.model';
import { ExplorationTrialAdmin } from '../../../core/services/exploration/exploration-trial-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimText, trimToNull } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import { toSlug } from '../../../core/utils/slug';
import {
  candidateFormValue,
  createTrialCombatCandidateForm,
  createTrialDefinitionForm,
  trialFormValue,
} from './exploration-trials-forms';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';

@Injectable()
export class ExplorationTrialsActionsState {
  private readonly admin = inject(ExplorationTrialAdmin);
  private readonly page = inject(ExplorationTrialsPageState);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly saveToken = new RequestToken();
  private isSyncingForm = false;

  readonly selectedCandidateId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly selectedCandidate = computed(() => {
    const candidateId = this.selectedCandidateId();

    return this.page.combatCandidates().find((row) => row.candidate.id === candidateId) ?? null;
  });

  readonly trialForm = createTrialDefinitionForm();
  readonly candidateForm = createTrialCombatCandidateForm();

  constructor() {
    effect(() => {
      this.page.selectedTrialId();
      this.syncFormsFromSelection();
    });

    this.trialForm.controls.label.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((label) => this.syncGeneratedKey(label));
  }

  selectCandidate(candidateId: string | null): void {
    this.selectedCandidateId.set(candidateId);
    this.syncCandidateForm(this.selectedCandidate());
  }

  startNewTrial(): void {
    this.page.selectTrial(null);
    this.selectedCandidateId.set(null);
    this.trialForm.reset(trialFormValue(this.page.data(), null));
    this.resetCandidateForm();
  }

  startNewCandidate(): void {
    this.selectedCandidateId.set(null);
    this.resetCandidateForm();
  }

  saveTrial(): void {
    const metadataJson = this.parseMetadata();

    if (metadataJson === null) {
      return;
    }

    try {
      const guard = this.currentTrialGuard();
      const reason = requiredFormValue(this.trialForm.controls.reason.value, 'Reason');

      this.runSave(
        this.admin.upsertTrialDefinition({
          trialDefinitionId: this.trialForm.controls.trialDefinitionId.value,
          key: this.trialForm.controls.key.value,
          label: this.trialForm.controls.label.value,
          description: this.trialForm.controls.description.value,
          helperText: trimToNull(this.trialForm.controls.helperText.value),
          adminDescription: trimToNull(this.trialForm.controls.adminDescription.value),
          testedStatKey: requiredFormValue(this.trialForm.controls.testedStatKey.value, 'Tested stat'),
          minigameKey: requiredFormValue(this.trialForm.controls.minigameKey.value, 'Minigame'),
          sortOrder: this.trialForm.controls.sortOrder.value,
          isActive: this.trialForm.controls.isActive.value,
          metadataJson,
          reason,
        }),
        'Trial definition saved.',
        (trial) => {
          this.page.selectTrial(trial.id);
          this.page.loadInitialData();
        },
        guard,
      );
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Trial definition validation failed.'));
    }
  }

  saveCandidate(): void {
    const trial = this.page.selectedTrial();

    if (!trial?.isCombatTrial) {
      this.page.error.set('Combat candidates can be edited only for combat trials.');
      return;
    }

    const candidateKind = this.candidateForm.controls.candidateKind.value;
    const guard = this.currentCandidateGuard();
    const reason = requiredFormValue(this.candidateForm.controls.reason.value, 'Reason');

    try {
      this.runSave(
        this.admin.upsertTrialCombatCandidate({
          candidateId: this.candidateForm.controls.candidateId.value,
          trialDefinitionId: trial.trial.id,
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
        }),
        'Combat candidate saved.',
        (candidate) => {
          this.selectedCandidateId.set(candidate.id);
          this.page.loadInitialData();
        },
        guard,
      );
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

      this.runSave(
        this.admin.deactivateTrialCombatCandidate(
          candidate.candidate.id,
          reason,
        ),
        'Combat candidate deactivated.',
        () => this.page.loadInitialData(),
        guard,
      );
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Combat candidate validation failed.'));
    }
  }

  private syncFormsFromSelection(): void {
    this.isSyncingForm = true;
    this.trialForm.reset(trialFormValue(this.page.data(), this.page.selectedTrialId()));
    this.isSyncingForm = false;
    this.selectedCandidateId.set(null);
    this.resetCandidateForm();
  }

  private syncCandidateForm(row: TrialCombatCandidateAdminView | null): void {
    this.candidateForm.reset(candidateFormValue(row));
  }

  private resetCandidateForm(): void {
    this.syncCandidateForm(null);
  }

  private parseMetadata(): Json | null {
    try {
      const parsed = JSON.parse(this.trialForm.controls.metadataJsonText.value || '{}');

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Metadata must be a JSON object.');
      }

      return parsed as Json;
    } catch (error: unknown) {
      this.page.error.set('Metadata must be a valid JSON object.');
      return null;
    }
  }

  private runSave<T>(
    request$: Observable<T>,
    message: string,
    onSuccess: (value: T) => void,
    isCurrent: () => boolean,
  ): void {
    const token = this.saveToken.next();

    this.isSaving.set(true);
    this.page.error.set(null);
    request$
      .pipe(
        finalize(() => {
          if (this.saveToken.isCurrent(token)) {
            this.isSaving.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (value) => {
          if (!this.saveToken.isCurrent(token) || !isCurrent()) {
            return;
          }

          this.toast.show('success', 'Exploration trials', message);
          onSuccess(value);
        },
        error: (error: unknown) => {
          if (!this.saveToken.isCurrent(token) || !isCurrent()) {
            return;
          }

          this.page.error.set(getErrorMessage(error, 'Trial configuration action failed.'));
        },
      });
  }

  private syncGeneratedKey(label: string): void {
    if (this.isSyncingForm) {
      return;
    }

    if (this.page.selectedTrialId() || this.trialForm.controls.trialDefinitionId.value) {
      return;
    }

    if (this.trialForm.controls.allowKeyOverride.value) {
      return;
    }

    const nextKey = toSlug(label);

    if (this.trialForm.controls.key.value !== nextKey) {
      this.trialForm.controls.key.setValue(nextKey, { emitEvent: false });
    }
  }

  private currentTrialGuard(): () => boolean {
    const selectedTrialId = this.page.selectedTrialId();
    const formTrialId = this.trialForm.controls.trialDefinitionId.value;

    return () =>
      this.page.selectedTrialId() === selectedTrialId &&
      this.trialForm.controls.trialDefinitionId.value === formTrialId;
  }

  private currentCandidateGuard(): () => boolean {
    const selectedTrialId = this.page.selectedTrialId();
    const selectedCandidateId = this.selectedCandidateId();
    const formCandidateId = this.candidateForm.controls.candidateId.value;

    return () =>
      this.page.selectedTrialId() === selectedTrialId &&
      this.selectedCandidateId() === selectedCandidateId &&
      this.candidateForm.controls.candidateId.value === formCandidateId;
  }
}

function requiredFormValue(value: string | null, label: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}
