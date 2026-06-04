import type { CurrentEstateAddressReadModel } from '../domain/estate/estate-address.model';
import type {
  PlayerVicinityAddressCapacityReadModel,
  PlayerVicinityAddressRowReadModel,
  PlayerVicinityCopyReadModel,
  PlayerVicinityCurrentEstateReadModel,
  PlayerVicinityOccupiedEstateReadModel,
  PlayerVicinityPageContextReadModel,
} from '../domain/vicinity/player-vicinity-page-context.model';
import type {
  VicinityAddressRange,
  VicinityAddressRow,
  VicinityBrowserRangeResult,
} from '../types/vicinity.types';

export function activeVicinityAddressCapacities(
  capacities: readonly PlayerVicinityAddressCapacityReadModel[],
): PlayerVicinityAddressCapacityReadModel[] {
  return capacities
    .filter((capacity) => capacity.isActive)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function mapCurrentEstateAddress(
  currentEstate: PlayerVicinityCurrentEstateReadModel,
): CurrentEstateAddressReadModel | null {
  if (!currentEstate.districtCode || currentEstate.addressNumber === null) {
    return null;
  }

  return {
    estateId: currentEstate.estateId,
    serverId: currentEstate.serverId,
    districtCode: currentEstate.districtCode,
    addressNumber: currentEstate.addressNumber,
    addressLabel: currentEstate.address ?? formatVicinityAddress({
      districtCode: currentEstate.districtCode,
      addressNumber: currentEstate.addressNumber,
      firstAddress: null,
      lastAddress: null,
    }),
    districtName: currentEstate.districtLabel,
  };
}

export function buildPlayerVicinityBrowserRange(input: {
  context: PlayerVicinityPageContextReadModel;
  selectedDistrictCode: string | null;
  focusAddressNumber: number;
  useExistingSelection?: boolean;
  pageSize: number;
}): VicinityBrowserRangeResult {
  const districts = activeVicinityAddressCapacities(input.context.addressCapacities);
  const currentAddress = mapCurrentEstateAddress(input.context.currentEstate);

  if (!currentAddress) {
    throw new Error('Active hero does not have a complete current estate address.');
  }

  const district = resolveSelectedDistrict({
    districts,
    selectedDistrictCode: input.selectedDistrictCode,
    currentDistrictCode: currentAddress.districtCode,
    useExistingSelection: input.useExistingSelection,
  });
  const focusAddressNumber = resolveFocusAddressNumber({
    district,
    currentAddress,
    requestedFocusAddressNumber: input.focusAddressNumber,
    useExistingSelection: input.useExistingSelection,
  });

  return {
    context: input.context,
    currentAddress,
    districts,
    selectedDistrictCode: district.districtCode,
    focusAddressNumber,
    range: buildPlayerVicinityAddressRange({
      context: input.context,
      district,
      currentAddress,
      focusAddressNumber,
      pageSize: input.pageSize,
    }),
  };
}

export function buildPlayerVicinityAddressRange(input: {
  context: PlayerVicinityPageContextReadModel;
  district: PlayerVicinityAddressCapacityReadModel;
  currentAddress: CurrentEstateAddressReadModel;
  focusAddressNumber: number;
  pageSize: number;
}): VicinityAddressRange {
  const capacity = input.district;
  const { fromAddressNumber, toAddressNumber } = calculatePlayerVicinityAddressBounds({
    focusAddressNumber: input.focusAddressNumber,
    addressNumberStart: capacity.addressNumberStart,
    addressNumberEnd: capacity.addressNumberEnd,
    pageSize: input.pageSize,
  });
  const occupiedByAddress = new Map(
    input.context.occupiedEstates
      .filter((estate) =>
        estate.districtCode === capacity.districtCode
        && estate.addressNumber !== null,
      )
      .map((estate) => [vicinityAddressKey(estate.districtCode, estate.addressNumber), estate]),
  );
  const rows: VicinityAddressRow[] = [];

  for (
    let addressNumber = fromAddressNumber;
    addressNumber <= toAddressNumber;
    addressNumber += 1
  ) {
    const occupied = occupiedByAddress.get(
      vicinityAddressKey(capacity.districtCode, addressNumber),
    );
    const derived = occupied
      ? toOccupiedAddressRow(capacity, occupied)
      : toEmptyAddressRow(input.context.copyJson, capacity, addressNumber);

    rows.push(toVicinityAddressRow(derived));
  }

  return {
    district: input.district,
    focusAddressNumber: input.focusAddressNumber,
    fromAddressNumber,
    toAddressNumber,
    rangeLabel: `${formatVicinityAddress({
      districtCode: capacity.districtCode,
      addressNumber: fromAddressNumber,
      firstAddress: capacity.firstAddress,
      lastAddress: capacity.lastAddress,
    })} - ${formatVicinityAddress({
      districtCode: capacity.districtCode,
      addressNumber: toAddressNumber,
      firstAddress: capacity.firstAddress,
      lastAddress: capacity.lastAddress,
    })}`,
    rows,
  };
}

export function vicinityAddressKey(
  districtCode: string | null,
  addressNumber: number | null,
): string {
  return `${districtCode ?? ''}:${addressNumber ?? ''}`;
}

export function calculatePlayerVicinityAddressBounds(input: {
  focusAddressNumber: number;
  addressNumberStart: number;
  addressNumberEnd: number;
  pageSize: number;
}): { fromAddressNumber: number; toAddressNumber: number } {
  const minAddressNumber = input.addressNumberStart;
  const maxAddressNumber = input.addressNumberEnd;
  const pageSize = Math.max(1, input.pageSize);
  const halfBeforeCenter = Math.floor((pageSize - 1) / 2);
  const maxFromAddressNumber = Math.max(
    minAddressNumber,
    maxAddressNumber - pageSize + 1,
  );
  const focusAddressNumber = Math.min(
    Math.max(minAddressNumber, input.focusAddressNumber),
    maxAddressNumber,
  );
  const fromAddressNumber = Math.min(
    Math.max(minAddressNumber, focusAddressNumber - halfBeforeCenter),
    maxFromAddressNumber,
  );

  return {
    fromAddressNumber,
    toAddressNumber: Math.min(maxAddressNumber, fromAddressNumber + pageSize - 1),
  };
}

function resolveSelectedDistrict(input: {
  districts: readonly PlayerVicinityAddressCapacityReadModel[];
  selectedDistrictCode: string | null;
  currentDistrictCode: string;
  useExistingSelection?: boolean;
}): PlayerVicinityAddressCapacityReadModel {
  const preferredDistrictCode = input.useExistingSelection
    ? input.selectedDistrictCode
    : input.selectedDistrictCode ?? input.currentDistrictCode;
  const district =
    input.districts.find((entry) => entry.districtCode === preferredDistrictCode)
    ?? input.districts.find((entry) => entry.districtCode === input.currentDistrictCode)
    ?? input.districts[0]
    ?? null;

  if (!district) {
    throw new Error('No active vicinity district capacities returned by page context.');
  }

  return district;
}

function resolveFocusAddressNumber(input: {
  district: PlayerVicinityAddressCapacityReadModel;
  currentAddress: CurrentEstateAddressReadModel;
  requestedFocusAddressNumber: number;
  useExistingSelection?: boolean;
}): number {
  if (input.useExistingSelection) {
    return clampAddressNumber(input.requestedFocusAddressNumber, input.district);
  }

  const focusAddressNumber = input.currentAddress.districtCode === input.district.districtCode
    ? input.currentAddress.addressNumber
    : input.district.addressNumberStart;

  return clampAddressNumber(focusAddressNumber, input.district);
}

function clampAddressNumber(
  addressNumber: number,
  district: PlayerVicinityAddressCapacityReadModel,
): number {
  return Math.min(
    Math.max(district.addressNumberStart, addressNumber),
    district.addressNumberEnd,
  );
}

function toOccupiedAddressRow(
  capacity: PlayerVicinityAddressCapacityReadModel,
  occupied: PlayerVicinityOccupiedEstateReadModel,
): PlayerVicinityAddressRowReadModel {
  const addressNumber = occupied.addressNumber;

  if (addressNumber === null) {
    throw new Error('Occupied vicinity address row cannot be overlaid without addressNumber.');
  }

  return {
    districtCode: capacity.districtCode,
    districtLabel: occupied.districtLabel ?? capacity.displayLabel,
    addressNumber,
    address: occupied.address ?? formatVicinityAddress({
      districtCode: capacity.districtCode,
      addressNumber,
      firstAddress: capacity.firstAddress,
      lastAddress: capacity.lastAddress,
    }),
    displayLabel: occupied.displayLabel ?? occupied.address ?? formatVicinityAddress({
      districtCode: capacity.districtCode,
      addressNumber,
      firstAddress: capacity.firstAddress,
      lastAddress: capacity.lastAddress,
    }),
    isOccupied: true,
    isCurrentHeroEstate: occupied.isCurrentHeroEstate,
    occupancyStatusKey: occupied.occupancyStatusKey,
    occupancyLabel: occupied.occupancyLabel,
    estateId: occupied.estateId,
    serverId: occupied.serverId,
    heroId: occupied.heroId,
    estateRank: occupied.estateRank,
  };
}

function toEmptyAddressRow(
  copy: PlayerVicinityCopyReadModel,
  capacity: PlayerVicinityAddressCapacityReadModel,
  addressNumber: number,
): PlayerVicinityAddressRowReadModel {
  const address = formatVicinityAddress({
    districtCode: capacity.districtCode,
    addressNumber,
    firstAddress: capacity.firstAddress,
    lastAddress: capacity.lastAddress,
  });

  return {
    districtCode: capacity.districtCode,
    districtLabel: capacity.displayLabel,
    addressNumber,
    address,
    displayLabel: address,
    isOccupied: false,
    isCurrentHeroEstate: false,
    occupancyStatusKey: 'empty',
    occupancyLabel: copy.labels.empty,
  };
}

function toVicinityAddressRow(row: PlayerVicinityAddressRowReadModel): VicinityAddressRow {
  return {
    ...row,
    addressLabel: row.displayLabel,
    kind: row.isCurrentHeroEstate
      ? 'self'
      : row.isOccupied
        ? 'occupied'
        : 'empty',
    isSelectable: !row.isOccupied,
    occupantLabel: row.occupancyLabel,
  };
}

function formatVicinityAddress(input: {
  districtCode: string;
  addressNumber: number;
  firstAddress: string | null;
  lastAddress: string | null;
}): string {
  const width = addressNumberWidth(input.firstAddress)
    ?? addressNumberWidth(input.lastAddress)
    ?? 4;

  return `${input.districtCode}-${String(input.addressNumber).padStart(width, '0')}`;
}

function addressNumberWidth(value: string | null): number | null {
  const parts = value?.split('-') ?? [];
  const numberPart = parts.length > 1 ? parts[parts.length - 1] : null;

  return numberPart && /^\d+$/.test(numberPart)
    ? numberPart.length
    : null;
}
