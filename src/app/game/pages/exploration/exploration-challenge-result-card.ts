import { Component, inject } from '@angular/core';
import { ExplorationPageState } from './exploration-page.state';

@Component({
  selector: 'app-exploration-challenge-result-card',
  standalone: true,
  templateUrl: './exploration-challenge-result-card.html',
})
export class ExplorationChallengeResultCard {
  readonly page = inject(ExplorationPageState);
}
