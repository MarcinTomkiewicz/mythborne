export interface PvpAddRemainingActionsInput {
  serverId: string;
  heroId: string;
  amount: number;
  reason: string;
  actionDate?: string | null;
}

export interface PvpAddRemainingActionsResult {
  serverId: string;
  heroId: string;
  actionKind: string;
  actionDate: string;
  remainingCount: number;
  counterId: string;
}

export interface PvpAttackTravelTimerSkipInput {
  requestId: string;
}

export interface PvpAttackTravelTimerSkipResult {
  pvpActionId: string;
  requestId: string;
  canEnterManualResolution: boolean;
  arrivesAt: string;
  manualDeadlineAt: string;
  previousArrivesAt: string;
  previousManualDeadlineAt: string;
}
