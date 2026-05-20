import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { GameBar } from '../../../shared/game-bar/game-bar';
import { ExplorationPageState } from './exploration-page.state';

@Component({
  selector: 'app-exploration-status-section',
  standalone: true,
  imports: [ButtonModule, GameBar],
  templateUrl: './exploration-status-section.html',
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
}
