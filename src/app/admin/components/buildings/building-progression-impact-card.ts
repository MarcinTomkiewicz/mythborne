import { Component, input } from '@angular/core';
import { BuildingProgressionImpactRow } from '../../../core/services/buildings/building-formula-preview-calculator';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';

@Component({
  selector: 'app-building-progression-impact-card',
  standalone: true,
  templateUrl: './building-progression-impact-card.html',
})
export class BuildingProgressionImpactCard {
  readonly page = input.required<BuildingsPageFacade>();
  readonly row = input.required<BuildingProgressionImpactRow>();
}
