import { Component, computed, inject } from '@angular/core';
import { ExplorationOutcomeReportLayout } from '../exploration-outcome-report-layout/exploration-outcome-report-layout';
import { ExplorationChallengeAutoResolutionCard } from '../exploration-challenge-auto-resolution-card/exploration-challenge-auto-resolution-card';
import { ExplorationChallengeDetailsCard } from '../exploration-challenge-details-card/exploration-challenge-details-card';
import { ExplorationChallengePendingRewardCard } from '../exploration-challenge-pending-reward-card/exploration-challenge-pending-reward-card';
import { CombatStage } from '../combat/combat-stage';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ActiveHeroPortraitState } from '../../../core/services/hero/active-hero-portrait.state';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';
import { combatActiveLogGroups } from '../../pages/exploration/exploration-live-combat-labels';
import { mapLiveCombatStageView } from '../../../core/utils/combat-stage-display.mapper';

@Component({
  selector: 'app-exploration-active-challenge-report',
  standalone: true,
  imports: [
    ExplorationChallengeAutoResolutionCard,
    ExplorationChallengeDetailsCard,
    ExplorationChallengePendingRewardCard,
    CombatStage,
    ExplorationOutcomeReportLayout,
  ],
  templateUrl: './exploration-active-challenge-report.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationActiveChallengeReport {
  readonly challenge = inject(ExplorationChallengeState);
  private readonly activeHero = inject(ActiveHero);
  private readonly activeHeroPortrait = inject(ActiveHeroPortraitState);
  readonly combatStageLabel = computed(() =>
    this.challenge.activeChallenge()?.trialDefinitionId
      ? 'Próba bojowa'
      : 'Zasadzka',
  );
  readonly combatLogGroups = computed(() =>
    combatActiveLogGroups(this.challenge.combatEvents(), this.challenge.combatParticipants()),
  );
  readonly combatStage = computed(() =>
    mapLiveCombatStageView({
      header: {
        label: this.combatStageLabel(),
        title: this.challenge.challengeTitle(),
        modeBadgeLabel: 'Walka ręczna',
        statusLabel: this.challenge.combatLiveState() ? this.challenge.combatStatusLabel() : null,
        roundLabel: this.challenge.combatLiveState() ? this.challenge.combatRoundLabel() : null,
        waitingLabel: 'Oczekuje na sesję',
      },
      ariaLabel: 'Ręczna walka',
      participants: this.challenge.combatParticipants(),
      activeHeroId: this.activeHero.state()?.heroId ?? null,
      activeHeroPortraitSrc: this.activeHeroPortrait.portraitSrc(),
      log: {
        groups: this.combatLogGroups(),
        show: this.challenge.combatLiveState() !== null,
        title: 'Przebieg starcia',
        emptyText: 'Przebieg starcia pojawi się po pierwszej akcji.',
      },
      previewStatus: this.challenge.combatResolutionPreview()?.previewStatus ?? null,
      liveStatusKey: this.challenge.combatLiveState()?.statusKey ?? null,
      timingManifest: this.challenge.combatTimingManifest(),
      currentActorName: this.challenge.currentCombatActor()?.displayName ?? null,
      timing: {
        isCombatRunning: this.challenge.isCombatRunning(),
        walkingPosition: this.challenge.walkingPosition(),
        hitWindow: this.challenge.combatHitWindow(),
        canSubmitStrike: this.challenge.canSubmitCombatStrike(),
      },
      loading: {
        previewFailed: this.challenge.combatResolutionPreviewFailed(),
        isLoadingPreview: this.challenge.isLoadingCombatPreview(),
        isSubmittingAction: this.challenge.isSubmittingCombatAction(),
        isPreparingSession: this.challenge.isEnsuringCombatSession(),
        isRecoveringState: this.challenge.isRecoveringCombatState(),
      },
      actions: {
        canShowStartAction: this.challenge.canShowCombatStartAction(),
        canStartAction: this.challenge.canStartCombat(),
        canShowTimingAction: this.challenge.canShowCombatTimingAction(),
        canShowAutoResolveAction: this.challenge.canShowCombatAutoResolveAction(),
        canAutoResolveAction: this.challenge.canAutoResolveCombatChallenge(),
        isAutoResolving: this.challenge.isAutoResolvingCombat(),
      },
    }),
  );

  handleCombatStageAction(actionId: string): void {
    switch (actionId) {
      case 'start-combat':
        this.challenge.startCombat();
        return;
      case 'auto-resolve':
        this.challenge.autoResolveCombat();
        return;
      default:
        return;
    }
  }

  submitCombatStrike(): void {
    this.challenge.submitCombatStrike();
  }
}
