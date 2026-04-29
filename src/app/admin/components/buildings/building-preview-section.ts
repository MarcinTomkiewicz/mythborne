import { Component, input } from '@angular/core';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';
import { BuildingProgressionRangePreviewSection } from './building-progression-range-preview-section';
import { BuildingSingleLevelPreviewSection } from './building-single-level-preview-section';

@Component({
  selector: 'app-building-preview-section',
  standalone: true,
  imports: [BuildingSingleLevelPreviewSection, BuildingProgressionRangePreviewSection],
  templateUrl: './building-preview-section.html',
})
export class BuildingPreviewSection {
  readonly page = input.required<BuildingsPageFacade>();
}
