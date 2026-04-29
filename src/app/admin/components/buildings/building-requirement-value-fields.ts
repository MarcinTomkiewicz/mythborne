import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import {
  REQUIREMENT_VALUE_TYPES,
} from '../../../core/constants/requirement.const';
import { BuildingRequirementDefinition } from '../../../core/domain/building/building.model';
import { BuildingCanonicalRequirementForm } from '../../../core/types/forms/building-admin-form.types';

interface SelectOption {
  label: string;
  value: string | boolean | null;
}

@Component({
  selector: 'app-building-requirement-value-fields',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, SelectModule],
  templateUrl: './building-requirement-value-fields.html',
})
export class BuildingRequirementValueFields {
  readonly requirementGroup = input.required<BuildingCanonicalRequirementForm>();
  readonly definition = input.required<BuildingRequirementDefinition | null>();
  readonly booleanOptions = input.required<SelectOption[]>();
  readonly statOptions = input.required<SelectOption[]>();
  readonly districtOptions = input.required<SelectOption[]>();
  readonly buildingOptions = input.required<SelectOption[]>();
  readonly resourceOptions = input.required<SelectOption[]>();
  readonly valueTypes: typeof REQUIREMENT_VALUE_TYPES = REQUIREMENT_VALUE_TYPES;
}
