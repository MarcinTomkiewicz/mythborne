import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { HeroExplorationDebug } from '../../../core/services/exploration/hero-exploration-debug';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimText } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import {
  ExplorationDebugScope,
  ExplorationDebugScopeState,
} from './exploration-debug-scope.state';
import {
  CHALLENGE_SUCCESS_OPTIONS,
  DAILY_ACTION_TYPE_OPTIONS,
  FORCED_OUTCOME_OPTIONS,
  MANIFESTATION_STATUS_OPTIONS,
} from './exploration-debug-action-options';
import { ExplorationDebugFeedbackState } from './exploration-debug-feedback.state';
import { createExplorationDebugActionForms } from './exploration-debug-forms';
import { ExplorationDebugDefinitionsState } from './exploration-debug-definitions.state';
import { ExplorationDebugRuntimeState } from './exploration-debug-runtime.state';

@Injectable()
export class ExplorationDebugActionsState {
  private readonly debug = inject(HeroExplorationDebug);
  private readonly scope = inject(ExplorationDebugScopeState);
  private readonly definitions = inject(ExplorationDebugDefinitionsState);
  private readonly runtime = inject(ExplorationDebugRuntimeState);
  private readonly feedback = inject(ExplorationDebugFeedbackState);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly actionToken = new RequestToken();
  private readonly forms = createExplorationDebugActionForms();

  readonly remainingActionsForm = new FormGroup(this.forms.remainingActions);
  readonly resetForm = new FormGroup(this.forms.reset);
  readonly skipTimerForm = new FormGroup(this.forms.skipTimer);
  readonly rewardForm = new FormGroup(this.forms.reward);
  readonly overrideForm = new FormGroup(this.forms.override);
  readonly forceChallengeForm = new FormGroup(this.forms.forceChallenge);
  readonly isRunningAction = signal(false);
  readonly rewardProfileSuggestions = signal(this.definitions.rewardProfiles());
  readonly trialDefinitionSuggestions = signal(this.definitions.trialDefinitions());
  readonly encounterDefinitionSuggestions = signal(this.definitions.encounterDefinitions());
  readonly dailyActionTypeOptions = DAILY_ACTION_TYPE_OPTIONS;
  readonly forcedOutcomeOptions = FORCED_OUTCOME_OPTIONS;
  readonly manifestationStatusOptions = MANIFESTATION_STATUS_OPTIONS;
  readonly challengeSuccessOptions = CHALLENGE_SUCCESS_OPTIONS;
  readonly stepOptions = computed(() =>
    (this.runtime.debugState()?.explorations ?? [])
      .flatMap((entry) => [...(entry.activeStep ? [entry.activeStep] : []), ...entry.recentSteps])
      .map((step) => ({
        label: `${step.directionKey ?? step.stepKind} / ${step.status} / resolves ${step.resolvesAt} / ${step.id}`,
        value: step.id,
      })),
  );
  readonly challengeOptions = computed(() =>
    (this.runtime.debugState()?.explorations ?? [])
      .flatMap((entry) => [
        ...(entry.activeChallenge ? [entry.activeChallenge] : []),
        ...entry.recentChallenges,
      ])
      .map((challenge) => ({
        label: `${challenge.challengeKind} / ${challenge.status} / ${challenge.id}`,
        value: challenge.id,
      })),
  );

  constructor() {
    effect(() => {
      this.scope.scopeVersion();
      this.reset();
    });

    this.scope.scopeForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reset());
  }

  addRemainingActions(): void {
    const scope = this.scope.currentScope(true);

    if (!scope || this.markInvalid(this.remainingActionsForm)) {
      return;
    }

    const actionDate =
      trimText(this.remainingActionsForm.controls.actionDate.value) ||
      scope.explorationDate;

    this.runAction(
      scope,
      this.debug.addRemainingActions({
        serverId: scope.serverId,
        heroId: scope.heroId,
        actionKind: this.remainingActionsForm.controls.actionKind.value,
        amount: this.remainingActionsForm.controls.amount.value,
        actionDate,
        reason: trimText(this.remainingActionsForm.controls.reason.value),
      }),
      'Remaining exploration actions updated.',
    );
  }

  resetExploration(): void {
    const scope = this.scope.currentScope(true);

    if (!scope || this.markInvalid(this.resetForm)) {
      return;
    }

    this.runAction(
      scope,
      this.debug.resetExploration({
        ...scope,
        difficultyKey: this.resetForm.controls.difficultyKey.value,
        explorationDate: this.resetForm.controls.explorationDate.value,
        reason: trimText(this.resetForm.controls.reason.value),
      }),
      'Exploration runtime reset through DB helper.',
    );
  }

  skipStepTimer(): void {
    const scope = this.scope.currentScope(true);

    if (!scope || this.markInvalid(this.skipTimerForm)) {
      return;
    }

    this.runAction(
      scope,
      this.debug.skipStepTimer({
        serverId: scope.serverId,
        stepId: trimText(this.skipTimerForm.controls.stepId.value),
        reason: trimText(this.skipTimerForm.controls.reason.value),
      }),
      'Step timer skipped through DB helper.',
    );
  }

  grantRewardProfile(): void {
    const scope = this.scope.currentScope(true);

    if (!scope || this.markInvalid(this.rewardForm)) {
      return;
    }

    this.runAction(
      scope,
      this.debug.testGrantRewardProfileToHero({
        serverId: scope.serverId,
        heroId: scope.heroId,
        rewardProfileId: requiredSelectedId(this.rewardForm.controls.rewardProfileId.value),
        reason: trimText(this.rewardForm.controls.reason.value),
      }),
      'Reward profile granted for reward UI/debug verification.',
    );
  }

  setNextOutcomeOverride(): void {
    const scope = this.scope.currentScope(true);

    if (!scope || this.markInvalid(this.overrideForm)) {
      return;
    }

    this.runAction(
      scope,
      this.debug.setNextOutcomeOverride({
        ...scope,
        difficultyKey: this.overrideForm.controls.difficultyKey.value,
        forcedOutcomeKind: this.overrideForm.controls.forcedOutcomeKind.value,
        trialDefinitionId: selectedId(this.overrideForm.controls.trialDefinitionId.value),
        encounterDefinitionId: selectedId(
          this.overrideForm.controls.encounterDefinitionId.value,
        ),
        forceManifestationStatus:
          this.overrideForm.controls.forceManifestationStatus.value,
        expiresInMinutes: this.overrideForm.controls.expiresInMinutes.value,
        reason: trimText(this.overrideForm.controls.reason.value),
      }),
      'Next movement resolution outcome override saved.',
    );
  }

  forceCompleteChallenge(): void {
    const scope = this.scope.currentScope(true);

    if (!scope || this.markInvalid(this.forceChallengeForm)) {
      return;
    }

    this.runAction(
      scope,
      this.debug.forceCompleteChallengeAttempt({
        serverId: scope.serverId,
        challengeAttemptId: trimText(
          this.forceChallengeForm.controls.challengeAttemptId.value,
        ),
        success: this.forceChallengeForm.controls.success.value,
        reason: trimText(this.forceChallengeForm.controls.reason.value),
      }),
      'Challenge attempt force-completed for sandbox verification.',
    );
  }

  searchRewardProfiles(query: string): void {
    this.rewardProfileSuggestions.set(this.definitions.filterRewardProfiles(query));
  }

  selectRewardProfile(): void {
    const profile = this.rewardForm.controls.rewardProfile.value;
    this.rewardForm.controls.rewardProfileId.setValue(profile?.id ?? null);
  }

  clearRewardProfile(): void {
    this.rewardForm.controls.rewardProfile.setValue(null);
    this.rewardForm.controls.rewardProfileId.setValue(null);
  }

  searchTrialDefinitions(query: string): void {
    this.trialDefinitionSuggestions.set(this.definitions.filterTrialDefinitions(query));
  }

  selectTrialDefinition(): void {
    const trial = this.overrideForm.controls.trialDefinition.value;
    this.overrideForm.controls.trialDefinitionId.setValue(trial?.id ?? null);
  }

  clearTrialDefinition(): void {
    this.overrideForm.controls.trialDefinition.setValue(null);
    this.overrideForm.controls.trialDefinitionId.setValue(null);
  }

  searchEncounterDefinitions(query: string): void {
    this.encounterDefinitionSuggestions.set(
      this.definitions.filterEncounterDefinitions(query),
    );
  }

  selectEncounterDefinition(): void {
    const encounter = this.overrideForm.controls.encounterDefinition.value;
    this.overrideForm.controls.encounterDefinitionId.setValue(encounter?.id ?? null);
  }

  clearEncounterDefinition(): void {
    this.overrideForm.controls.encounterDefinition.setValue(null);
    this.overrideForm.controls.encounterDefinitionId.setValue(null);
  }

  reset(): void {
    this.actionToken.next();
    this.isRunningAction.set(false);
  }

  private runAction(
    scope: ExplorationDebugScope,
    action: Observable<unknown>,
    successMessage: string,
  ): void {
    const token = this.actionToken.next();

    this.isRunningAction.set(true);
    this.feedback.clear();
    action
      .pipe(
        finalize(() => {
          if (this.isCurrentAction(token, scope)) {
            this.isRunningAction.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (!this.isCurrentAction(token, scope)) {
            return;
          }

          this.runtime.refreshCurrentScope();
          this.toast.show('success', 'Exploration debug', successMessage);
        },
        error: (error: unknown) => {
          if (!this.isCurrentAction(token, scope)) {
            return;
          }

          this.feedback.error.set(
            getErrorMessage(error, 'Exploration debug action failed.'),
          );
        },
      });
  }

  private isCurrentAction(token: number, scope: ExplorationDebugScope): boolean {
    return this.actionToken.isCurrent(token) && this.scope.isCurrentScope(scope);
  }

  private markInvalid(form: FormGroup): boolean {
    if (form.valid) {
      return false;
    }

    form.markAllAsTouched();
    this.feedback.error.set('Fill required debug action fields before running the helper.');
    return true;
  }
}

function selectedId(value: string | null | undefined): string | null {
  return trimText(value) || null;
}

function requiredSelectedId(value: string | null | undefined): string {
  return trimText(value);
}

