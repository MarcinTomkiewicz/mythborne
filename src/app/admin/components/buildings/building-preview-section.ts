import { Component, input } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';

@Component({
  selector: 'app-building-preview-section',
  standalone: true,
  imports: [InputTextModule],
  templateUrl: './building-preview-section.html',
})
export class BuildingPreviewSection {
  readonly page = input.required<BuildingsPageFacade>();
}
