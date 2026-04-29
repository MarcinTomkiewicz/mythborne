import { Component, input } from '@angular/core';
import { REQUIREMENT_VALUE_TYPES } from '../../../core/constants/requirement.const';
import {
  BuildingDistrictOption,
  BuildingRequirementDefinition,
  BuildingRequirementDraft,
  BuildingStatOption,
  EditableBuilding,
} from '../../../core/domain/building/building.model';
import { BuildingCanonicalRequirementForm } from '../../../core/types/forms/building-admin-form.types';

@Component({
  selector: 'app-building-requirement-explainability-card',
  standalone: true,
  templateUrl: './building-requirement-explainability-card.html',
})
export class BuildingRequirementExplainabilityCard {
  readonly requirementGroup = input.required<BuildingCanonicalRequirementForm>();
  readonly definition = input<BuildingRequirementDefinition | null>(null);
  readonly stats = input.required<BuildingStatOption[]>();
  readonly districts = input.required<BuildingDistrictOption[]>();
  readonly buildings = input.required<EditableBuilding[]>();
  readonly valueTypes = REQUIREMENT_VALUE_TYPES;

  requirement(): BuildingRequirementDraft {
    return this.requirementGroup().getRawValue();
  }

  title(): string {
    return this.definition()?.label ?? 'Select requirement definition';
  }

  description(): string {
    const definition = this.definition();
    return definition?.adminDescription ?? definition?.helperText ?? definition?.description ?? '';
  }

  valueLabel(): string {
    const requirement = this.requirement();

    switch (this.definition()?.valueType) {
      case this.valueTypes.Integer:
        return this.present(requirement.requiredValueInteger);
      case this.valueTypes.Decimal:
        return this.present(requirement.requiredValueDecimal);
      case this.valueTypes.Boolean:
        return requirement.requiredValueBoolean ? 'Required' : 'Not required';
      case this.valueTypes.String:
      case this.valueTypes.EnumRef:
        return requirement.requiredValueText || 'No value selected';
      case this.valueTypes.StatKey:
        return `${this.statLabel(requirement.requiredStatKey)} >= ${this.present(
          requirement.requiredValueInteger,
        )}`;
      case this.valueTypes.BuildingKey:
        return `${this.buildingLabel(requirement.requiredBuildingKey)} level ${this.present(
          requirement.requiredValueInteger,
        )}`;
      case this.valueTypes.ResourceType:
        return `${this.resourceLabel(requirement.requiredResourceType)} ${this.present(
          requirement.requiredValueDecimal ?? requirement.requiredValueInteger,
        )}`;
      case this.valueTypes.DistrictCode:
        return this.districtLabel(requirement.requiredDistrictCode);
      default:
        return 'No definition selected';
    }
  }

  private statLabel(key: string | null): string {
    return this.stats().find((stat) => stat.key === key)?.label ?? key ?? 'No stat selected';
  }

  private buildingLabel(key: string | null): string {
    return (
      this.buildings().find((building) => building.key === key)?.name ??
      key ??
      'No building selected'
    );
  }

  private districtLabel(code: string | null): string {
    return (
      this.districts().find((district) => district.code === code)?.name ??
      code ??
      'No district selected'
    );
  }

  private resourceLabel(resource: string | null): string {
    return resource ?? 'No resource selected';
  }

  private present(value: number | string | null | undefined): string {
    return value === null || value === undefined || value === '' ? 'No value selected' : `${value}`;
  }
}
