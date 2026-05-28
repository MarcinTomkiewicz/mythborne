import { UiMetadataEntryReadModel } from '../../../core/domain/admin-ui-metadata.model';
import { PvpTargetCandidate } from '../../../core/domain/pvp/pvp.model';
import {
  PvpEligibilityDisplay,
  pvpEligibilityDisplay,
} from '../../../core/utils/pvp-eligibility-display';
import { toVicinityRowActions } from '../../../core/utils/vicinity-row-actions.mapper';
import {
  VicinityAddressRow,
  VicinityListRow,
  VicinityListRowKind,
} from '../../../core/types/vicinity.types';

export function toVicinityListRow(
  row: VicinityAddressRow,
  candidate: PvpTargetCandidate | null,
  metadataEntries: readonly UiMetadataEntryReadModel[],
  selfHeroName?: string,
): VicinityListRow {
  const kind = row.kind === 'self' || row.kind === 'empty'
    ? row.kind
    : 'occupied';
  const targetCandidate = kind === 'occupied' ? candidate : null;

  const attackDisplay = targetCandidate
    ? pvpEligibilityDisplay({
        actionKind: 'attack',
        eligibility: targetCandidate.attackEligibility,
        targetLevel: targetCandidate.targetLevel,
        metadataEntries,
      })
    : null;
  const spyDisplay = targetCandidate
    ? pvpEligibilityDisplay({
        actionKind: 'spy',
        eligibility: targetCandidate.spyEligibility,
        targetLevel: targetCandidate.targetLevel,
        metadataEntries,
      })
    : null;
  return {
    key: vicinityAddressKey(row.districtCode, row.addressNumber),
    kind,
    addressLabel: row.addressLabel,
    districtCode: row.districtCode,
    addressNumber: row.addressNumber,
    occupantLabel: targetCandidate?.targetDisplayName
      ?? (row.kind === 'self' ? selfHeroName : null)
      ?? (row.kind === 'empty' || row.kind === 'self' ? row.occupantLabel : ''),
    candidate: targetCandidate,
    attackDisplay,
    spyDisplay,
    statusLabel: toRowStatus(kind, targetCandidate),
    actions: targetCandidate ? toVicinityRowActions(targetCandidate) : [],
  };
}

export function vicinityAddressKey(districtCode: string, addressNumber: number): string {
  return `${districtCode}:${addressNumber}`;
}

export function rowDetailLabel(row: VicinityListRow): string {
  if (row.kind === 'self') {
    return 'Brak gildii';
  }

  if (row.kind === 'empty') {
    return 'Brak posiadłości bohatera';
  }

  if (row.candidate) {
    return row.candidate.targetGuildDisplayLabel ?? 'Brak gildii';
  }

  return '';
}

export function levelLabel(row: VicinityListRow): string {
  return row.candidate ? String(row.candidate.targetLevel) : '-';
}

export function durationLabel(seconds: number | null | undefined): string {
  if (typeof seconds !== 'number') {
    return '-';
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return remainingSeconds > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
}

export function playerSafeReason(
  display: PvpEligibilityDisplay | null | undefined,
): PvpEligibilityDisplay | null {
  return display?.reasonLabel && display.isPlayerSafeReason ? display : null;
}

export function protectionLabel(row: VicinityListRow): string | null {
  const expiresAt = row.candidate?.protectionExpiresAt;

  if (!expiresAt) {
    return null;
  }

  const expiresAtDate = new Date(expiresAt);

  if (Number.isNaN(expiresAtDate.getTime())) {
    return null;
  }

  return `do ${expiresAtDate.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })}`;
}

function isSameGuildCandidate(candidate: PvpTargetCandidate | null): boolean {
  const reasonKey = candidate?.attackEligibility.blockReason ?? '';

  return reasonKey === 'same_guild'
    || reasonKey === 'target_same_guild'
    || reasonKey === 'target_in_same_guild'
    || reasonKey === 'target_guild_member'
    || reasonKey === 'target_is_guild_member';
}

function toRowStatus(
  kind: VicinityListRowKind,
  candidate: PvpTargetCandidate | null,
): string | null {
  if (kind === 'self') {
    return 'Twoja';
  }

  if (kind === 'empty') {
    return 'Pusta działka';
  }

  if (!candidate) {
    return null;
  }

  if (candidate.underProtection) {
    return null;
  }

  if (isSameGuildCandidate(candidate)) {
    return 'Gildia';
  }

  return null;
}
