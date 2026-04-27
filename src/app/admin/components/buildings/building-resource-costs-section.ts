import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BUILDING_RESOURCE_TYPE_OPTIONS } from '../../../core/config/forms/buildings-form.config';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';

@Component({
  selector: 'app-building-resource-costs-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './building-resource-costs-section.html',
})
export class BuildingResourceCostsSection {
  readonly page = input.required<BuildingsPageFacade>();
  readonly resourceTypeOptions = [...BUILDING_RESOURCE_TYPE_OPTIONS];
}
