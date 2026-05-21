import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { ExplorationStepOutcomeKind } from '../../../core/domain/exploration/exploration-readiness.model';
import { ExplorationDirectionBoard } from './exploration-direction-board';
import { ExplorationPageState } from './exploration-page.state';
import { ExplorationSelectionDiagnosticsCard } from './exploration-selection-diagnostics-card';

@Component({
  selector: 'app-exploration-status-section',
  standalone: true,
  imports: [ButtonModule, GameBar, ExplorationDirectionBoard, ExplorationSelectionDiagnosticsCard],
  templateUrl: './exploration-status-section.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationStatusSection {
  readonly page = inject(ExplorationPageState);

  formatStepTime(value: string | null): string {
    if (!value) {
      return 'unknown';
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? 'unknown'
      : date.toLocaleString();
  }

  stepOutcomeLabel(outcomeKind: ExplorationStepOutcomeKind | string): string {
    switch (outcomeKind) {
      case 'nothing':
        return 'Nothing';
      case 'trial':
        return 'Trial';
      case 'encounter':
        return 'Encounter';
      default:
        return 'Outcome';
    }
  }
}
