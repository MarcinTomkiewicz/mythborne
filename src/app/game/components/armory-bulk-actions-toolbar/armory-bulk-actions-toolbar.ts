import { Component, computed, effect, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SelectOption } from '../../../core/types/select-option.types';

@Component({
  selector: 'app-armory-bulk-actions-toolbar',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, SelectModule],
  template: `
    <div class="mg-card p-md flex-row-between-center flex-col-sm gap-md">
      <div class="flex-col gap-xs min-w-0">
        @if (selectedCount() > 0) {
          <div class="flex-row-start-center flex-wrap gap-xs">
            <strong class="color-heading text-sm">
              {{ selectedCount() }} selected
            </strong>
            <span class="color-muted text-xs">&middot;</span>
            <strong class="color-heading text-xs">
              {{ drachmaValue() }} drachma
            </strong>
          </div>
        } @else {
          <strong class="color-muted text-sm">No items selected</strong>
        }
      </div>

      <div class="flex-row-start-center flex-wrap gap-sm">
        @if (isActionBusy()) {
          <span class="tag-badge tag-badge--warn">Action busy</span>
        }
        <p-button
          type="button"
          severity="secondary"
          size="small"
          icon="pi pi-equip"
          label="Equip selected"
          [disabled]="equipDisabled()"
          (onClick)="equipSelected.emit()"
        />
        <p-button
          type="button"
          severity="secondary"
          size="small"
          icon="pi pi-sold"
          label="Sell selected"
          [disabled]="sellDisabled()"
          (onClick)="sellSelected.emit()"
        />
        @if (selectedCount() > 0) {
          <div class="flex-row-start-center flex-wrap gap-xs">
            <p-select
              class="min-w-160"
              [formControl]="moveTargetControl"
              [options]="moveSelectOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Move to stand"
              ariaLabel="Move selected item to stand"
              [disabled]="moveSelectDisabled()"
            />
            <p-button
              type="button"
              severity="secondary"
              size="small"
              icon="pi pi-arrow-right-arrow-left"
              label="Move selected"
              [disabled]="moveDisabled()"
              (onClick)="emitMoveSelected()"
            />
          </div>
        }
      </div>
    </div>
  `,
})
export class ArmoryBulkActionsToolbar {
  readonly selectedCount = input(0);
  readonly drachmaValue = input(0);
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
    this.isActionBusy() || this.selectedCount() === 0,
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
  private readonly syncMoveTarget = effect(() => {
    const targetShelfPosition = this.moveTargetValue();

    if (
      targetShelfPosition !== null
      && !this.moveDestinationOptions()
        .some((option) => option.value === targetShelfPosition)
    ) {
      this.moveTargetControl.setValue(null);
    }
  });

  emitMoveSelected(): void {
    const targetShelfPosition = this.moveTargetValue();

    if (targetShelfPosition === null || this.moveDisabled()) {
      return;
    }

    this.moveSelected.emit(targetShelfPosition);
    this.moveTargetControl.setValue(null);
  }
}
