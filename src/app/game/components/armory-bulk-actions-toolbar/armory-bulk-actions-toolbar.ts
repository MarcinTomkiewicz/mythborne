import { Component, computed, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SelectOption } from '../../../core/types/select-option.types';

@Component({
  selector: 'app-armory-bulk-actions-toolbar',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, SelectModule],
  templateUrl: './armory-bulk-actions-toolbar.html',
})
export class ArmoryBulkActionsToolbar {
  readonly selectedCount = input(0);
  readonly drachmaValue = input(0);
  readonly selectedCountLabel = input.required<string>();
  readonly selectedValueLabel = input.required<string>();
  readonly actionBusyLabel = input.required<string>();
  readonly equipLabel = input.required<string>();
  readonly sellLabel = input.required<string>();
  readonly moveTargetPlaceholder = input.required<string>();
  readonly moveSelectedLabel = input.required<string>();
  readonly canEquip = input(false);
  readonly canSell = input(false);
  readonly canMove = input(false);
  readonly moveDestinationOptions = input<readonly SelectOption<number>[]>([]);
  readonly isActionBusy = input(false);
  readonly equipSelected = output<void>();
  readonly sellSelected = output<void>();
  readonly moveSelected = output<number>();
  readonly moveTargetControl = new FormControl<number | null>(null);
  private readonly moveTargetValue = toSignal(this.moveTargetControl.valueChanges, {
    initialValue: this.moveTargetControl.value,
  });
  readonly moveSelectOptions = computed(() => [...this.moveDestinationOptions()]);
  readonly equipDisabled = computed(() =>
    this.isActionBusy() || !this.canEquip(),
  );
  readonly sellDisabled = computed(() =>
    this.isActionBusy() || !this.canSell(),
  );
  readonly moveSelectDisabled = computed(() =>
    this.isActionBusy()
    || !this.canMove()
    || this.moveDestinationOptions().length === 0,
  );
  readonly moveDisabled = computed(() =>
    this.moveSelectDisabled() || this.moveTargetValue() === null,
  );

  emitMoveSelected(): void {
    const targetShelfPosition = this.moveTargetValue();

    if (
      targetShelfPosition === null
      || this.moveDisabled()
      || !this.moveDestinationOptions()
        .some((option) => option.value === targetShelfPosition)
    ) {
      return;
    }

    this.moveSelected.emit(targetShelfPosition);
    this.moveTargetControl.setValue(null);
  }
}
