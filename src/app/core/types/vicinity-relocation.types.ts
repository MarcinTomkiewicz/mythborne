import type { Observable } from 'rxjs';
import type { EmptyEstateAddressOption } from '../domain/estate/estate-address.model';
import type { VicinityBrowserRangeResult } from './vicinity-range.types';

export interface VicinityRelocationRunnerInput {
  target: EmptyEstateAddressOption | null;
  destructiveConfirmed: boolean;
  currentTarget: () => EmptyEstateAddressOption | null;
  loadBrowserRange: () => Observable<VicinityBrowserRangeResult>;
  applyBrowserRangeResult: (result: VicinityBrowserRangeResult) => void;
  setIsRelocating: (value: boolean) => void;
  setRelocationError: (value: string | null) => void;
  setRelocationSuccess: (value: string | null) => void;
  setSelectedTarget: (value: EmptyEstateAddressOption | null) => void;
  setDestructiveConfirmed: (value: boolean) => void;
}
