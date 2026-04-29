import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';
import { BuildingBonusExplainabilityCard } from './building-bonus-explainability-card';

@Component({
  selector: 'app-building-bonuses-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    BuildingBonusExplainabilityCard,
  ],
  templateUrl: './building-bonuses-section.html',
})
export class BuildingBonusesSection {
  readonly page = input.required<BuildingsPageFacade>();
}
