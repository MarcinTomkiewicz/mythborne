import { Component, inject } from '@angular/core';
import { ExplorationActiveChallengeReport } from '../../components/exploration-active-challenge-report/exploration-active-challenge-report';
import { ExplorationResultReport } from '../../components/exploration-result-report/exploration-result-report';
import { ExplorationStepHandoffCard } from '../../components/exploration-step-handoff-card/exploration-step-handoff-card';
import { PendingTimerOracle } from '../../../shared/pending-timer-oracle/pending-timer-oracle';
import { ExplorationChallengeState } from './exploration-challenge.state';
import { ExplorationMinigameHandoffState } from './exploration-minigame-handoff.state';
import { ExplorationOverviewState } from './exploration-overview.state';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationSandboxToolState } from './exploration-sandbox-tool.state';
import { ExplorationStepState } from './exploration-step.state';

@Component({
  selector: 'app-exploration-runtime-primary-surface',
  standalone: true,
  imports: [
    ExplorationActiveChallengeReport,
    ExplorationResultReport,
    ExplorationStepHandoffCard,
    PendingTimerOracle,
  ],
  templateUrl: './exploration-runtime-primary-surface.html',
  host: { class: 'd-contents' },
})
export class ExplorationRuntimePrimarySurface {
  readonly challenge = inject(ExplorationChallengeState);
  readonly minigameHandoff = inject(ExplorationMinigameHandoffState);
  readonly overview = inject(ExplorationOverviewState);
  readonly page = inject(ExplorationPageState);
  readonly sandbox = inject(ExplorationSandboxToolState);
  readonly step = inject(ExplorationStepState);
}
