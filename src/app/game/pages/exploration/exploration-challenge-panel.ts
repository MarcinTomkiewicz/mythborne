import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ExplorationPageState } from './exploration-page.state';

@Component({
  selector: 'app-exploration-challenge-panel',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './exploration-challenge-panel.html',
})
export class ExplorationChallengePanel {
  readonly page = inject(ExplorationPageState);
}
