import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BUILDING_REQUIREMENT_TYPE_OPTIONS } from '../../../core/config/forms/buildings-form.config';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';

@Component({
  selector: 'app-building-requirements-section',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './building-requirements-section.html',
})
export class BuildingRequirementsSection {
  readonly page = input.required<BuildingsPageFacade>();
  readonly requirementTypeOptions = [...BUILDING_REQUIREMENT_TYPE_OPTIONS];

  readonly statOptions = () => [
    { label: 'Not used', value: null },
    ...this.page().adminData().stats.map((stat) => ({
      label: stat.label,
      value: stat.key,
    })),
  ];
}
