import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import {
  normalizeVicinitySearch,
  parseVicinityAddressSearch,
} from '../utils/vicinity-search';
import { VicinityPageState } from './vicinity-page.state';
import { VicinityTargetCandidatesState } from './vicinity-target-candidates.state';

@Injectable()
export class VicinitySearchState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly page = inject(VicinityPageState);
  private readonly pvpTargets = inject(VicinityTargetCandidatesState);

  readonly selectedDistrictControl = new FormControl<string | null>(null);
  readonly pvpSearchControl = new FormControl<string>('', { nonNullable: true });
  readonly feedback = signal<string | null>(null);
  readonly districtOptions = computed(() =>
    this.page.districts().map((district) => ({
      label: `${district.label} (${district.districtCode})`,
      value: district.districtCode,
    })),
  );

  constructor() {
    this.bindControlsToState();
    this.syncControlsFromState();
  }

  applySearch(): void {
    const search = normalizeVicinitySearch(this.pvpSearchControl.value);
    const addressSearch = parseVicinityAddressSearch(search);

    this.pvpTargets.setSearch(search);

    if (!search) {
      this.feedback.set(null);
      return;
    }

    if (addressSearch) {
      this.applyAddressSearch(addressSearch);
      return;
    }

    this.pvpTargets.loadCandidates((candidates) => {
      if (normalizeVicinitySearch(this.pvpSearchControl.value) !== search) {
        return;
      }

      const target = candidates[0];

      if (!target) {
        this.feedback.set('Nie znaleziono bohatera dla tej frazy.');
        return;
      }

      this.feedback.set(null);
      this.page.focusAddress({
        districtCode: target.targetAddress.districtCode,
        addressNumber: target.targetAddress.addressNumber,
      });
      this.pvpTargets.setDistrictCode(target.targetAddress.districtCode);
    });
  }

  private applyAddressSearch(addressSearch: { districtCode: string; addressNumber: number }): void {
    const focused = this.page.focusAddress(addressSearch);

    if (!focused) {
      this.feedback.set('Nie znaleziono takiego adresu w aktywnych dzielnicach.');
      return;
    }

    this.feedback.set(null);
    this.pvpTargets.setDistrictCode(addressSearch.districtCode);
  }

  private bindControlsToState(): void {
    this.selectedDistrictControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value) {
          this.feedback.set(null);
          this.page.setSelectedDistrictCode(value);
          this.pvpTargets.setDistrictCode(value);
        }
      });
  }

  private syncControlsFromState(): void {
    effect(() => {
      this.syncDisabled(
        this.selectedDistrictControl,
        this.page.isLoading() || this.page.isRelocating(),
      );
    });

    effect(() => {
      const selectedDistrictCode = this.page.selectedDistrictCode();
      this.syncControl(this.selectedDistrictControl, selectedDistrictCode);

      if (selectedDistrictCode && this.pvpTargets.districtCode() !== selectedDistrictCode) {
        queueMicrotask(() => {
          if (
            this.page.selectedDistrictCode() === selectedDistrictCode
            && this.pvpTargets.districtCode() !== selectedDistrictCode
          ) {
            this.pvpTargets.setDistrictCode(selectedDistrictCode);
          }
        });
      }
    });
  }

  private syncControl<T>(control: FormControl<T>, value: T): void {
    if (control.value === value) {
      return;
    }

    control.setValue(value, { emitEvent: false });
  }

  private syncDisabled<T>(control: FormControl<T>, shouldDisable: boolean): void {
    if (shouldDisable && control.enabled) {
      control.disable({ emitEvent: false });
      return;
    }

    if (!shouldDisable && control.disabled) {
      control.enable({ emitEvent: false });
    }
  }
}
