import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  HeroExplorationChallengeAttemptReadModel,
  HeroExplorationChallengeCompletionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';
import { ToastService } from '../../../core/services/ui/toast';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';
import { humanizeKey } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import {
  EXPLORATION_CHALLENGE_ACTION_MODE,
  explorationChallengeActionBlocker,
  explorationChallengeActionMode,
  hasChallengeAutoResolveChance,
} from './exploration-challenge-action-ui';
import {
  ChallengeCompletionSnapshot,
  ChallengeFact,
} from './exploration-challenge.model';
import { ExplorationFeedbackState } from './exploration-feedback.state';
import { explorationCombatRequestId } from './exploration-live-combat-labels';
import { ExplorationLiveCombatState } from './exploration-live-combat.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationRewardState } from './exploration-reward.state';
import { ExplorationStepState } from './exploration-step.state';

@Injectable()
export class ExplorationChallengeState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly explorations = inject(HeroExplorations);
  private readonly feedback = inject(ExplorationFeedbackState);
  private readonly overview = inject(ExplorationOverviewState);
  private readonly liveCombatState = inject(ExplorationLiveCombatState);
  private readonly rewardState = inject(ExplorationRewardState);
  private readonly stepState = inject(ExplorationStepState);
  private readonly toast = inject(ToastService);
  private readonly completionToken = new RequestToken();
  private readonly lastCompletion = signal<ChallengeCompletionSnapshot | null>(null);

  readonly isCompleting = signal(false);
  readonly isAutoResolvingCombat = signal(false);
  readonly activeChallenge = computed(() => this.overview.state()?.activeChallenge ?? null);
  readonly isCombatChallenge = this.liveCombatState.isCombatChallenge;
  readonly isEnsuringCombatSession = this.liveCombatState.isEnsuringCombatSession;
  readonly isLoadingCombatPreview = this.liveCombatState.isLoadingCombatPreview;
  readonly combatResolutionPreviewFailed = this.liveCombatState.combatResolutionPreviewFailed;
  readonly isRecoveringCombatState = this.liveCombatState.isRecoveringCombatState;
  readonly isSubmittingCombatAction = this.liveCombatState.isSubmittingCombatAction;
  readonly isCombatRunning = this.liveCombatState.isCombatRunning;
  readonly walkingPosition = this.liveCombatState.walkingPosition;
  readonly combatLiveState = this.liveCombatState.combatLiveState;
  readonly combatResolutionPreview = this.liveCombatState.combatResolutionPreview;
  readonly combatResultDetail = this.liveCombatState.combatResultDetail;
  readonly canStartCombat = this.liveCombatState.canStartCombat;
  readonly canShowCombatStartAction = this.liveCombatState.canShowCombatStartAction;
  readonly canShowCombatTimingAction = this.liveCombatState.canShowCombatTimingAction;
  readonly combatTimingManifest = this.liveCombatState.combatTimingManifest;
  readonly canSubmitCombatStrike = this.liveCombatState.canSubmitCombatStrike;
  readonly combatHitWindow = this.liveCombatState.combatHitWindow;
  readonly combatWalkingSpeed = this.liveCombatState.combatWalkingSpeed;
  readonly combatParticipants = this.liveCombatState.combatParticipants;
  readonly combatEvents = this.liveCombatState.combatEvents;
  readonly combatTimelineRows = this.liveCombatState.combatTimelineRows;
  readonly completedCombatLiveState = this.liveCombatState.completedCombatLiveState;
  readonly completedCombatChallenge = this.liveCombatState.completedCombatChallenge;
  readonly currentCombatActor = this.liveCombatState.currentCombatActor;
  readonly combatStatusLabel = this.liveCombatState.combatStatusLabel;
  readonly combatRoundLabel = this.liveCombatState.combatRoundLabel;
  readonly combatPlayerActionStatusLabel = this.liveCombatState.combatPlayerActionStatusLabel;
  readonly currentChallengeResult = computed(() => {
    const state = this.overview.state();
    const completion = this.lastCompletion();
    const stepResult = this.stepState.currentStepResult();
    const isCompletionStep = !stepResult ||
      stepResult.challengeAttemptId === completion?.result.challengeAttemptId;

    return completion &&
      state?.exploration?.id === completion.explorationId &&
      !state.activeStep &&
      !state.activeChallenge
      && isCompletionStep
      ? completion.result
      : null;
  });
  readonly challengeTitle = computed(() => this.title(this.activeChallenge()));
  readonly challengeStatusLabel = computed(() => {
    const challenge = this.activeChallenge();

    return challenge ? this.challengeStatusLabelText(challenge) : 'Status';
  });
  readonly challengeFacts = computed(() => this.facts(this.activeChallenge()));
  readonly challengeActionMode = computed(() =>
    explorationChallengeActionMode(this.activeChallenge()),
  );
  readonly challengeActionBlocker = computed(() =>
    explorationChallengeActionBlocker(this.activeChallenge(), this.challengeActionMode()),
  );
  readonly canShowManualResolveActions = computed(() =>
    this.challengeActionMode() === EXPLORATION_CHALLENGE_ACTION_MODE.manualTrial,
  );
  readonly canShowAutoResolveAction = computed(() =>
    this.canUseAutoResolve(this.activeChallenge()),
  );
  readonly canShowCombatAutoResolveAction = computed(() =>
    this.isExplorationCombatAutoResolvable(this.activeChallenge()) &&
    !this.combatLiveState() &&
    this.combatResolutionPreview()?.canAutoResolve === true,
  );
  readonly autoResolveExplanation = computed(() =>
    this.autoResolveText(this.activeChallenge()),
  );
  readonly canCompleteChallenge = computed(() =>
    Boolean(this.activeChallenge()) &&
    !this.isCompleting() &&
    this.challengeActionMode() === EXPLORATION_CHALLENGE_ACTION_MODE.manualTrial,
  );
  readonly canAutoResolveChallenge = computed(() =>
    Boolean(this.activeChallenge()) &&
    !this.isCompleting() &&
    !this.isAutoResolvingCombat() &&
    this.canUseAutoResolve(this.activeChallenge()),
  );
  readonly canAutoResolveCombatChallenge = computed(() =>
    this.canShowCombatAutoResolveAction() &&
    !this.isAutoResolvingCombat() &&
    !this.isCompleting() &&
    !this.isEnsuringCombatSession() &&
    !this.isLoadingCombatPreview() &&
    !this.isRecoveringCombatState() &&
    !this.isSubmittingCombatAction() &&
    !this.isCombatRunning(),
  );
  readonly challengeResultTitle = computed(() => {
    const result = this.currentChallengeResult();

    if (!result) {
      return '';
    }

    return result.success ? 'Challenge completed' : 'Challenge failed';
  });
  readonly challengeResultDescription = computed(() => {
    const result = this.currentChallengeResult();

    if (!result) {
      return '';
    }

    const mode = humanizeKey(result.completionMode, 'Challenge');

    return result.success
      ? `${mode} completion succeeded.`
      : `${mode} completion failed.`;
  });

  completeManually(success: boolean): void {
    this.completeCurrentChallenge('manual', success);
  }

  startCombat(): void {
    this.liveCombatState.startCombat();
  }

  submitCombatStrike(): void {
    this.liveCombatState.submitCombatStrike();
  }

  autoResolve(): void {
    const context = this.overview.currentContext();
    const challenge = this.activeChallenge();

    this.feedback.clear();

    if (!context || !challenge) {
      this.feedback.setError(null, 'Brak aktywnego wyzwania do automatycznego rozstrzygnięcia.');
      return;
    }

    if (challenge.minigameKey === ENCOUNTER_KIND.combat && !this.canUseAutoResolve(challenge)) {
      this.feedback.setError(
        null,
        'Wyzwanie bojowe wymaga ręcznej walki i nie może zostać automatycznie rozstrzygnięte z tej akcji.',
      );
      return;
    }

    if (
      !this.canUseAutoResolve(challenge)
    ) {
      this.feedback.setError(
        null,
        explorationChallengeActionBlocker(challenge)
          ?? 'Ten stan wyzwania nie ma teraz bezpiecznej akcji automatycznego rozstrzygnięcia.',
      );
      return;
    }

    const token = this.completionToken.next();

    this.isCompleting.set(true);
    this.explorations
      .autoResolveHeroExplorationChallengeAttempt({
        heroId: context.heroId,
        difficultyKey: context.difficultyKey,
        challengeAttemptId: challenge.id,
      })
      .pipe(
        finalize(() => {
          if (this.completionToken.isCurrent(token)) {
            this.isCompleting.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (workflow) => {
          if (!this.isCurrentCompletion(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.setCompletion(workflow.result, workflow.state.exploration?.id ?? null);
          this.rewardState.preferCompletedChallengeReward(
            workflow.state.exploration?.id ?? null,
            workflow.result.challengeAttemptId,
          );
          this.overview.setStateFromWorkflow(workflow.state);
          this.toast.show(
            'success',
            'Eksploracja',
            'Wyzwanie zostało automatycznie rozstrzygnięte.',
          );
        },
        error: (error: unknown) => {
          if (!this.isCurrentCompletion(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.feedback.setError(error, 'Nie udało się automatycznie rozstrzygnąć wyzwania.');
        },
      });
  }

  autoResolveCombat(): void {
    const context = this.overview.currentContext();
    const challenge = this.activeChallenge();

    this.feedback.clear();

    if (!context || !challenge) {
      this.feedback.setError(null, 'Brak aktywnej walki do automatycznego rozstrzygnięcia.');
      return;
    }

    if (!this.isExplorationCombatAutoResolvable(challenge)) {
      this.feedback.setError(null, 'Ta akcja dotyczy tylko walk eksploracji.');
      return;
    }

    if (!this.canAutoResolveCombatChallenge()) {
      this.feedback.setError(null, 'Walka ma już aktywną akcję lub nie może teraz zostać automatycznie rozstrzygnięta.');
      return;
    }

    const token = this.completionToken.next();

    this.isAutoResolvingCombat.set(true);
    this.explorations
      .autoResolveExplorationCombatChallengeAttempt({
        heroId: context.heroId,
        difficultyKey: context.difficultyKey,
        challengeAttemptId: challenge.id,
        requestId: explorationCombatRequestId(challenge.id, 'auto-resolve'),
      })
      .pipe(
        finalize(() => {
          if (this.completionToken.isCurrent(token)) {
            this.isAutoResolvingCombat.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (workflow) => {
          if (!this.isCurrentCompletion(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.setCompletion(workflow.result, workflow.state.exploration?.id ?? null);
          this.rewardState.preferCompletedChallengeReward(
            workflow.state.exploration?.id ?? null,
            workflow.result.challengeAttemptId,
          );
          this.liveCombatState.acceptAutoResolvedCombatCompletion(challenge, workflow.result);
          this.overview.setStateFromWorkflow(workflow.state);
          this.toast.show(
            'success',
            'Eksploracja',
            'Walka została automatycznie rozstrzygnięta.',
          );
        },
        error: (error: unknown) => {
          if (!this.isCurrentCompletion(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.feedback.setError(error, 'Nie udało się automatycznie rozstrzygnąć walki.');
        },
      });
  }

  participantHpLabel = this.liveCombatState.participantHpLabel.bind(this.liveCombatState);
  eventMetaLabel = this.liveCombatState.eventMetaLabel.bind(this.liveCombatState);
  timingManifestLabel = this.liveCombatState.timingManifestLabel.bind(this.liveCombatState);

  private completeCurrentChallenge(completionMode: string, success: boolean): void {
    const context = this.overview.currentContext();
    const challenge = this.activeChallenge();

    this.feedback.clear();

    if (!context || !challenge) {
      this.feedback.setError(null, 'Brak aktywnego wyzwania do ukończenia.');
      return;
    }

    const mode = explorationChallengeActionMode(challenge);

    if (mode !== EXPLORATION_CHALLENGE_ACTION_MODE.manualTrial) {
      this.feedback.setError(
        null,
        explorationChallengeActionBlocker(challenge, mode)
          ?? 'Ten stan wyzwania nie ma teraz bezpiecznej ręcznej akcji ukończenia.',
      );
      return;
    }

    const token = this.completionToken.next();

    this.isCompleting.set(true);
    this.explorations
      .completeHeroExplorationChallengeAttempt({
        heroId: context.heroId,
        difficultyKey: context.difficultyKey,
        challengeAttemptId: challenge.id,
        completionMode,
        success,
      })
      .pipe(
        finalize(() => {
          if (this.completionToken.isCurrent(token)) {
            this.isCompleting.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (workflow) => {
          if (!this.isCurrentCompletion(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.setCompletion(workflow.result, workflow.state.exploration?.id ?? null);
          this.rewardState.preferCompletedChallengeReward(
            workflow.state.exploration?.id ?? null,
            workflow.result.challengeAttemptId,
          );
          this.overview.setStateFromWorkflow(workflow.state);
          this.toast.show('success', 'Eksploracja', 'Wyzwanie zostało ukończone.');
        },
        error: (error: unknown) => {
          if (!this.isCurrentCompletion(token, context.heroId, context.difficultyKey, challenge.id)) {
            return;
          }

          this.feedback.setError(error, 'Nie udało się ukończyć wyzwania.');
        },
      });
  }

  private setCompletion(
    result: HeroExplorationChallengeCompletionReadModel,
    explorationId: string | null,
  ): void {
    this.lastCompletion.set({ result, explorationId });
  }

  acceptSandboxCompletion(
    result: HeroExplorationChallengeCompletionReadModel,
    explorationId: string | null,
  ): void {
    this.setCompletion(result, explorationId);
    this.rewardState.preferCompletedChallengeReward(
      explorationId,
      result.challengeAttemptId,
    );
  }

  private isCurrentCompletion(
    token: number,
    heroId: string,
    difficultyKey: string,
    challengeAttemptId: string,
  ): boolean {
    return (
      this.completionToken.isCurrent(token) &&
      this.overview.isCurrentContext(heroId, difficultyKey) &&
      this.activeChallenge()?.id === challengeAttemptId
    );
  }

  private title(challenge: HeroExplorationChallengeAttemptReadModel | null): string {
    if (!challenge) {
      return 'Brak aktywnego wyzwania.';
    }

    if (challenge.minigameKey === ENCOUNTER_KIND.combat) {
      if (challenge.trialDefinitionId) {
        return challenge.testedStatKey
          ? `Próba ujawniona: Walka (${this.statLabel(challenge.testedStatKey)})`
          : 'Próba bojowa rozpoczęta';
      }

      if (challenge.encounterDefinitionId) {
        return 'Spotkanie rozpoczęte: Zasadzka';
      }

      return 'Walka rozpoczęta';
    }

    return this.challengeKindLabel(challenge);
  }

  private facts(challenge: HeroExplorationChallengeAttemptReadModel | null): ChallengeFact[] {
    if (!challenge) {
      return [];
    }

    const facts: ChallengeFact[] = [
      { label: 'Rodzaj', value: this.challengeKindLabel(challenge) },
      { label: 'Stan', value: this.challengeStatusLabelText(challenge) },
    ];

    if (challenge.testedStatKey) {
      facts.push({ label: 'Cecha', value: this.statLabel(challenge.testedStatKey) });
    }

    facts.push({
      label: 'Szansa ujawnienia',
      value: this.chanceLabel(challenge.manifestationChance),
    });

    if (challenge.minigameKey === ENCOUNTER_KIND.combat || hasChallengeAutoResolveChance(challenge)) {
      facts.push({ label: 'Rozstrzygnięcie', value: this.autoResolveFactLabel(challenge) });
    }

    return facts;
  }

  private autoResolveText(
    challenge: HeroExplorationChallengeAttemptReadModel | null,
  ): string {
    if (challenge?.minigameKey === ENCOUNTER_KIND.combat && !this.canUseAutoResolve(challenge)) {
      return 'Wyzwanie bojowe wymaga ręcznej walki.';
    }

    if (!this.canUseAutoResolve(challenge)) {
      return explorationChallengeActionBlocker(challenge)
        ?? 'Ten stan wyzwania nie ma teraz bezpiecznej akcji automatycznego rozstrzygnięcia.';
    }

    if (!hasChallengeAutoResolveChance(challenge)) {
      return 'Automatyczne rozstrzygnięcie nie jest dostępne dla tej próby.';
    }

    const chance = challenge?.autoResolve?.chance ?? challenge?.autoResolveChance;
    const chanceLabel = chance === null || chance === undefined
      ? 'dostępną szansę'
      : this.chanceLabel(chance);

    return `Automatyczne rozstrzygnięcie użyje szansy sukcesu dla tego wyzwania: ${chanceLabel}.`;
  }

  private chanceLabel(chance: number | null): string {
    return chance === null ? 'Nieznana' : `około ${Math.round(chance)}%`;
  }

  private autoResolveFactLabel(
    challenge: HeroExplorationChallengeAttemptReadModel,
  ): string {
    if (challenge.minigameKey === ENCOUNTER_KIND.combat) {
      return 'Walka ręczna';
    }

    return this.chanceLabel(challenge.autoResolve?.chance ?? challenge.autoResolveChance);
  }

  private challengeStatusText(status: string): string {
    switch (status) {
      case 'pending':
      case 'awaiting_resolution':
      case 'active':
      case 'in_progress':
        return 'Oczekuje na rozstrzygnięcie';
      case 'completed':
        return 'Rozstrzygnięte';
      case 'failed':
        return 'Nieudane';
      default:
        return humanizeKey(status, 'Status');
    }
  }

  private challengeStatusLabelText(
    challenge: HeroExplorationChallengeAttemptReadModel,
  ): string {
    const metadata = jsonRecord(challenge.metadataJson);
    const details = jsonRecord(challenge.detailsJson);
    const label = optionalText(read(
      details,
      'statusLabel',
      'status_label',
      'playerStatusLabel',
      'player_status_label',
    )) ?? optionalText(read(
      metadata,
      'statusLabel',
      'status_label',
      'playerStatusLabel',
      'player_status_label',
    ));

    return this.polishChallengeStatus(label) ?? this.challengeStatusText(challenge.status);
  }

  private polishChallengeStatus(label: string | null): string | null {
    if (!label) {
      return null;
    }

    switch (label.trim().toLowerCase()) {
      case 'awaiting resolution':
      case 'awaiting_resolution':
      case 'pending':
      case 'active':
      case 'in progress':
      case 'in_progress':
        return 'Oczekuje na rozstrzygnięcie';
      case 'completed':
        return 'Rozstrzygnięte';
      case 'failed':
        return 'Nieudane';
      default:
        return label;
    }
  }

  private canUseAutoResolve(
    challenge: HeroExplorationChallengeAttemptReadModel | null,
  ): boolean {
    return Boolean(challenge?.trialDefinitionId) &&
      challenge?.minigameKey !== ENCOUNTER_KIND.combat &&
      hasChallengeAutoResolveChance(challenge);
  }

  private isExplorationCombatAutoResolvable(
    challenge: HeroExplorationChallengeAttemptReadModel | null,
  ): boolean {
    if (challenge?.minigameKey !== ENCOUNTER_KIND.combat) {
      return false;
    }

    if (challenge.challengeKind === 'trial') {
      return Boolean(challenge.trialDefinitionId);
    }

    return Boolean(challenge.encounterDefinitionId);
  }

  private challengeKindLabel(
    challenge: HeroExplorationChallengeAttemptReadModel,
  ): string {
    if (challenge.trialDefinitionId) {
      return 'Próba';
    }

    if (challenge.encounterDefinitionId) {
      return 'Spotkanie';
    }

    return humanizeKey(challenge.challengeKind, 'Wyzwanie');
  }

  private statLabel(statKey: string): string {
    switch (statKey) {
      case 'strength':
        return 'Siła';
      case 'agility':
        return 'Zręczność';
      case 'endurance':
        return 'Wytrzymałość';
      case 'intelligence':
        return 'Inteligencja';
      case 'luck':
        return 'Szczęście';
      default:
        return humanizeKey(statKey, 'Cecha');
    }
  }
}
