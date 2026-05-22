import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { WalkingDeadMeter } from '../../components/combat/walking-dead-meter';
import { ExplorationPageState } from './exploration-page.state';

@Component({
  selector: 'app-exploration-challenge-panel',
  standalone: true,
  imports: [ButtonModule, WalkingDeadMeter],
  templateUrl: './exploration-challenge-panel.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationChallengePanel {
  readonly page = inject(ExplorationPageState);
}
