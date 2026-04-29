import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';
import { BuildingProgressionImpactCard } from './building-progression-impact-card';

@Component({
  selector: 'app-building-progression-range-preview-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    BuildingProgressionImpactCard,
  ],
  templateUrl: './building-progression-range-preview-section.html',
})
export class BuildingProgressionRangePreviewSection {
  readonly page = input.required<BuildingsPageFacade>();
}
