import { Component, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BUILDING_RESOURCE_TYPE_OPTIONS } from '../../../core/config/forms/buildings-form.config';
import { REQUIREMENT_BOOLEAN_OPTIONS } from '../../../core/constants/requirement.const';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';
import { BuildingRequirementEditorRow } from './building-requirement-editor-row';

@Component({
  selector: 'app-building-requirements-section',
  standalone: true,
  imports: [ButtonModule, BuildingRequirementEditorRow],
  templateUrl: './building-requirements-section.html',
})
export class BuildingRequirementsSection {
  readonly page = input.required<BuildingsPageFacade>();

  readonly booleanOptions = [...REQUIREMENT_BOOLEAN_OPTIONS];
  readonly resourceOptions = [...BUILDING_RESOURCE_TYPE_OPTIONS];

  readonly statOptions = () => [
    { label: 'Select stat', value: null },
    ...this.page().adminData().stats.map((stat) => ({
      label: stat.label,
      value: stat.key,
    })),
  ];

  readonly districtOptions = () => [
    { label: 'Select district', value: null },
    ...this.page().adminData().districts.map((district) => ({
      label: `${district.name} (${district.code})`,
      value: district.code,
    })),
  ];

  readonly buildingOptions = () => [
    { label: 'Select building', value: null },
    ...this.page().adminData().buildings.map((building) => ({
      label: `${building.name} (${building.key})`,
      value: building.key,
    })),
  ];
}
