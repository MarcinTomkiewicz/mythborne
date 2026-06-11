import {
  VICINITY_ROW_ACTION_CONFIGS,
} from '../configs/vicinity-row-actions.config';
import {
  PvpRankingActionKind,
  PvpRankingActionState,
  PvpRankingCopy,
  PvpRankingPendingAction,
  PvpRankingRow,
} from '../domain/pvp/pvp-ranking.model';
import {
  VicinityListRow,
  VicinityRowAction,
} from '../types/vicinity.types';

export function pvpRankingActionTooltip(
  actionKind: PvpRankingActionKind,
  action: PvpRankingActionState,
  copy: PvpRankingCopy,
): string {
  return !action.enabled && action.disabledReasonKey
    ? copy.disabledReasonTooltips[action.disabledReasonKey]
    : copy.actions[actionKind].tooltip;
}

export function pvpRankingGuildDisplay(
  row: Pick<PvpRankingRow, 'guildName'>,
  copy: PvpRankingCopy,
): string {
  return row.guildName ?? copy.common.emptyValues[copy.table.emptyValueKeys.noGuild];
}

export function pvpRankingTargetGuildDisplay(
  row: Pick<PvpRankingRow, 'guildName'>,
  copy: PvpRankingCopy,
): string {
  return row.guildName ?? copy.common.emptyValues[copy.targetPanel.emptyValueKeys.guild];
}

export function pvpRankingTableValue(
  value: string | null,
  copy: PvpRankingCopy,
): string {
  return value ?? copy.common.emptyValues[copy.table.emptyValueKeys.noValue];
}

export function pvpRankingTargetGenericValue(
  value: string | null,
  copy: PvpRankingCopy,
): string {
  return value ?? copy.common.emptyValues[copy.targetPanel.emptyValueKeys.generic];
}

export function pvpRankingTargetProtectionDisplay(
  row: Pick<PvpRankingRow, 'protectionDisplay'>,
  copy: PvpRankingCopy,
): string {
  return row.protectionDisplay
    ?? copy.common.emptyValues[copy.targetPanel.emptyValueKeys.protection];
}

export function toPvpRankingVicinityListRow(
  row: PvpRankingRow,
  copy: PvpRankingCopy,
  pendingAction: PvpRankingPendingAction | null,
): VicinityListRow {
  return {
    key: row.heroId,
    kind: row.isSelf ? 'self' : 'occupied',
    addressLabel: String(row.rankPosition),
    districtCode: row.districtKey,
    districtLabel: copy.filters.districtOptions[row.districtKey],
    address: row.addressDisplay,
    displayLabel: row.addressDisplay,
    isOccupied: true,
    isCurrentHeroEstate: row.isSelf,
    occupancyStatusKey: row.isSelf ? 'current' : 'occupied',
    occupancyLabel: row.heroName,
    heroId: row.heroId,
    occupantLabel: row.heroName,
    candidate: null,
    attackDisplay: null,
    spyDisplay: null,
    statusLabel: null,
    statusIndicatorIcon: null,
    statusIndicatorAriaLabel: null,
    isDangerState: false,
    detailLabel: pvpRankingGuildDisplay(row, copy),
    levelDisplay: String(row.level),
    attackTravelDisplay: pvpRankingTableValue(row.attackDurationDisplay, copy),
    spyTravelDisplay: pvpRankingTableValue(row.spyDurationDisplay, copy),
    metricCells: [
      {
        key: 'level',
        value: String(row.level),
      },
      {
        key: 'address',
        value: row.addressDisplay,
      },
      {
        key: 'attackDuration',
        value: pvpRankingTableValue(row.attackDurationDisplay, copy),
      },
      {
        key: 'spyDuration',
        value: pvpRankingTableValue(row.spyDurationDisplay, copy),
      },
    ],
    protectionDisplay: row.protectionDisplay,
    playerSafeAttackReason: null,
    playerSafeSpyReason: null,
    actions: toPvpRankingVicinityActions(row, copy, pendingAction),
  };
}

function toPvpRankingVicinityActions(
  row: PvpRankingRow,
  copy: PvpRankingCopy,
  pendingAction: PvpRankingPendingAction | null,
): VicinityRowAction[] {
  return VICINITY_ROW_ACTION_CONFIGS.map((config) => {
    const actionKind = config.kind;
    const action = row.actions[actionKind];
    const pending = pendingAction?.targetHeroId === row.heroId
      && pendingAction.actionKind === actionKind;

    return {
      kind: config.kind,
      icon: config.icon,
      label: copy.actions[actionKind].label,
      tooltip: pvpRankingActionTooltip(actionKind, action, copy),
      severity: config.severity,
      disabled: !action.enabled,
      primary: config.primaryWhenAvailable && action.enabled,
      pending,
    };
  });
}
