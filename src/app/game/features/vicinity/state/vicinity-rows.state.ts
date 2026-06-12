import { computed, inject, Injectable, signal } from '@angular/core';
import type {
  PlayerVicinityCopyReadModel,
  PlayerVicinityEstateSummaryReadModel,
} from '../../../../core/domain/vicinity/player-vicinity-page-context.model';
import {
  AddressDataRow,
  DataRowAction,
  DataRowActionKind,
} from '../../../../core/types/data-row.types';
import {
  PvpStartActionKind,
} from '../../../../core/types/pvp-action.types';
import { formatTimeOfDayLabel } from '../../../../core/utils/pending-timer';
import { replaceTemplateTokens } from '../../../../core/utils/token-template';
import {
  toVicinityAddressDataRow,
  vicinityAddressKey,
} from '../utils/vicinity-list-row';
import { PvpActiveActionState } from '../../pvp/state/pvp-active-action.state';
import { VicinityPageState } from './vicinity-page.state';
import { VicinityPvpActionsState } from './vicinity-pvp-actions.state';
import { VicinityPvpMetadataState } from './vicinity-pvp-metadata.state';
import { VicinityVisibleTargetOverlayState } from './vicinity-visible-target-overlay.state';

@Injectable()
export class VicinityRowsState {
  private readonly metadata = inject(VicinityPvpMetadataState);
  private readonly page = inject(VicinityPageState);
  private readonly activePvpAction = inject(PvpActiveActionState);
  private readonly actions = inject(VicinityPvpActionsState);
  private readonly overlay = inject(VicinityVisibleTargetOverlayState);

  readonly selectedRowKey = signal<string | null>(null);
  readonly rows = computed(() => {
    const copy = this.page.copyJson();
    const pvpActionCopy = this.activePvpAction.copy();

    if (!copy || !pvpActionCopy) {
      return [];
    }

    const candidatesByAddress = new Map(
      this.overlay.targets().map((candidate) => [
        vicinityAddressKey(
          candidate.targetAddress.districtCode,
          candidate.targetAddress.addressNumber,
        ),
        candidate,
      ]),
    );
    const metadataEntries = this.metadata.entries();
    const selfProtectionDisplay = selfCurrentProtectionDisplay(
      this.page.estateRuntimeState(),
      copy,
    );

    return this.page.visibleRows().map((row) => {
      const candidate =
        candidatesByAddress.get(vicinityAddressKey(row.districtCode, row.addressNumber))
        ?? null;

      return this.withActionState(
        toVicinityAddressDataRow(
          row,
          candidate,
          metadataEntries,
          copy.addressList,
          pvpActionCopy,
          copy.labels,
          copy.summary,
          this.page.currentHeroName(),
          selfProtectionDisplay,
        ),
      );
    });
  });
  readonly selectedRow = computed(() => {
    const selectedKey = this.selectedRowKey();
    const rows = this.rows();

    return rows.find((row) => row.key === selectedKey)
      ?? rows.find((row) => row.kind === 'occupied' && row.candidate)
      ?? rows.find((row) => row.kind === 'self')
      ?? null;
  });

  selectRow(row: AddressDataRow): void {
    this.selectedRowKey.set(row.key);

    if (row.kind === 'empty') {
      this.page.selectRow({
        districtCode: row.districtCode,
        districtLabel: row.districtLabel,
        addressNumber: row.addressNumber,
        address: row.address,
        addressLabel: row.leadingLabel,
        displayLabel: row.displayLabel,
        kind: 'empty',
        isSelectable: true,
        isOccupied: false,
        isCurrentHeroEstate: false,
        occupancyStatusKey: row.occupancyStatusKey,
        occupancyLabel: row.occupancyLabel,
        estateId: row.estateId,
        serverId: row.serverId,
        heroId: row.heroId,
        estateRank: row.estateRank,
        occupantLabel: row.title,
      });
      return;
    }

    this.page.setDestructiveConfirmed(false);
  }

  focusCurrentAddress(): void {
    const currentAddress = this.page.currentAddress();

    if (!currentAddress || !this.page.focusCurrentAddress()) {
      return;
    }

    this.selectedRowKey.set(
      vicinityAddressKey(currentAddress.districtCode, currentAddress.addressNumber),
    );
  }

  startRowAction(row: AddressDataRow, actionKind: DataRowActionKind): void {
    if (actionKind === 'claimEstate') {
      this.selectRow(row);
      return;
    }

    const candidate = row.candidate;
    const pvpActionKind = toPvpStartActionKind(actionKind);

    if (!candidate || !pvpActionKind) {
      return;
    }

    this.actions.start({
      candidate,
      actionKind: pvpActionKind,
      refreshAfterStart: (result) => {
        this.activePvpAction.loadAfterStart(result);
        this.overlay.refresh();
      },
    });
  }

  private withActionState(row: AddressDataRow): AddressDataRow {
    if (!row.candidate) {
      return row;
    }

    return {
      ...row,
      actions: row.actions.map((action) => this.withSingleActionState(row, action)),
    };
  }

  private withSingleActionState(
    row: AddressDataRow,
    action: DataRowAction,
  ): DataRowAction {
    const candidate = row.candidate;
    const pvpActionKind = toPvpStartActionKind(action.kind);

    if (!candidate || !pvpActionKind) {
      return {
        ...action,
        disabled: true,
        primary: false,
        pending: false,
      };
    }

    const pending = pvpActionKind === 'attack'
      ? this.actions.isAttackPending(candidate.targetHeroId)
      : this.actions.isSpyPending(candidate.targetHeroId);
    const disabled = action.disabled
      || this.activePvpAction.isLoading()
      || this.activePvpAction.hasBlockingAction()
      || !this.actions.canStart(candidate, pvpActionKind);

    return {
      ...action,
      disabled,
      primary: action.primary && !disabled,
      pending,
    };
  }
}

function toPvpStartActionKind(
  actionKind: DataRowActionKind,
): PvpStartActionKind | null {
  return actionKind === 'attack' || actionKind === 'spy' ? actionKind : null;
}

function selfCurrentProtectionDisplay(
  runtimeState: PlayerVicinityEstateSummaryReadModel | null,
  copy: PlayerVicinityCopyReadModel,
): string {
  if (!runtimeState) {
    return copy.summary.backendDataUnavailableLabel;
  }

  const expiresAt = runtimeState.attackProtectionActive && runtimeState.attackProtectionExpiresAt
    ? runtimeState.attackProtectionExpiresAt
    : runtimeState.siegeProtectionActive && runtimeState.siegeProtectionExpiresAt
      ? runtimeState.siegeProtectionExpiresAt
      : null;

  return expiresAt
    ? replaceTemplateTokens(copy.addressList.protectionUntilTemplate, {
        time: formatTimeOfDayLabel(expiresAt),
      })
    : copy.summary.noActiveProtectionLabel;
}
