import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { VICINITY_ADDRESS_PAGE_SIZE } from '../../../../core/configs/vicinity.config';
import { EstateAddresses } from '../../../../core/services/estate/estate-addresses';
import {
  buildVicinityAddressRange,
  calculateVicinityAddressBounds,
} from '../utils/vicinity-address-range';
import type { VicinityBrowserRangeResult } from '../../../../core/types/vicinity.types';
import { findVicinityDistrict } from '../utils/vicinity-state-guards';

@Injectable({ providedIn: 'root' })
export class VicinityBrowserRangeLoader {
  private readonly estateAddresses = inject(EstateAddresses);

  load(options: {
    selectedDistrictCode: string | null;
    focusAddressNumber: number;
    useExistingSelection?: boolean;
  }): Observable<VicinityBrowserRangeResult> {
    return forkJoin({
      currentAddress: this.estateAddresses.getActiveHeroCurrentAddress(),
      districts: this.estateAddresses.getDistrictCapacities(),
    }).pipe(
      switchMap(({ currentAddress, districts }) => {
        if (!currentAddress) {
          throw new Error('Active hero does not have an estate address.');
        }

        const selectedDistrictCode = options.useExistingSelection
          ? options.selectedDistrictCode
          : options.selectedDistrictCode ?? currentAddress.districtCode;
        const district = findVicinityDistrict(districts, selectedDistrictCode);
        const focusAddressNumber = options.useExistingSelection
          ? options.focusAddressNumber
          : currentAddress.districtCode === district.districtCode
            ? toAddressPageFocusAddressNumber(
                currentAddress.addressNumber,
                district.addressCapacity,
              )
            : 1;
        const { fromAddressNumber, toAddressNumber } = calculateVicinityAddressBounds({
          focusAddressNumber,
          addressCapacity: district.addressCapacity,
        });

        return this.estateAddresses.getOccupiedAddressesForAddressNumberRange({
          serverId: currentAddress.serverId,
          districtCode: district.districtCode,
          fromAddressNumber,
          toAddressNumber,
        }).pipe(
          map((occupiedAddresses) => ({
            currentAddress,
            districts: [...districts],
            selectedDistrictCode: district.districtCode,
            focusAddressNumber,
            range: buildVicinityAddressRange({
              currentAddress,
              district,
              occupiedAddresses,
              focusAddressNumber,
            }),
          })),
        );
      }),
    );
  }
}

function toAddressPageFocusAddressNumber(
  addressNumber: number,
  addressCapacity: number,
): number {
  const rawPageStart =
    Math.floor((addressNumber - 1) / VICINITY_ADDRESS_PAGE_SIZE)
    * VICINITY_ADDRESS_PAGE_SIZE
    + 1;
  const maxPageStart = Math.max(1, addressCapacity - VICINITY_ADDRESS_PAGE_SIZE + 1);
  const pageStart = Math.min(Math.max(1, rawPageStart), maxPageStart);

  return Math.min(
    addressCapacity,
    pageStart + Math.floor((VICINITY_ADDRESS_PAGE_SIZE - 1) / 2),
  );
}
