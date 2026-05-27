import { Injectable, computed, inject } from '@angular/core';
import {
  explorationChallengeFacts,
  explorationChallengeStatusLabel,
  explorationChallengeTitle,
} from './exploration-challenge-display.mapper';
import { ExplorationOverviewState } from './exploration-overview.state';

@Injectable()
export class ExplorationChallengeState {
  private readonly overview = inject(ExplorationOverviewState);

  readonly activeChallenge = computed(() => this.overview.state()?.activeChallenge ?? null);
  readonly hasMinigameChallenge = computed(() =>
    Boolean(this.activeChallenge()?.minigameKey),
  );
  readonly challengeTitle = computed(() =>
    explorationChallengeTitle(this.activeChallenge()),
  );
  readonly challengeStatusLabel = computed(() =>
    explorationChallengeStatusLabel(this.activeChallenge()),
  );
  readonly challengeFacts = computed(() =>
    explorationChallengeFacts({
      challenge: this.activeChallenge(),
      statusLabel: this.challengeStatusLabel(),
    }),
  );
}
