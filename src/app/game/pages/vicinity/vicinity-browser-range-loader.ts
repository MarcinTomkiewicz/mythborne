import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { EstateAddresses } from '../../../core/services/estate/estate-addresses';
import {
  buildVicinityAddressRange,
  VICINITY_ADDRESS_RADIUS,
} from './vicinity-address-range';
import {
  findVicinityDistrict,
  VicinityBrowserRangeResult,
} from './vicinity-state-guards';

@Injectable({ providedIn: 'root' })
export class VicinityBrowserRangeLoader {
  private readonly estateAddresses = inject(EstateAddresses);

  load(options: {
    selectedDistrictCode: string | null;
    centerAddressNumber: number;
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
        const centerAddressNumber = options.useExistingSelection
          ? options.centerAddressNumber
          : currentAddress.districtCode === district.districtCode
            ? currentAddress.addressNumber
            : 1;
        const fromAddressNumber = Math.max(
          1,
          centerAddressNumber - VICINITY_ADDRESS_RADIUS,
        );
        const toAddressNumber = Math.min(
          district.addressCapacity,
          centerAddressNumber + VICINITY_ADDRESS_RADIUS,
        );

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
            centerAddressNumber,
            range: buildVicinityAddressRange({
              currentAddress,
              district,
              occupiedAddresses,
              centerAddressNumber,
            }),
          })),
        );
      }),
    );
  }
}
