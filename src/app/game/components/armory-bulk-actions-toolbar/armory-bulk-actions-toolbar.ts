import { Component, computed, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ArmoryBulkActionsToolbarState } from '../../../core/interfaces/item/armory-bulk-actions-toolbar-state.interface';

@Component({
  selector: 'app-armory-bulk-actions-toolbar',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, SelectModule],
  templateUrl: './armory-bulk-actions-toolbar.html',
})
export class ArmoryBulkActionsToolbar {
  readonly state = input.required<ArmoryBulkActionsToolbarState>();
  readonly equipSelected = output<void>();
  readonly sellSelected = output<void>();
  readonly moveSelected = output<number>();
  readonly moveTargetControl = new FormControl<number | null>(null);
  private readonly moveTargetValue = toSignal(this.moveTargetControl.valueChanges, {
    initialValue: this.moveTargetControl.value,
  });
  readonly moveSelectOptions = computed(() => [
    ...this.state().moveDestinationOptions,
  ]);
  readonly equipDisabled = computed(() =>
    this.state().isActionBusy || !this.state().canEquip,
  );
  readonly sellDisabled = computed(() =>
    this.state().isActionBusy || !this.state().canSell,
  );
  readonly moveSelectDisabled = computed(() =>
    this.state().isActionBusy
    || !this.state().canMove
    || this.state().moveDestinationOptions.length === 0,
  );
  readonly hasSelectedMoveTarget = computed(() => {
    const targetShelfPosition = this.moveTargetValue();

    return targetShelfPosition !== null
      && this.state().moveDestinationOptions
        .some((option) => option.value === targetShelfPosition);
  });
  readonly moveDisabled = computed(() =>
    this.moveSelectDisabled() || !this.hasSelectedMoveTarget(),
  );

  emitMoveSelected(): void {
    const targetShelfPosition = this.moveTargetValue();

    if (
      targetShelfPosition === null
      || this.moveDisabled()
    ) {
      return;
    }

    this.moveSelected.emit(targetShelfPosition);
    this.moveTargetControl.setValue(null);
  }
}
