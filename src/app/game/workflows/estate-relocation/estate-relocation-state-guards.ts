import type { EmptyEstateAddressOption } from '../../../core/domain/estate/estate-address.model';
import type { EstateRelocationSnapshot } from './estate-relocation-workflow.types';

export function createRelocationSnapshot(
  input: Pick<EmptyEstateAddressOption, 'districtCode' | 'addressNumber'>,
): EstateRelocationSnapshot {
  return {
    districtCode: input.districtCode,
    addressNumber: input.addressNumber,
  };
}

export function matchesRelocationSnapshot(
  current: EstateRelocationSnapshot | null,
  snapshot: EstateRelocationSnapshot,
): boolean {
  return (
    current?.districtCode === snapshot.districtCode &&
    current.addressNumber === snapshot.addressNumber
  );
}
