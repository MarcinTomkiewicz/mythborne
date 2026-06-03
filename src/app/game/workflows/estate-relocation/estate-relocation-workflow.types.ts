import type { EmptyEstateAddressOption } from '../../../core/domain/estate/estate-address.model';
import type { EstateRelocationResult } from '../../../core/domain/estate/estate-relocation.model';

export interface EstateRelocationRunnerInput {
  target: EmptyEstateAddressOption | null;
  destructiveConfirmed: boolean;
  currentTarget: () => EmptyEstateAddressOption | null;
  onSuccess: (result: EstateRelocationResult) => void;
  setIsRelocating: (value: boolean) => void;
  setRelocationError: (value: string | null) => void;
  setRelocationSuccess: (value: string | null) => void;
  setSelectedTarget: (value: EmptyEstateAddressOption | null) => void;
  setDestructiveConfirmed: (value: boolean) => void;
}

export interface EstateRelocationSnapshot {
  districtCode: string;
  addressNumber: number;
}
