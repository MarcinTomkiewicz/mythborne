import {
  buildEstateAddressSelectionState,
  formatEstateAddressLabel,
  mapCurrentEstateAddress,
  mapEstateDistrictCapacity,
  mapOccupiedEstateAddress,
} from './estate-address';
import {
  EstateAddressDistrictRow,
  EstateDistrictCapacityRow,
  OccupiedEstateAddressRow,
} from '../types/estate-address.types';

describe('estate address mappers', () => {
  it('formats address labels from district code and address number', () => {
    expect(formatEstateAddressLabel('A', 42)).toBe('A-42');
  });

  it('maps district capacity without hardcoded capacity values', () => {
    expect(mapEstateDistrictCapacity(capacityRow('C', 500))).toEqual(
      jasmine.objectContaining({
        districtCode: 'C',
        addressCapacity: 500,
        label: 'District C',
        isActive: true,
      }),
    );
  });

  it('maps occupied addresses without exposing hero or account identifiers', () => {
    const result = mapOccupiedEstateAddress(estateRow('estate-1', 'server-1', 'B', 12));

    expect(result).toEqual({
      estateId: 'estate-1',
      serverId: 'server-1',
      districtCode: 'B',
      addressNumber: 12,
      addressLabel: 'B-12',
      isOccupied: true,
    });
    expect(result).not.toEqual(jasmine.objectContaining({
      heroId: jasmine.any(String),
      userId: jasmine.any(String),
    }));
  });

  it('builds a paged address state and does not generate beyond capacity', () => {
    const result = buildEstateAddressSelectionState({
      district: mapEstateDistrictCapacity(capacityRow('E', 1)),
      occupiedAddresses: [],
      offset: 0,
      limit: 100,
    });

    expect(result.addressOptions.map((entry) => entry.addressLabel)).toEqual(['E-1']);
    expect(result.emptyAddressOptions.map((entry) => entry.addressLabel)).toEqual(['E-1']);
    expect(result.totalAddressCount).toBe(1);
  });

  it('overlays occupied addresses on generated address options', () => {
    const occupied = mapOccupiedEstateAddress(estateRow('estate-2', 'server-1', 'A', 2));

    if (!occupied) {
      fail('Expected occupied address.');
      return;
    }

    const result = buildEstateAddressSelectionState({
      district: mapEstateDistrictCapacity(capacityRow('A', 5)),
      occupiedAddresses: [occupied],
      offset: 0,
      limit: 5,
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

  it('maps current address with district display name', () => {
    expect(
      mapCurrentEstateAddress(
        estateRow('estate-3', 'server-1', 'D', 7),
        [districtRow('D', 'Citadel')],
      ),
    ).toEqual({
      estateId: 'estate-3',
      serverId: 'server-1',
      districtCode: 'D',
      addressNumber: 7,
      addressLabel: 'D-7',
      districtName: 'Citadel',
    });
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
    rank: 1,
  };
}
