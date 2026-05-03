export interface EstateAddressIdentity {
  districtCode: string;
  addressNumber: number;
  addressLabel: string;
}

export interface EstateDistrictCapacityReadModel {
  districtCode: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  addressCapacity: number;
  sortOrder: number;
  isActive: boolean;
}

export interface OccupiedEstateAddressReadModel extends EstateAddressIdentity {
  estateId: string;
  serverId: string;
  isOccupied: true;
}

export interface EmptyEstateAddressOption extends EstateAddressIdentity {
  isOccupied: false;
}

export type EstateAddressOption =
  | OccupiedEstateAddressReadModel
  | EmptyEstateAddressOption;

export interface CurrentEstateAddressReadModel extends EstateAddressIdentity {
  estateId: string;
  serverId: string;
  districtName: string | null;
}

export interface EstateAddressSelectionState {
  district: EstateDistrictCapacityReadModel;
  offset: number;
  limit: number;
  totalAddressCount: number;
  occupiedAddresses: OccupiedEstateAddressReadModel[];
  emptyAddressOptions: EmptyEstateAddressOption[];
  addressOptions: EstateAddressOption[];
}
