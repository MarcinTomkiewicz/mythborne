import { Component, inject } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { CollapsedJsonPreview } from '../../../shared/json-preview/collapsed-json-preview';
import { ExplorationLabPageState } from './exploration-lab-page.state';

@Component({
  selector: 'app-exploration-lab-luck-surface-section',
  standalone: true,
  imports: [
    TagModule,
    TableModule,
    CollapsedJsonPreview,
  ],
  templateUrl: './exploration-lab-luck-surface-section.html',
})
export class ExplorationLabLuckSurfaceSection {
  readonly page = inject(ExplorationLabPageState);
}
