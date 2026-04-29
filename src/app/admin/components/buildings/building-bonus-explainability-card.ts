import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BuildingBonusForm } from '../../../core/types/forms/building-admin-form.types';
import { BuildingBonusTemplateMetadata } from '../../../core/domain/building/building.model';
import {
  toBuildingBonusLabel,
  toBuildingBonusValue,
} from '../../../core/utils/building-display';

@Component({
  selector: 'app-building-bonus-explainability-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './building-bonus-explainability-card.html',
})
export class BuildingBonusExplainabilityCard {
  readonly bonusGroup = input.required<BuildingBonusForm>();
  readonly templates = input.required<BuildingBonusTemplateMetadata[]>();

  selectedTemplate(): BuildingBonusTemplateMetadata | null {
    const templateId = this.bonusGroup().controls.templateId.value;
    return this.templates().find((template) => template.id === templateId) ?? null;
  }

  targetLabel(target: string): string {
    return toBuildingBonusLabel(target);
  }

  bonusValue(value: number, type: BuildingBonusTemplateMetadata['type']): string {
    return toBuildingBonusValue(value, type);
  }
}
