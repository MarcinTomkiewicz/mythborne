import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { ExplorationSandboxTools } from '../../components/exploration-sandbox-tools/exploration-sandbox-tools';
import { ExplorationStepHandoffCard } from '../../components/exploration-step-handoff-card/exploration-step-handoff-card';
import { ExplorationChallengePanel } from './exploration-challenge-panel';
import { ExplorationDirectionBoard } from './exploration-direction-board';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationSelectionDiagnosticsCard } from './exploration-selection-diagnostics-card';

@Component({
  selector: 'app-exploration-status-section',
  standalone: true,
  imports: [
    ButtonModule,
    GameBar,
    ExplorationChallengePanel,
    ExplorationDirectionBoard,
    ExplorationSandboxTools,
    ExplorationSelectionDiagnosticsCard,
    ExplorationStepHandoffCard,
  ],
  templateUrl: './exploration-status-section.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationStatusSection {
  readonly page = inject(ExplorationPageState);

  formatStepTime(value: string | null): string {
    if (!value) {
      return 'nieznany czas';
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? 'nieznany czas'
      : date.toLocaleString();
  }
}
