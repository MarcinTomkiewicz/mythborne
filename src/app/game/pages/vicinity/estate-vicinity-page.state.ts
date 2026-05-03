import { computed, inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, switchMap } from 'rxjs';
import {
  CurrentEstateAddressReadModel,
  EmptyEstateAddressOption,
  EstateDistrictCapacityReadModel,
} from '../../../core/domain/estate/estate-address.model';
import { EstateAddresses } from '../../../core/services/estate/estate-addresses';
import { EstateRelocation } from '../../../core/services/estate/estate-relocation';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { getErrorMessage } from '../../../core/utils/error-message';
import {
  buildVicinityAddressRange,
  toEmptyAddressOption,
  VICINITY_ADDRESS_RADIUS,
  VicinityAddressRange,
  VicinityAddressRow,
} from './vicinity-address-range';

@Injectable()
export class EstateVicinityPageState {
  private readonly activeHero = inject(ActiveHero);
  private readonly estateAddresses = inject(EstateAddresses);
  private readonly estateRelocation = inject(EstateRelocation);

  readonly isLoading = signal(true);
  readonly isRelocating = signal(false);
  readonly error = signal<string | null>(null);
  readonly relocationError = signal<string | null>(null);
  readonly relocationSuccess = signal<string | null>(null);
  readonly currentAddress = signal<CurrentEstateAddressReadModel | null>(null);
  readonly vicinityRange = signal<VicinityAddressRange | null>(null);
  readonly selectedTarget = signal<EmptyEstateAddressOption | null>(null);
  readonly destructiveConfirmed = signal(false);

  readonly currentAddressLabel = computed(
    () => this.currentAddress()?.addressLabel ?? 'Unavailable',
  );
  readonly currentDistrictLabel = computed(() => {
    const address = this.currentAddress();
    if (!address) {
      return 'Unavailable';
    }

    return address.districtName
      ? `${address.districtName} (${address.districtCode})`
      : `District ${address.districtCode}`;
  });
  readonly rangeLabel = computed(() => this.vicinityRange()?.rangeLabel ?? null);
  readonly rows = computed(() => this.vicinityRange()?.rows ?? []);
  readonly selectedTargetLabel = computed(
    () => this.selectedTarget()?.addressLabel ?? 'None',
  );
  readonly canRelocate = computed(
    () => !!this.selectedTarget() && this.destructiveConfirmed() && !this.isRelocating(),
  );

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.relocationError.set(null);

    this.activeHero.requireActiveHero().pipe(
      switchMap(() => this.loadVicinityRange()),
    ).subscribe({
      next: ({ currentAddress, range }) => {
        this.vicinityRange.set(range);
        this.currentAddress.set(currentAddress);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(getErrorMessage(error, 'Failed to load vicinity addresses.'));
        this.vicinityRange.set(null);
        this.currentAddress.set(null);
        this.isLoading.set(false);
      },
    });
  }

  selectRow(row: VicinityAddressRow): void {
    const target = toEmptyAddressOption(row);

    if (!target) {
      return;
    }

    this.selectedTarget.set(target);
    this.destructiveConfirmed.set(false);
    this.relocationError.set(null);
    this.relocationSuccess.set(null);
  }

  setDestructiveConfirmed(value: boolean): void {
    this.destructiveConfirmed.set(value);
  }

  relocate(): void {
    const target = this.selectedTarget();

    if (!target || !this.destructiveConfirmed()) {
      this.relocationError.set('Choose an empty vicinity address and confirm the destructive reset.');
      return;
    }

    this.isRelocating.set(true);
    this.relocationError.set(null);
    this.relocationSuccess.set(null);

    this.estateRelocation.relocateActiveHeroEstate({
      districtCode: target.districtCode,
      addressNumber: target.addressNumber,
      confirmDestroyExistingEstate: true,
      reason: 'Player estate relocation from vicinity page.',
    }).pipe(
      switchMap((result) =>
        this.loadVicinityRange().pipe(
          map(({ currentAddress, range }) => {
            this.vicinityRange.set(range);
            this.currentAddress.set(currentAddress);
            return result;
          }),
        ),
      ),
    ).subscribe({
      next: (result) => {
        this.relocationSuccess.set(`Estate relocated to ${result.addressLabel}.`);
        this.selectedTarget.set(null);
        this.destructiveConfirmed.set(false);
        this.isRelocating.set(false);
      },
      error: (error: unknown) => {
        this.relocationError.set(getErrorMessage(error, 'Estate relocation failed.'));
        this.isRelocating.set(false);
      },
    });
  }

  private loadVicinityRange() {
    return forkJoin({
      currentAddress: this.estateAddresses.getActiveHeroCurrentAddress(),
      districts: this.estateAddresses.getDistrictCapacities(),
    }).pipe(
      switchMap(({ currentAddress, districts }) => {
        if (!currentAddress) {
          throw new Error('Active hero does not have an estate address.');
        }

        const district = findCurrentDistrict(districts, currentAddress);
        const fromAddressNumber = Math.max(
          1,
          currentAddress.addressNumber - VICINITY_ADDRESS_RADIUS,
        );
        const toAddressNumber = Math.min(
          district.addressCapacity,
          currentAddress.addressNumber + VICINITY_ADDRESS_RADIUS,
        );

        return this.estateAddresses.getOccupiedAddressesForAddressNumberRange({
          serverId: currentAddress.serverId,
          districtCode: currentAddress.districtCode,
          fromAddressNumber,
          toAddressNumber,
        }).pipe(
          map((occupiedAddresses) => ({
            currentAddress,
            range: buildVicinityAddressRange({
              currentAddress,
              district,
              occupiedAddresses,
            }),
          })),
        );
      }),
    );
  }
}

function findCurrentDistrict(
  districts: readonly EstateDistrictCapacityReadModel[],
  currentAddress: CurrentEstateAddressReadModel,
): EstateDistrictCapacityReadModel {
  const district = districts.find(
    (entry) => entry.districtCode === currentAddress.districtCode,
  );

  if (!district) {
    throw new Error(`Estate district "${currentAddress.districtCode}" is not active.`);
  }

  return district;
}
