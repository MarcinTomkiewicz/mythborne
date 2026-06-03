import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { VICINITY_SELECTED_TARGET_FACT_ROWS } from '../../../../core/configs/vicinity.config';
import {
  VicinityListRow,
  VicinityRowActionKind,
} from '../../../../core/types/vicinity.types';

@Component({
  selector: 'app-vicinity-selected-target-panel',
  standalone: true,
  imports: [ButtonModule],
  host: { class: 'd-contents' },
  templateUrl: './vicinity-selected-target-panel.html',
})
export class VicinitySelectedTargetPanel {
  readonly selected = input<VicinityListRow | null>(null);
  readonly hasSelectedTarget = input(false);
  readonly isRelocating = input(false);
  readonly relocationError = input<string | null>(null);
  readonly relocationSuccess = input<string | null>(null);
  readonly factRows = computed(() => {
    const row = this.selected();

    if (!row) {
      return [];
    }

    const values = {
      target: row.occupantLabel || row.statusLabel,
      address: row.addressLabel,
      attackTravel: row.attackTravelDisplay,
      spyTravel: row.spyTravelDisplay,
      siege: 'Niezaimplementowane',
      protection: row.protectionDisplay,
    };

    return VICINITY_SELECTED_TARGET_FACT_ROWS
      .map((fact) => ({
        label: fact.label,
        value: values[fact.key],
      }))
      .filter((fact) => fact.value !== null);
  });
  readonly confirmRelocation = output<void>();
  readonly startAction = output<{
    row: VicinityListRow;
    actionKind: VicinityRowActionKind;
  }>();
}
