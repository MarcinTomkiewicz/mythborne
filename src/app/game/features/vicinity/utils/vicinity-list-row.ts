import { VICINITY_ADDRESS_LIST_METRIC_KEYS } from '../../../../core/configs/vicinity.config';
import { UiMetadataEntryReadModel } from '../../../../core/domain/admin-ui-metadata.model';
import { PvpTargetCandidate } from '../../../../core/domain/pvp/pvp.model';
import type {
  PlayerVicinityCopyReadModel,
} from '../../../../core/domain/vicinity/player-vicinity-page-context.model';
import {
  AddressDataRow,
  DataRowKind,
} from '../../../../core/types/data-row.types';
import {
  VicinityAddressRow,
} from '../../../../core/types/vicinity.types';
import {
  PvpEligibilityDisplay,
  pvpEligibilityDisplay,
} from '../../../../core/utils/pvp-eligibility-display';
import {
  formatPendingDurationLabel,
  formatTimeOfDayLabel,
} from '../../../../core/utils/pending-timer';
import { replaceTemplateTokens } from '../../../../core/utils/token-template';
import { toVicinityDataRowActions } from '../../../../core/utils/vicinity-row-actions.mapper';

export function toVicinityAddressDataRow(
  row: VicinityAddressRow,
  candidate: PvpTargetCandidate | null,
  metadataEntries: readonly UiMetadataEntryReadModel[],
  copy: PlayerVicinityCopyReadModel['addressList'],
  labelsCopy: PlayerVicinityCopyReadModel['labels'],
  summaryCopy: PlayerVicinityCopyReadModel['summary'],
  selectedTargetCopy: PlayerVicinityCopyReadModel['selectedTarget'],
  selfHeroName?: string,
  selfProtectionDisplay?: string | null,
): AddressDataRow {
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
  const isProtected = !!targetCandidate?.underProtection;
  const metricDisplays = {
    level: targetCandidate ? String(targetCandidate.targetLevel) : copy.metricUnavailableLabel,
    attackTravel: travelTimeDisplay(
      targetCandidate?.attackEligibility.travelTimeSeconds,
      copy.metricUnavailableLabel,
    ),
    spyTravel: travelTimeDisplay(
      targetCandidate?.spyEligibility.travelTimeSeconds,
      copy.metricUnavailableLabel,
    ),
  };
  const listRow: AddressDataRow = {
    key: vicinityAddressKey(row.districtCode, row.addressNumber),
    kind,
    leadingLabel: row.addressLabel,
    districtCode: row.districtCode,
    districtLabel: row.districtLabel,
    addressNumber: row.addressNumber,
    address: row.address,
    displayLabel: row.displayLabel,
    isOccupied: row.isOccupied,
    isCurrentHeroEstate: row.isCurrentHeroEstate,
    occupancyStatusKey: row.occupancyStatusKey,
    occupancyLabel: row.occupancyLabel,
    estateId: row.estateId,
    serverId: row.serverId,
    heroId: row.heroId,
    estateRank: row.estateRank,
    title: row.kind === 'empty'
      ? labelsCopy.empty
      : targetCandidate?.targetDisplayName
        ?? (row.kind === 'self' ? selfHeroName : null)
        ?? (row.kind === 'self' ? row.occupantLabel : ''),
    candidate: targetCandidate,
    attackDisplay,
    spyDisplay,
    statusLabel: toRowStatus(row, kind, targetCandidate, copy),
    statusIndicatorIcon: isProtected ? 'pi pi-shield' : null,
    statusIndicatorAriaLabel: isProtected ? copy.protectedTargetAriaLabel : null,
    isDangerState: isProtected,
    subtitle: '',
    levelDisplay: metricDisplays.level,
    attackTravelDisplay: metricDisplays.attackTravel,
    spyTravelDisplay: metricDisplays.spyTravel,
    metricCells: VICINITY_ADDRESS_LIST_METRIC_KEYS.map((key) => ({
      key,
      value: metricDisplays[key],
    })),
    protectionDisplay: null,
    playerSafeAttackReason: playerSafeReason(attackDisplay),
    playerSafeSpyReason: playerSafeReason(spyDisplay),
    actions: row.kind === 'empty'
      ? [claimEstateAction(copy)]
      : targetCandidate
        ? toVicinityDataRowActions(targetCandidate, copy, selectedTargetCopy)
        : [],
  };

  return {
    ...listRow,
    subtitle: rowDetailLabel(listRow, copy),
    protectionDisplay: protectionLabel(
      listRow,
      copy,
      summaryCopy,
      selfProtectionDisplay ?? null,
    ),
  };
}

export function vicinityAddressKey(districtCode: string, addressNumber: number): string {
  return `${districtCode}:${addressNumber}`;
}

function rowDetailLabel(
  row: AddressDataRow,
  copy: PlayerVicinityCopyReadModel['addressList'],
): string {
  if (row.kind === 'self' || row.kind === 'empty') {
    return row.kind === 'self' ? copy.noGuildLabel : '';
  }

  if (row.candidate) {
    return row.candidate.targetGuildDisplayLabel ?? copy.noGuildLabel;
  }

  return '';
}

function travelTimeDisplay(seconds: number | null | undefined, unavailableLabel: string): string {
  if (typeof seconds !== 'number') {
    return unavailableLabel;
  }

  return formatPendingDurationLabel(seconds);
}

function playerSafeReason(
  display: PvpEligibilityDisplay | null | undefined,
): PvpEligibilityDisplay | null {
  return display?.reasonLabel && display.isPlayerSafeReason ? display : null;
}

function protectionLabel(
  row: AddressDataRow,
  copy: PlayerVicinityCopyReadModel['addressList'],
  summaryCopy: PlayerVicinityCopyReadModel['summary'],
  selfProtectionDisplay: string | null,
): string | null {
  if (row.kind === 'self') {
    return selfProtectionDisplay;
  }

  if (row.kind === 'occupied' && !row.candidate) {
    return summaryCopy.backendDataUnavailableLabel;
  }

  const expiresAt = row.candidate?.protectionExpiresAt;

  if (!expiresAt) {
    return row.kind === 'occupied' ? summaryCopy.noActiveProtectionLabel : null;
  }

  return replaceTemplateTokens(copy.protectionUntilTemplate, {
    time: formatTimeOfDayLabel(expiresAt),
  });
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
  row: VicinityAddressRow,
  kind: DataRowKind,
  candidate: PvpTargetCandidate | null,
  copy: PlayerVicinityCopyReadModel['addressList'],
): string | null {
  if (kind === 'self' || kind === 'empty') {
    return kind === 'self' ? row.occupancyLabel : null;
  }

  if (!candidate) {
    return row.occupancyLabel;
  }

  if (candidate.underProtection) {
    return null;
  }

  if (isSameGuildCandidate(candidate)) {
    return copy.sameGuildLabel;
  }

  return null;
}

function claimEstateAction(
  copy: PlayerVicinityCopyReadModel['addressList'],
): AddressDataRow['actions'][number] {
  return {
    kind: 'claimEstate',
    icon: 'pi pi-settle',
    label: copy.claimEstateLabel,
    tooltip: copy.claimEstateTooltip,
    severity: 'secondary',
    disabled: false,
    primary: false,
    pending: false,
  };
}
