export interface PendingTimerDisplay {
  subjectId: string | null;
  isCoherent: boolean;
  isReady: boolean;
  progressPercent: number;
  remainingLabel: string;
  countdownLabel: string;
  durationSeconds: number | null;
  remainingSeconds: number | null;
}

export interface PendingTimerDisplayInput {
  subjectId: string | null;
  startedAt: string | null | undefined;
  resolvesAt: string | null | undefined;
  nowMs: number;
  isLoading?: boolean;
  futureToleranceMs?: number;
}

export interface PendingTimerReadinessInput {
  resolvesAt: string | null | undefined;
  nowMs: number;
}
