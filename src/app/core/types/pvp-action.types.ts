import type { PvpActionStartResult } from '../domain/pvp/pvp.model';
import type { PvpActionKindKey } from './pvp-rpc.types';

export type PvpStartActionKind = 'attack' | 'spy';

export interface PendingPvpAction {
  actionKind: PvpStartActionKind;
  targetHeroId: string;
}

export interface PvpActionRunnerStartInput {
  actionKind: PvpStartActionKind;
  targetHeroId: string;
  requestIdPrefix: string;
  onMissingContext: () => void;
  onSuccess: (result: PvpActionStartResult) => void;
  onError: (error: unknown) => void;
}

export interface PvpTargetCandidateFilters {
  districtCode: string | null;
  limit: number;
  offset: number;
  search: string | null;
}

export interface StartPvpActionInput {
  actionKind: PvpActionKindKey;
  targetHeroId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface SettleDuePvpSpyActionInput {
  pvpActionId: string;
  requestId?: string | null;
}

export interface CreatePvpSpyGameReportInput {
  pvpSpyResultId: string;
  requestId?: string | null;
}

export interface PvpVisibleAddressTargetOverlayInput {
  districtCode: string;
  fromAddressNumber: number;
  toAddressNumber: number;
}
