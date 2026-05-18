import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-armory-bulk-actions-toolbar',
  standalone: true,
  imports: [ButtonModule],
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
      </div>
    </div>
  `,
})
export class ArmoryBulkActionsToolbar {
  readonly selectedCount = input(0);
  readonly drachmaValue = input(0);
  readonly canSell = input(false);
  readonly isActionBusy = input(false);
  readonly equipSelected = output<void>();
  readonly sellSelected = output<void>();
  readonly equipDisabled = computed(() =>
    this.isActionBusy() || this.selectedCount() === 0,
  );
  readonly sellDisabled = computed(() =>
    this.isActionBusy() || !this.canSell(),
  );
}
