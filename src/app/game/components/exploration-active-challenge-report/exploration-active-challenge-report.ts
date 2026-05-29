import { Component, computed, inject } from '@angular/core';
import { OutcomeReportLayout } from '../../../shared/outcome-report-layout/outcome-report-layout';
import { ExplorationChallengeDetailsCard } from '../exploration-challenge-details-card/exploration-challenge-details-card';
import { ExplorationChallengePendingRewardCard } from '../exploration-challenge-pending-reward-card/exploration-challenge-pending-reward-card';
import { MinigameHost } from '../minigame-host/minigame-host';
import {
  MINIGAME_SOURCE_ENTITY_TYPE,
  MinigameCompletionEvent,
  MinigameSourceRef,
} from '../minigame-host/minigame-host.model';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';
import { ExplorationMinigameHandoffState } from '../../pages/exploration/exploration-minigame-handoff.state';

@Component({
  selector: 'app-exploration-active-challenge-report',
  standalone: true,
  imports: [
    ExplorationChallengeDetailsCard,
    ExplorationChallengePendingRewardCard,
    OutcomeReportLayout,
    MinigameHost,
  ],
  templateUrl: './exploration-active-challenge-report.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationActiveChallengeReport {
  readonly challenge = inject(ExplorationChallengeState);
  private readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  readonly sourceRef = computed<MinigameSourceRef | null>(() => {
    const activeChallenge = this.challenge.activeChallenge();

    return activeChallenge
      ? {
          sourceEntityType: MINIGAME_SOURCE_ENTITY_TYPE.explorationChallengeAttempt,
          sourceEntityId: activeChallenge.id,
        }
      : null;
  });

  acceptMinigameCompletion(event: MinigameCompletionEvent): void {
    this.minigameHandoff.acceptMinigameCompletion(event);
  }
}
