import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  CurrentEstateAddressReadModel,
  EstateAddressSelectionState,
  EstateDistrictCapacityReadModel,
  OccupiedEstateAddressReadModel,
} from '../../domain/estate/estate-address.model';
import { FilterOperator } from '../../enums/filter-operators';
import {
  buildEstateAddressSelectionState,
  mapCurrentEstateAddress,
  mapEstateDistrictCapacity,
  mapOccupiedEstateAddress,
} from '../../utils/estate-address';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import {
  EstateAddressDistrictRow,
  EstateDistrictCapacityRow,
  OccupiedEstateAddressRow,
} from '../../types/estate-address.types';

const DEFAULT_ADDRESS_PAGE_SIZE = 100;
const MAX_ADDRESS_PAGE_SIZE = 250;

@Injectable({ providedIn: 'root' })
export class EstateAddresses {
  private readonly backend = inject(Backend);
  private readonly activeHero = inject(ActiveHero);

  getDistrictCapacities(): Observable<EstateDistrictCapacityReadModel[]> {
    return this.backend
      .getAll<EstateDistrictCapacityRow>({
        table: TABLES.estate_district_address_capacities,
        filters: {
          isActive: { operator: FilterOperator.EQ, value: true },
        },
        orderBy: { column: 'sort_order' },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapEstateDistrictCapacity)));
  }

  getOccupiedAddresses(input: {
    serverId: string;
    districtCode?: string;
    offset?: number;
    limit?: number;
  }): Observable<OccupiedEstateAddressReadModel[]> {
    const offset = normalizeOffset(input.offset);
    const limit = normalizeLimit(input.limit);
    const filters = {
      serverId: { operator: FilterOperator.EQ, value: input.serverId },
    };

    return this.backend
      .getAll<OccupiedEstateAddressRow>({
        table: TABLES.estates,
        select: 'id, server_id, district_code, address_number',
        filters: input.districtCode
          ? {
              ...filters,
              districtCode: { operator: FilterOperator.EQ, value: input.districtCode },
            }
          : filters,
        orderBy: [
          { column: 'district_code' },
          { column: 'address_number' },
        ],
        range: { from: offset, to: offset + limit - 1 },
        camelCase: false,
      })
      .pipe(
        map((rows) =>
          rows
            .map(mapOccupiedEstateAddress)
            .filter((row): row is OccupiedEstateAddressReadModel => row !== null),
        ),
      );
  }

  getAddressSelectionState(input: {
    serverId: string;
    districtCode: string;
    offset?: number;
    limit?: number;
  }): Observable<EstateAddressSelectionState> {
    const offset = normalizeOffset(input.offset);
    const limit = normalizeLimit(input.limit);

    return this.getDistrictCapacities().pipe(
      switchMap((districts) => {
        const district = districts.find((entry) => entry.districtCode === input.districtCode);

        if (!district) {
          throw new Error(`Estate district "${input.districtCode}" is not active.`);
        }

        return this.getOccupiedAddressesForAddressRange({
          serverId: input.serverId,
          districtCode: district.districtCode,
          fromAddressNumber: offset + 1,
          toAddressNumber: Math.min(offset + limit, district.addressCapacity),
        }).pipe(
          map((occupiedAddresses) =>
            buildEstateAddressSelectionState({
              district,
              occupiedAddresses,
              offset,
              limit,
            }),
          ),
        );
      }),
    );
  }

  getActiveHeroCurrentAddress(): Observable<CurrentEstateAddressReadModel | null> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        context.heroRow.estate_id
          ? this.getCurrentAddress({
              estateId: context.heroRow.estate_id,
              heroId: context.heroId,
              serverId: context.serverId,
            })
          : of(null),
      ),
    );
  }

  getCurrentAddress(input: {
    estateId: string;
    heroId: string;
    serverId: string;
  }): Observable<CurrentEstateAddressReadModel | null> {
    return forkJoin({
      estates: this.backend.getAll<OccupiedEstateAddressRow>({
        table: TABLES.estates,
        select: 'id, server_id, district_code, address_number',
        filters: {
          id: { operator: FilterOperator.EQ, value: input.estateId },
          heroId: { operator: FilterOperator.EQ, value: input.heroId },
          serverId: { operator: FilterOperator.EQ, value: input.serverId },
        },
        range: { from: 0, to: 0 },
        camelCase: false,
      }),
      districts: this.backend.getAll<EstateAddressDistrictRow>({
        table: TABLES.estate_districts,
        orderBy: { column: 'rank' },
        camelCase: false,
      }),
    }).pipe(
      map(({ estates, districts }) => {
        const estate = estates[0];
        return estate ? mapCurrentEstateAddress(estate, districts) : null;
      }),
    );
  }

  private getOccupiedAddressesForAddressRange(input: {
    serverId: string;
    districtCode: string;
    fromAddressNumber: number;
    toAddressNumber: number;
  }): Observable<OccupiedEstateAddressReadModel[]> {
    if (input.fromAddressNumber > input.toAddressNumber) {
      return of([]);
    }

    return this.backend
      .getAll<OccupiedEstateAddressRow>({
        table: TABLES.estates,
        select: 'id, server_id, district_code, address_number',
        filters: {
          serverId: { operator: FilterOperator.EQ, value: input.serverId },
          districtCode: { operator: FilterOperator.EQ, value: input.districtCode },
          addressNumber: [
            { operator: FilterOperator.GTE, value: input.fromAddressNumber },
            { operator: FilterOperator.LTE, value: input.toAddressNumber },
          ],
        },
        orderBy: { column: 'address_number' },
        camelCase: false,
      })
      .pipe(
        map((rows) =>
          rows
            .map(mapOccupiedEstateAddress)
            .filter((row): row is OccupiedEstateAddressReadModel => row !== null),
        ),
      );
  }
}

function normalizeOffset(value = 0): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('Estate address offset must be a non-negative integer.');
  }

  return value;
}

function normalizeLimit(value = DEFAULT_ADDRESS_PAGE_SIZE): number {
  if (!Number.isInteger(value) || value < 1 || value > MAX_ADDRESS_PAGE_SIZE) {
    throw new Error(
      `Estate address limit must be an integer between 1 and ${MAX_ADDRESS_PAGE_SIZE}.`,
    );
  }

  return value;
}
