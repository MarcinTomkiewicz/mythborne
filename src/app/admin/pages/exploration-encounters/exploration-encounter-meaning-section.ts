import { Component, inject } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';

@Component({
  selector: 'app-exploration-encounter-meaning-section',
  standalone: true,
  imports: [TagModule],
  templateUrl: './exploration-encounter-meaning-section.html',
})
export class ExplorationEncounterMeaningSection {
  readonly page = inject(ExplorationEncountersPageState);
}
