import {
  CurrentEstateAddressReadModel,
  EmptyEstateAddressOption,
  EstateDistrictCapacityReadModel,
  OccupiedEstateAddressReadModel,
} from '../../../../core/domain/estate/estate-address.model';
import {
  VicinityAddressRange,
  VicinityAddressRow,
} from '../../../../core/types/vicinity.types';
import { VICINITY_ADDRESS_PAGE_SIZE } from '../../../../core/configs/vicinity.config';
import { formatEstateAddressLabel } from '../../../../core/utils/estate-address';

export function buildVicinityAddressRange(input: {
  currentAddress: CurrentEstateAddressReadModel;
  district: EstateDistrictCapacityReadModel;
  occupiedAddresses: readonly OccupiedEstateAddressReadModel[];
  pageSize?: number;
  focusAddressNumber?: number;
}): VicinityAddressRange {
  const pageSize = normalizePageSize(input.pageSize ?? VICINITY_ADDRESS_PAGE_SIZE);

  const focusAddressNumber = normalizeFocusAddressNumber(
    input.focusAddressNumber ?? input.currentAddress.addressNumber,
    input.district,
  );
  const { fromAddressNumber, toAddressNumber } = calculateVicinityAddressBounds({
    focusAddressNumber,
    addressCapacity: input.district.addressCapacity,
    pageSize,
  });
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

    if (
      input.currentAddress.districtCode === input.district.districtCode &&
      addressNumber === input.currentAddress.addressNumber
    ) {
      rows.push(toSelfRow(input.currentAddress));
      continue;
    }

    rows.push(occupied ? toOccupiedRow(occupied) : toEmptyRow(input.district, addressNumber));
  }

  return {
    district: input.district,
    focusAddressNumber,
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
    occupantLabel: '',
  };
}

function toOccupiedRow(address: OccupiedEstateAddressReadModel): VicinityAddressRow {
  return {
    districtCode: address.districtCode,
    addressNumber: address.addressNumber,
    addressLabel: address.addressLabel,
    kind: 'occupied',
    isSelectable: false,
    occupantLabel: '',
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
    occupantLabel: 'Pusta działka',
  };
}

function normalizeFocusAddressNumber(
  value: number,
  district: EstateDistrictCapacityReadModel,
): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('Vicinity center address must be a positive integer.');
  }

  return Math.min(value, district.addressCapacity);
}

export function calculateVicinityAddressBounds(input: {
  focusAddressNumber: number;
  addressCapacity: number;
  pageSize?: number;
}): { fromAddressNumber: number; toAddressNumber: number } {
  const pageSize = normalizePageSize(input.pageSize ?? VICINITY_ADDRESS_PAGE_SIZE);
  const halfBeforeCenter = Math.floor((pageSize - 1) / 2);
  const maxFromAddressNumber = Math.max(1, input.addressCapacity - pageSize + 1);
  const fromAddressNumber = Math.min(
    Math.max(1, input.focusAddressNumber - halfBeforeCenter),
    maxFromAddressNumber,
  );

  return {
    fromAddressNumber,
    toAddressNumber: Math.min(input.addressCapacity, fromAddressNumber + pageSize - 1),
  };
}

function normalizePageSize(value: number): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('Vicinity page size must be a positive integer.');
  }

  return value;
}
