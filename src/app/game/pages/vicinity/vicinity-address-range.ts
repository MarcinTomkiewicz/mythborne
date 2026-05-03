import {
  CurrentEstateAddressReadModel,
  EmptyEstateAddressOption,
  EstateAddressIdentity,
  EstateDistrictCapacityReadModel,
  OccupiedEstateAddressReadModel,
} from '../../../core/domain/estate/estate-address.model';
import { formatEstateAddressLabel } from '../../../core/utils/estate-address';

export const VICINITY_ADDRESS_RADIUS = 10;

export type VicinityAddressRowKind = 'self' | 'occupied' | 'empty';

export interface VicinityAddressRow extends EstateAddressIdentity {
  kind: VicinityAddressRowKind;
  isSelectable: boolean;
  occupantLabel: string;
}

export interface VicinityAddressRange {
  district: EstateDistrictCapacityReadModel;
  centerAddressNumber: number;
  fromAddressNumber: number;
  toAddressNumber: number;
  rangeLabel: string;
  rows: VicinityAddressRow[];
}

export function buildVicinityAddressRange(input: {
  currentAddress: CurrentEstateAddressReadModel;
  district: EstateDistrictCapacityReadModel;
  occupiedAddresses: readonly OccupiedEstateAddressReadModel[];
  radius?: number;
}): VicinityAddressRange {
  const radius = normalizeRadius(input.radius ?? VICINITY_ADDRESS_RADIUS);

  if (input.currentAddress.districtCode !== input.district.districtCode) {
    throw new Error('Current estate district does not match vicinity district.');
  }

  const centerAddressNumber = input.currentAddress.addressNumber;
  const fromAddressNumber = Math.max(1, centerAddressNumber - radius);
  const toAddressNumber = Math.min(
    input.district.addressCapacity,
    centerAddressNumber + radius,
  );
  const occupiedByNumber = new Map(
    input.occupiedAddresses.map((address) => [address.addressNumber, address]),
  );
  const rows: VicinityAddressRow[] = [];

  for (
    let addressNumber = fromAddressNumber;
    addressNumber <= toAddressNumber;
    addressNumber += 1
  ) {
    const occupied = occupiedByNumber.get(addressNumber);

    if (addressNumber === centerAddressNumber) {
      rows.push(toSelfRow(input.currentAddress));
      continue;
    }

    rows.push(occupied ? toOccupiedRow(occupied) : toEmptyRow(input.district, addressNumber));
  }

  return {
    district: input.district,
    centerAddressNumber,
    fromAddressNumber,
    toAddressNumber,
    rangeLabel: `${formatEstateAddressLabel(
      input.district.districtCode,
      fromAddressNumber,
    )} - ${formatEstateAddressLabel(input.district.districtCode, toAddressNumber)}`,
    rows,
  };
}

export function toEmptyAddressOption(
  row: VicinityAddressRow,
): EmptyEstateAddressOption | null {
  return row.kind === 'empty'
    ? {
        districtCode: row.districtCode,
        addressNumber: row.addressNumber,
        addressLabel: row.addressLabel,
        isOccupied: false,
      }
    : null;
}

function toSelfRow(address: CurrentEstateAddressReadModel): VicinityAddressRow {
  return {
    districtCode: address.districtCode,
    addressNumber: address.addressNumber,
    addressLabel: address.addressLabel,
    kind: 'self',
    isSelectable: false,
    occupantLabel: 'Your estate',
  };
}

function toOccupiedRow(address: OccupiedEstateAddressReadModel): VicinityAddressRow {
  return {
    districtCode: address.districtCode,
    addressNumber: address.addressNumber,
    addressLabel: address.addressLabel,
    kind: 'occupied',
    isSelectable: false,
    occupantLabel: 'Occupied estate',
  };
}

function toEmptyRow(
  district: EstateDistrictCapacityReadModel,
  addressNumber: number,
): VicinityAddressRow {
  return {
    districtCode: district.districtCode,
    addressNumber,
    addressLabel: formatEstateAddressLabel(district.districtCode, addressNumber),
    kind: 'empty',
    isSelectable: true,
    occupantLabel: 'Empty plot',
  };
}

function normalizeRadius(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('Vicinity address radius must be a non-negative integer.');
  }

  return value;
}
