import { computed, inject, Injectable, signal } from '@angular/core';
import { EmptyEstateAddressOption } from '../../../../core/domain/estate/estate-address.model';
import { VicinityAddressRow } from '../../../../core/types/vicinity.types';
import { EstateRelocationRunner } from '../../../workflows/estate-relocation/estate-relocation-runner';
import { toEmptyAddressOption } from '../utils/vicinity-address-range';

@Injectable()
export class VicinityRelocationState {
  private readonly relocationRunner = inject(EstateRelocationRunner);

  readonly isRelocating = signal(false);
  readonly relocationError = signal<string | null>(null);
  readonly relocationSuccess = signal<string | null>(null);
  readonly selectedTarget = signal<EmptyEstateAddressOption | null>(null);
  readonly destructiveConfirmed = signal(false);
  readonly canRelocate = computed(
    () => !!this.selectedTarget() && this.destructiveConfirmed() && !this.isRelocating(),
  );

  selectRow(row: VicinityAddressRow): void {
    if (this.isRelocating()) {
      return;
    }

    const target = toEmptyAddressOption(row);

    if (!target) {
      return;
    }

    this.selectedTarget.set(target);
    this.destructiveConfirmed.set(false);
    this.relocationError.set(null);
    this.relocationSuccess.set(null);
  }

  clearSelection(): void {
    this.selectedTarget.set(null);
    this.destructiveConfirmed.set(false);
  }

  setDestructiveConfirmed(value: boolean): void {
    if (this.isRelocating()) {
      return;
    }

    this.destructiveConfirmed.set(value);
  }

  relocate(input: { onSuccess: () => void }): void {
    this.relocationRunner.relocate({
      target: this.selectedTarget(),
      destructiveConfirmed: this.destructiveConfirmed(),
      currentTarget: () => this.selectedTarget(),
      onSuccess: input.onSuccess,
      setIsRelocating: (value) => this.isRelocating.set(value),
      setRelocationError: (value) => this.relocationError.set(value),
      setRelocationSuccess: (value) => this.relocationSuccess.set(value),
      setSelectedTarget: (value) => this.selectedTarget.set(value),
      setDestructiveConfirmed: (value) => this.destructiveConfirmed.set(value),
    });
  }
}
