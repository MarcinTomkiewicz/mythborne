import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExplorationChallengeRewardReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import type { ExplorationResultSourceKind } from '../../../core/domain/exploration/exploration-result-display.model';
import { ReportDetailV2 } from '../../../core/domain/reports/report.model';
import { HeroExplorationRewards } from '../../../core/services/exploration/hero-exploration-rewards';
import {
  explorationReportRewardDisplay,
  mapExplorationRewardText,
} from '../../../core/utils/exploration-result-display.mapper';
import { RequestToken } from '../../../core/utils/request-token';
import { rewardDisplay } from '../../pages/exploration/exploration-reward-card-ui';
import { ExplorationReportResultContent } from '../exploration-report-result-content/exploration-report-result-content';

@Component({
  selector: 'app-exploration-report-domain-content',
  standalone: true,
  imports: [
    ExplorationReportResultContent,
  ],
  templateUrl: './exploration-report-domain-content.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationReportDomainContent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly rewards = inject(HeroExplorationRewards);
  private readonly loadToken = new RequestToken();

  readonly detail = input.required<ReportDetailV2>();
  readonly reward = signal<ExplorationChallengeRewardReadModel | null>(null);
  readonly isLoadingReward = signal(false);

  readonly reportId = computed(() => this.detail().domainContextJson.gameReportId);
  readonly rewardDisplay = computed(() =>
    explorationReportRewardDisplay(this.rewardDisplaySource()),
  );
  readonly rewardText = computed(() =>
    mapExplorationRewardText({
      rewardRawJson: this.reward()?.rawJson,
      reportRawJson: null,
      sourceKind: this.sourceKind(),
    }),
  );

  constructor() {
    effect(() => {
      const detail = this.detail();
      const context = detail.domainContextJson;
      const exploration = context.exploration;

      this.loadToken.next();
      this.reward.set(null);
      this.isLoadingReward.set(false);

      if (
        !exploration ||
        !context.frontendUsage.canUsePrivateDomainReads ||
        context.frontendUsage.sourceIdsRedacted
      ) {
        return;
      }

      if (exploration.rewardSourceKind === 'challenge_attempt') {
        if (exploration.challengeAttemptId) {
          this.loadChallengeReward(exploration.challengeAttemptId);
        }
        return;
      }

      if (exploration.rewardSourceKind === 'step' && exploration.stepId) {
        this.loadStepReward(exploration.stepId);
      }
    });
  }

  private loadChallengeReward(challengeAttemptId: string): void {
    const token = this.loadToken.next();

    this.isLoadingReward.set(true);
    this.rewards.getChallengeReward({ challengeAttemptId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reward) => {
          if (this.loadToken.isCurrent(token)) {
            this.reward.set(reward);
            this.isLoadingReward.set(false);
          }
        },
        error: () => {
          if (this.loadToken.isCurrent(token)) {
            this.reward.set(null);
            this.isLoadingReward.set(false);
          }
        },
      });
  }

  private loadStepReward(stepId: string): void {
    const token = this.loadToken.next();

    this.isLoadingReward.set(true);
    this.rewards.getStepReward({ stepId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reward) => {
          if (this.loadToken.isCurrent(token)) {
            this.reward.set(reward);
            this.isLoadingReward.set(false);
          }
        },
        error: () => {
          if (this.loadToken.isCurrent(token)) {
            this.reward.set(null);
            this.isLoadingReward.set(false);
          }
        },
      });
  }

  private rewardDisplaySource() {
    return rewardDisplay(this.reward());
  }

  private sourceKind(): ExplorationResultSourceKind {
    const kind = this.detail().domainContextJson.contentKind;

    if (kind === 'exploration_trial') {
      return 'trial';
    }

    if (kind === 'exploration_combat_encounter' || kind === 'exploration_encounter') {
      return 'encounter';
    }

    return 'unknown';
  }
}
