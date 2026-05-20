import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ExplorationPageState } from './exploration-page.state';

@Component({
  selector: 'app-exploration-status-section',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './exploration-status-section.html',
})
export class ExplorationStatusSection {
  readonly page = inject(ExplorationPageState);
}
