import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import {
  EstateAddressDistrictRow,
  EstateDistrictCapacityRow,
  OccupiedEstateAddressRow,
} from '../../types/estate-address.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { EstateAddresses } from './estate-addresses';

describe('EstateAddresses', () => {
  let service: EstateAddresses;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let backendGetAll: jasmine.Spy<(opts: Parameters<Backend['getAll']>[0]) => Observable<unknown[]>>;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', ['requireActiveHero']);
    backendGetAll = jasmine.createSpy('getAll');

    activeHero.requireActiveHero.and.returnValue(
      of({
        heroRow: { estate_id: 'estate-current' } as never,
        heroId: 'hero-1',
        hero: {} as never,
        userId: 'user-1',
        serverId: 'server-1',
        server: {} as never,
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        EstateAddresses,
        { provide: ActiveHero, useValue: activeHero },
        {
          provide: Backend,
          useValue: {
            getAll: <T extends object>(opts: Parameters<Backend['getAll']>[0]) =>
              backendGetAll(opts) as Observable<T[]>,
          } satisfies Pick<Backend, 'getAll'>,
        },
      ],
    });
    service = TestBed.inject(EstateAddresses);
  });

  it('loads active district capacities from the DB-backed table', async () => {
    backendGetAll.and.returnValue(of([capacityRow('A', 5000)]));

    const result = await firstValueFrom(service.getDistrictCapacities());

    expect(backendGetAll).toHaveBeenCalledWith({
      table: TABLES.estate_district_address_capacities,
      filters: {
        isActive: { operator: FilterOperator.EQ, value: true },
      },
      orderBy: { column: 'sort_order' },
      camelCase: false,
    });
    expect(result[0]).toEqual(jasmine.objectContaining({
      districtCode: 'A',
      addressCapacity: 5000,
    }));
  });

  it('generates paged empty address options and overlays occupied addresses', async () => {
    backendGetAll.and.callFake((opts) => {
      if (opts.table === TABLES.estate_district_address_capacities) {
        return of([capacityRow('A', 5000)]);
      }

      if (opts.table === TABLES.estates) {
        return of([estateRow('estate-2', 'server-1', 'A', 2)]);
      }

      return of([]);
    });

    const result = await firstValueFrom(
      service.getAddressSelectionState({
        serverId: 'server-1',
        districtCode: 'A',
        offset: 0,
        limit: 5,
      }),
    );

    expect(backendGetAll.calls.mostRecent().args[0]).toEqual({
      table: TABLES.estates,
      select: 'id, server_id, district_code, address_number',
      filters: {
        serverId: { operator: FilterOperator.EQ, value: 'server-1' },
        districtCode: { operator: FilterOperator.EQ, value: 'A' },
        addressNumber: [
          { operator: FilterOperator.GTE, value: 1 },
          { operator: FilterOperator.LTE, value: 5 },
        ],
      },
      orderBy: { column: 'address_number' },
      camelCase: false,
    });
    expect(result.addressOptions.map((entry) => entry.addressLabel)).toEqual([
      'A-1',
      'A-2',
      'A-3',
      'A-4',
      'A-5',
    ]);
    expect(result.addressOptions[1]).toEqual(jasmine.objectContaining({
      isOccupied: true,
      estateId: 'estate-2',
    }));
    expect(result.emptyAddressOptions.map((entry) => entry.addressLabel)).toEqual([
      'A-1',
      'A-3',
      'A-4',
      'A-5',
    ]);
  });

  it('can list occupied addresses for the whole server without a district filter', async () => {
    backendGetAll.and.returnValue(of([
      estateRow('estate-a-1', 'server-1', 'A', 1),
      estateRow('estate-b-2', 'server-1', 'B', 2),
    ]));

    const result = await firstValueFrom(
      service.getOccupiedAddresses({
        serverId: 'server-1',
        offset: 0,
        limit: 10,
      }),
    );

    expect(backendGetAll).toHaveBeenCalledWith({
      table: TABLES.estates,
      select: 'id, server_id, district_code, address_number',
      filters: {
        serverId: { operator: FilterOperator.EQ, value: 'server-1' },
      },
      orderBy: [
        { column: 'district_code' },
        { column: 'address_number' },
      ],
      range: { from: 0, to: 9 },
      camelCase: false,
    });
    expect(result.map((entry) => entry.addressLabel)).toEqual(['A-1', 'B-2']);
  });

  it('loads the active hero current address from source-of-truth fields', async () => {
    backendGetAll.and.callFake((opts) => {
      if (opts.table === TABLES.estates) {
        return of([estateRow('estate-current', 'server-1', 'B', 15)]);
      }

      if (opts.table === TABLES.estate_districts) {
        return of([districtRow('B', 'Market Ward')]);
      }

      return of([]);
    });

    const result = await firstValueFrom(service.getActiveHeroCurrentAddress());

    expect(result).toEqual({
      estateId: 'estate-current',
      serverId: 'server-1',
      districtCode: 'B',
      addressNumber: 15,
      addressLabel: 'B-15',
      districtName: 'Market Ward',
    });
    expect(backendGetAll.calls.first().args[0]).toEqual({
      table: TABLES.estates,
      select: 'id, server_id, district_code, address_number',
      filters: {
        id: { operator: FilterOperator.EQ, value: 'estate-current' },
        heroId: { operator: FilterOperator.EQ, value: 'hero-1' },
        serverId: { operator: FilterOperator.EQ, value: 'server-1' },
      },
      range: { from: 0, to: 0 },
      camelCase: false,
    });
  });

  it('rejects address page sizes that could generate too many options', () => {
    expect(() =>
      service.getAddressSelectionState({
        serverId: 'server-1',
        districtCode: 'A',
        limit: 251,
      }),
    ).toThrowError('Estate address limit must be an integer between 1 and 250.');

    expect(backendGetAll).not.toHaveBeenCalled();
  });
});

function capacityRow(
  districtCode: string,
  addressCapacity: number,
): EstateDistrictCapacityRow {
  return {
    district_code: districtCode,
    address_capacity: addressCapacity,
    label: `District ${districtCode}`,
    description: `District ${districtCode} addresses.`,
    helper_text: null,
    admin_description: null,
    is_active: true,
    sort_order: 10,
    created_at: '2026-05-03T10:00:00.000Z',
    updated_at: '2026-05-03T10:00:00.000Z',
  };
}

function estateRow(
  estateId: string,
  serverId: string,
  districtCode: string,
  addressNumber: number,
): OccupiedEstateAddressRow {
  return {
    id: estateId,
    server_id: serverId,
    district_code: districtCode,
    address_number: addressNumber,
  };
}

function districtRow(code: string, name: string): EstateAddressDistrictRow {
  return {
    code,
    name,
    description: `${name} district.`,
    rank: 2,
  };
}
