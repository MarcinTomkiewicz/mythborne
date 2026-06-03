import { formatTimeOfDayLabel } from '../../../../core/utils/pending-timer';

export function activeProtectionLabel(input: {
  isActive: boolean | null | undefined;
  expiresAt: string | null | undefined;
}): string {
  return input.isActive && input.expiresAt
    ? `do ${formatTimeOfDayLabel(input.expiresAt)}`
    : 'Brak aktywnej ochrony';
}
