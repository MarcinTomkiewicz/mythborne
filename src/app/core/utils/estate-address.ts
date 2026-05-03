import {
  CurrentEstateAddressReadModel,
  EmptyEstateAddressOption,
  EstateAddressOption,
  EstateAddressSelectionState,
  EstateDistrictCapacityReadModel,
  OccupiedEstateAddressReadModel,
} from '../domain/estate/estate-address.model';
import {
  EstateAddressDistrictRow,
  EstateDistrictCapacityRow,
  OccupiedEstateAddressRow,
} from '../types/estate-address.types';

export function formatEstateAddressLabel(
  districtCode: string,
  addressNumber: number,
): string {
  return `${requiredDistrictCode(districtCode)}-${requiredAddressNumber(addressNumber)}`;
}

export function mapEstateDistrictCapacity(
  row: EstateDistrictCapacityRow,
): EstateDistrictCapacityReadModel {
  return {
    districtCode: requiredDistrictCode(row.district_code),
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    addressCapacity: requiredAddressNumber(row.address_capacity),
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapOccupiedEstateAddress(
  row: OccupiedEstateAddressRow,
): OccupiedEstateAddressReadModel | null {
  if (!row.district_code || row.address_number === null) {
    return null;
  }

  return {
    estateId: row.id,
    serverId: row.server_id,
    districtCode: requiredDistrictCode(row.district_code),
    addressNumber: requiredAddressNumber(row.address_number),
    addressLabel: formatEstateAddressLabel(row.district_code, row.address_number),
    isOccupied: true,
  };
}

export function mapCurrentEstateAddress(
  row: OccupiedEstateAddressRow,
  districts: readonly EstateAddressDistrictRow[],
): CurrentEstateAddressReadModel | null {
  const occupied = mapOccupiedEstateAddress(row);

  if (!occupied) {
    return null;
  }

  return {
    estateId: occupied.estateId,
    serverId: occupied.serverId,
    districtCode: occupied.districtCode,
    addressNumber: occupied.addressNumber,
    addressLabel: occupied.addressLabel,
    districtName:
      districts.find((district) => district.code === occupied.districtCode)?.name ?? null,
  };
}

export function buildEstateAddressSelectionState(input: {
  district: EstateDistrictCapacityReadModel;
  occupiedAddresses: readonly OccupiedEstateAddressReadModel[];
  offset: number;
  limit: number;
}): EstateAddressSelectionState {
  const offset = nonNegativeInteger(input.offset, 'offset');
  const limit = positiveInteger(input.limit, 'limit');
  const totalAddressCount = input.district.addressCapacity;
  const fromAddressNumber = Math.min(offset + 1, totalAddressCount + 1);
  const toAddressNumber = Math.min(offset + limit, totalAddressCount);
  const occupiedByNumber = new Map(
    input.occupiedAddresses.map((address) => [address.addressNumber, address]),
  );
  const addressOptions: EstateAddressOption[] = [];
  const emptyAddressOptions: EmptyEstateAddressOption[] = [];

  for (
    let addressNumber = fromAddressNumber;
    addressNumber <= toAddressNumber;
    addressNumber += 1
  ) {
    const occupied = occupiedByNumber.get(addressNumber);

    if (occupied) {
      addressOptions.push(occupied);
      continue;
    }

    const emptyOption: EmptyEstateAddressOption = {
      districtCode: input.district.districtCode,
      addressNumber,
      addressLabel: formatEstateAddressLabel(input.district.districtCode, addressNumber),
      isOccupied: false,
    };
    emptyAddressOptions.push(emptyOption);
    addressOptions.push(emptyOption);
  }

  return {
    district: input.district,
    offset,
    limit,
    totalAddressCount,
    occupiedAddresses: [...input.occupiedAddresses],
    emptyAddressOptions,
    addressOptions,
  };
}

function requiredDistrictCode(value: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error('Estate district code is required.');
  }

  return normalized;
}

function requiredAddressNumber(value: number): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('Estate address number must be a positive integer.');
  }

  return value;
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Estate address ${field} must be a positive integer.`);
  }

  return value;
}

function nonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Estate address ${field} must be a non-negative integer.`);
  }

  return value;
}
