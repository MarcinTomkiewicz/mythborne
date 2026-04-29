import { Component, input } from '@angular/core';
import {
  BuildingStatOption,
  EditableBuildingRequirement,
} from '../../../core/domain/building/building.model';
import { BuildingRequirementForm } from '../../../core/types/forms/building-admin-form.types';
import {
  toBuildingRequirementSummary,
  toBuildingRequirementTypeLabel,
} from '../../../core/utils/building-display';

@Component({
  selector: 'app-building-requirement-explainability-card',
  standalone: true,
  templateUrl: './building-requirement-explainability-card.html',
})
export class BuildingRequirementExplainabilityCard {
  readonly requirementGroup = input.required<BuildingRequirementForm>();
  readonly stats = input.required<BuildingStatOption[]>();

  requirement(): EditableBuildingRequirement {
    return this.requirementGroup().getRawValue();
  }

  typeLabel(): string {
    return toBuildingRequirementTypeLabel(this.requirement().type);
  }

  summary(): string {
    return toBuildingRequirementSummary(this.requirement(), this.stats());
  }

  statLabel(): string {
    const requirement = this.requirement();
    return (
      this.stats().find((stat) => stat.key === requirement.statKey)?.label ??
      requirement.statKey ??
      'No stat selected'
    );
  }
}
