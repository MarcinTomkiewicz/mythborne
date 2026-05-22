import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ExplorationChallengeState } from '../../pages/exploration/exploration-challenge.state';

@Component({
  selector: 'app-exploration-challenge-auto-resolution-card',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './exploration-challenge-auto-resolution-card.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationChallengeAutoResolutionCard {
  readonly challenge = inject(ExplorationChallengeState);
}
