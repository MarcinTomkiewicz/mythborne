import type {
  PvpActionStartResult,
  PvpTargetCandidate,
} from '../../../../core/domain/pvp/pvp.model';
import type { PvpStartActionKind } from '../../../../core/types/pvp-action.types';

export interface VicinityPvpActionStartInput {
  candidate: PvpTargetCandidate;
  actionKind: PvpStartActionKind;
  refreshAfterStart: (result: PvpActionStartResult) => void;
}
