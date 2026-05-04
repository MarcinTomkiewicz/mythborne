import {
  CurrentEstateAddressReadModel,
  EstateDistrictCapacityReadModel,
  OccupiedEstateAddressReadModel,
} from '../../../core/domain/estate/estate-address.model';
import {
  buildVicinityAddressRange,
  toEmptyAddressOption,
  VICINITY_ADDRESS_RADIUS,
} from './vicinity-address-range';

describe('buildVicinityAddressRange', () => {
  it('builds a current-address centered range using the accepted vicinity radius', () => {
    const range = buildVicinityAddressRange({
      currentAddress: currentAddress(3301),
      district: district(5000),
      occupiedAddresses: [],
    });

    expect(VICINITY_ADDRESS_RADIUS).toBe(10);
    expect(range.fromAddressNumber).toBe(3291);
    expect(range.toAddressNumber).toBe(3311);
    expect(range.rangeLabel).toBe('A-3291 - A-3311');
    expect(range.rows.length).toBe(21);
  });

  it('clips the range to district capacity boundaries', () => {
    const lowRange = buildVicinityAddressRange({
      currentAddress: currentAddress(4),
      district: district(20),
      occupiedAddresses: [],
    });
    const highRange = buildVicinityAddressRange({
      currentAddress: currentAddress(18),
      district: district(20),
      occupiedAddresses: [],
    });

    expect(lowRange.rangeLabel).toBe('A-1 - A-14');
    expect(highRange.rangeLabel).toBe('A-8 - A-20');
  });

  it('can browse a non-current district without marking a self row', () => {
    const range = buildVicinityAddressRange({
      currentAddress: currentAddress(11),
      district: {
        ...district(20),
        districtCode: 'B',
        label: 'District B',
      },
      centerAddressNumber: 5,
      occupiedAddresses: [
        {
          ...occupiedAddress(4),
          districtCode: 'B',
          addressLabel: 'B-4',
        },
      ],
    });

    expect(range.rangeLabel).toBe('B-1 - B-15');
    expect(range.rows.some((row) => row.kind === 'self')).toBeFalse();
    expect(range.rows.find((row) => row.addressNumber === 4)?.kind).toBe('occupied');
    expect(range.rows.find((row) => row.addressNumber === 5)?.kind).toBe('empty');
  });

  it('classifies self, occupied and empty address rows', () => {
    const range = buildVicinityAddressRange({
      currentAddress: currentAddress(11),
      district: district(30),
      occupiedAddresses: [occupiedAddress(9), occupiedAddress(12)],
    });

    expect(range.rows.find((row) => row.addressNumber === 11)?.kind).toBe('self');
    expect(range.rows.find((row) => row.addressNumber === 9)?.kind).toBe('occupied');
    expect(range.rows.find((row) => row.addressNumber === 10)?.kind).toBe('empty');
    expect(range.rows.find((row) => row.addressNumber === 10)?.isSelectable).toBeTrue();
    expect(range.rows.find((row) => row.addressNumber === 12)?.isSelectable).toBeFalse();
  });

  it('creates relocation target options only from empty rows', () => {
    const range = buildVicinityAddressRange({
      currentAddress: currentAddress(11),
      district: district(30),
      occupiedAddresses: [occupiedAddress(12)],
    });

    expect(toEmptyAddressOption(range.rows.find((row) => row.addressNumber === 10)!))
      .toEqual({
        districtCode: 'A',
        addressNumber: 10,
        addressLabel: 'A-10',
        isOccupied: false,
      });
    expect(toEmptyAddressOption(range.rows.find((row) => row.addressNumber === 11)!))
      .toBeNull();
    expect(toEmptyAddressOption(range.rows.find((row) => row.addressNumber === 12)!))
      .toBeNull();
  });
});

function district(addressCapacity: number): EstateDistrictCapacityReadModel {
  return {
    districtCode: 'A',
    label: 'District A',
    description: 'District A addresses.',
    helperText: null,
    adminDescription: null,
    addressCapacity,
    sortOrder: 10,
    isActive: true,
  };
}

function currentAddress(addressNumber: number): CurrentEstateAddressReadModel {
  return {
    estateId: 'estate-1',
    serverId: 'server-1',
    districtCode: 'A',
    addressNumber,
    addressLabel: `A-${addressNumber}`,
    districtName: 'District A',
  };
}

function occupiedAddress(addressNumber: number): OccupiedEstateAddressReadModel {
  return {
    estateId: `estate-${addressNumber}`,
    serverId: 'server-1',
    districtCode: 'A',
    addressNumber,
    addressLabel: `A-${addressNumber}`,
    isOccupied: true,
  };
}
