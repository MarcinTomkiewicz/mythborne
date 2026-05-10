import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ExplorationChallengePanel } from './exploration-challenge-panel';
import { ExplorationChallengeResultCard } from './exploration-challenge-result-card';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationRewardCard } from './exploration-reward-card';
import { ExplorationSelectionDiagnosticsCard } from './exploration-selection-diagnostics-card';

@Component({
  selector: 'app-exploration-status-section',
  standalone: true,
  imports: [
    ButtonModule,
    ExplorationChallengePanel,
    ExplorationChallengeResultCard,
    ExplorationSelectionDiagnosticsCard,
    ExplorationRewardCard,
  ],
  templateUrl: './exploration-status-section.html',
})
export class ExplorationStatusSection {
  readonly page = inject(ExplorationPageState);
}
