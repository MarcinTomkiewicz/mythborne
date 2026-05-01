import { Component, inject } from '@angular/core';
import { ExplorationPageState } from './exploration-page.state';

@Component({
  selector: 'app-exploration-reward-card',
  standalone: true,
  templateUrl: './exploration-reward-card.html',
})
export class ExplorationRewardCard {
  readonly page = inject(ExplorationPageState);
}
