import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  CombatSurfaceAction,
  CombatSurfaceActionId,
} from '../../../core/domain/combat/combat-display.model';

@Component({
  selector: 'app-combat-center-action-button',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <p-button
      type="button"
      [label]="action().label"
      [loading]="action().loading === true"
      [disabled]="action().disabled === true"
      [severity]="action().severity ?? undefined"
      [text]="action().text === true"
      (onClick)="selected.emit(action().id)"
    />
  `,
})
export class CombatCenterActionButton {
  readonly action = input.required<CombatSurfaceAction>();
  readonly selected = output<CombatSurfaceActionId>();
}
