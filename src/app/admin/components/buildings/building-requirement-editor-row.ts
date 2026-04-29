import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BuildingRequirementDefinition } from '../../../core/domain/building/building.model';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';
import { BuildingCanonicalRequirementForm } from '../../../core/types/forms/building-admin-form.types';
import { BuildingRequirementExplainabilityCard } from './building-requirement-explainability-card';
import { BuildingRequirementValueFields } from './building-requirement-value-fields';

interface SelectOption {
  label: string;
  value: string | boolean | null;
}

@Component({
  selector: 'app-building-requirement-editor-row',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    BuildingRequirementExplainabilityCard,
    BuildingRequirementValueFields,
  ],
  templateUrl: './building-requirement-editor-row.html',
})
export class BuildingRequirementEditorRow {
  readonly page = input.required<BuildingsPageFacade>();
  readonly index = input.required<number>();
  readonly requirementGroup = input.required<BuildingCanonicalRequirementForm>();
  readonly definition = input.required<BuildingRequirementDefinition | null>();
  readonly booleanOptions = input.required<SelectOption[]>();
  readonly statOptions = input.required<SelectOption[]>();
  readonly districtOptions = input.required<SelectOption[]>();
  readonly buildingOptions = input.required<SelectOption[]>();
  readonly resourceOptions = input.required<SelectOption[]>();
}
