import type {
  PendingTimerDisplay,
  PendingTimerDisplayInput,
  PendingTimerReadinessInput,
} from '../types/pending-timer.types';

const DEFAULT_FUTURE_TOLERANCE_MS = 1000;

export function pendingTimerDisplay(
  input: PendingTimerDisplayInput,
): PendingTimerDisplay {
  const neutral = neutralPendingTimerDisplay(input.subjectId);
  const timing = pendingTimerTiming(input);

  if (!input.subjectId || !timing) {
    return neutral;
  }

  if (input.isLoading) {
    return neutral;
  }

  const durationMs = timing.resolvesAtMs - timing.startedAtMs;
  const remainingMs = timing.resolvesAtMs - input.nowMs;
  const futureToleranceMs = input.futureToleranceMs ?? DEFAULT_FUTURE_TOLERANCE_MS;

  if (remainingMs > durationMs + futureToleranceMs) {
    return neutral;
  }

  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const elapsedMs = Math.max(0, input.nowMs - timing.startedAtMs);
  const progressPercent = remainingMs <= 0
    ? 100
    : clampRoundedPercent((elapsedMs / durationMs) * 100);

  return {
    subjectId: input.subjectId,
    isCoherent: true,
    isReady: remainingMs <= 0,
    progressPercent,
    remainingLabel: remainingMs <= 0
      ? 'Gotowe'
      : formatPendingDurationLabel(remainingSeconds),
    countdownLabel: formatCountdownDuration(remainingSeconds),
    durationSeconds: Math.round(durationMs / 1000),
    remainingSeconds,
  };
}

export function pendingTimerHasElapsed(
  input: PendingTimerReadinessInput,
): boolean {
  const resolvesAtMs = parseTimeMs(input.resolvesAt);

  return resolvesAtMs !== null && resolvesAtMs <= input.nowMs;
}

export function neutralPendingTimerDisplay(
  subjectId: string | null = null,
): PendingTimerDisplay {
  return {
    subjectId,
    isCoherent: false,
    isReady: false,
    progressPercent: 0,
    remainingLabel: 'aktualizacja',
    countdownLabel: '--:--',
    durationSeconds: null,
    remainingSeconds: null,
  };
}

function pendingTimerTiming(
  input: Pick<PendingTimerDisplayInput, 'startedAt' | 'resolvesAt'>,
): { startedAtMs: number; resolvesAtMs: number } | null {
  const startedAtMs = parseTimeMs(input.startedAt);
  const resolvesAtMs = parseTimeMs(input.resolvesAt);

  if (
    startedAtMs === null ||
    resolvesAtMs === null ||
    resolvesAtMs <= startedAtMs
  ) {
    return null;
  }

  return { startedAtMs, resolvesAtMs };
}

export function formatPendingDurationLabel(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export function formatTimeOfDayLabel(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 8);
  }

  return [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ].map((part) => String(part).padStart(2, '0')).join(':');
}

function formatCountdownDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function clampRoundedPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 1000) / 1000));
}

function parseTimeMs(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);

  return Number.isFinite(parsed) ? parsed : null;
}
