import { Component, input } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';

@Component({
  selector: 'app-building-single-level-preview-section',
  standalone: true,
  imports: [InputTextModule],
  templateUrl: './building-single-level-preview-section.html',
})
export class BuildingSingleLevelPreviewSection {
  readonly page = input.required<BuildingsPageFacade>();
}
