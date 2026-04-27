import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { BuildingsPageFacade } from '../../../core/services/buildings/building-admin-page.facade';

@Component({
  selector: 'app-building-local-formulas-section',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule],
  templateUrl: './building-local-formulas-section.html',
})
export class BuildingLocalFormulasSection {
  readonly page = input.required<BuildingsPageFacade>();

  formulaOptions(targetKey: string): { label: string; value: string | null }[] {
    return [
      { label: 'Use global default', value: null },
      ...this.page()
        .formulas.formulasFor(targetKey)
        .map((formula) => ({ label: formula.label, value: formula.id })),
    ];
  }
}
