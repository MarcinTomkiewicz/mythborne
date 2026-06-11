import {
  DATA_ROW_ACTION_CONFIGS,
} from '../configs/data-row-actions.config';
import {
  PvpRankingActionKind,
  PvpRankingActionState,
  PvpRankingCopy,
  PvpRankingRow,
} from '../domain/pvp/pvp-ranking.model';
import {
  DataRowAction,
  RankingDataRow,
} from '../types/data-row.types';
import type { PendingPvpAction } from '../types/pvp-action.types';

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

export function toPvpRankingDataRow(
  row: PvpRankingRow,
  copy: PvpRankingCopy,
  pendingAction: PendingPvpAction | null,
): RankingDataRow {
  return {
    key: row.heroId,
    kind: row.isSelf ? 'self' : 'occupied',
    leadingLabel: String(row.rankPosition),
    title: row.heroName,
    statusLabel: null,
    statusIndicatorIcon: null,
    statusIndicatorAriaLabel: null,
    isDangerState: false,
    subtitle: pvpRankingGuildDisplay(row, copy),
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
    actions: toPvpRankingDataRowActions(row, copy, pendingAction),
    rankingRow: row,
  };
}

function toPvpRankingDataRowActions(
  row: PvpRankingRow,
  copy: PvpRankingCopy,
  pendingAction: PendingPvpAction | null,
): DataRowAction[] {
  return DATA_ROW_ACTION_CONFIGS.map((config) => {
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
