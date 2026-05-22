import { Component, inject } from '@angular/core';
import { ExplorationOutcomeReportLayout } from '../exploration-outcome-report-layout/exploration-outcome-report-layout';
import { ExplorationChallengeAutoResolutionCard } from '../exploration-challenge-auto-resolution-card/exploration-challenge-auto-resolution-card';
import { ExplorationChallengeDetailsCard } from '../exploration-challenge-details-card/exploration-challenge-details-card';
import { ExplorationChallengePendingRewardCard } from '../exploration-challenge-pending-reward-card/exploration-challenge-pending-reward-card';
import { ExplorationCombatResolutionCard } from '../exploration-combat-resolution-card/exploration-combat-resolution-card';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';

@Component({
  selector: 'app-exploration-active-challenge-report',
  standalone: true,
  imports: [
    ExplorationChallengeAutoResolutionCard,
    ExplorationChallengeDetailsCard,
    ExplorationChallengePendingRewardCard,
    ExplorationCombatResolutionCard,
    ExplorationOutcomeReportLayout,
  ],
  templateUrl: './exploration-active-challenge-report.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationActiveChallengeReport {
  readonly challenge = inject(ExplorationChallengeState);
}
