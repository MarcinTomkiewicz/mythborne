import { computed, inject, Injectable, signal } from '@angular/core';
import {
  PvpStartActionKind,
  VicinityListRow,
  VicinityRowAction,
  VicinityRowActionKind,
} from '../../../../core/types/vicinity.types';
import {
  toVicinityListRow,
  vicinityAddressKey,
} from '../utils/vicinity-list-row';
import { VicinityPageState } from './vicinity-page.state';
import { VicinityPvpMetadataState } from './vicinity-pvp-metadata.state';
import { VicinityTargetCandidatesState } from './vicinity-target-candidates.state';

@Injectable()
export class VicinityRowsState {
  private readonly metadata = inject(VicinityPvpMetadataState);
  private readonly page = inject(VicinityPageState);
  private readonly pvpTargets = inject(VicinityTargetCandidatesState);

  readonly selectedRowKey = signal<string | null>(null);
  readonly rows = computed(() => {
    const candidatesByAddress = new Map(
      this.pvpTargets.visibleTargets().map((candidate) => [
        vicinityAddressKey(
          candidate.targetAddress.districtCode,
          candidate.targetAddress.addressNumber,
        ),
        candidate,
      ]),
    );
    const metadataEntries = this.metadata.entries();

    return this.page.visibleRows().map((row) => {
      const candidate =
        candidatesByAddress.get(vicinityAddressKey(row.districtCode, row.addressNumber))
        ?? null;

      return this.withActionState(
        toVicinityListRow(row, candidate, metadataEntries, this.page.currentHeroName()),
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

  selectRow(row: VicinityListRow): void {
    this.selectedRowKey.set(row.key);

    if (row.kind === 'empty') {
      this.page.selectRow({
        districtCode: row.districtCode,
        addressNumber: row.addressNumber,
        addressLabel: row.addressLabel,
        kind: 'empty',
        isSelectable: true,
        occupantLabel: row.occupantLabel,
      });
      return;
    }

    this.page.setDestructiveConfirmed(false);
  }

  startRowAction(row: VicinityListRow, actionKind: VicinityRowActionKind): void {
    const candidate = row.candidate;
    const pvpActionKind = toPvpStartActionKind(actionKind);

    if (!candidate || !pvpActionKind) {
      return;
    }

    this.pvpTargets.startAction(candidate, pvpActionKind);
  }

  private withActionState(row: VicinityListRow): VicinityListRow {
    if (!row.candidate) {
      return row;
    }

    return {
      ...row,
      actions: row.actions.map((action) => this.withSingleActionState(row, action)),
    };
  }

  private withSingleActionState(
    row: VicinityListRow,
    action: VicinityRowAction,
  ): VicinityRowAction {
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
      ? this.pvpTargets.isAttackPending(candidate.targetHeroId)
      : this.pvpTargets.isSpyPending(candidate.targetHeroId);
    const disabled = action.disabled || !this.pvpTargets.canStart(candidate, pvpActionKind);

    return {
      ...action,
      disabled,
      primary: action.primary && !disabled,
      pending,
    };
  }
}

function toPvpStartActionKind(
  actionKind: VicinityRowActionKind,
): PvpStartActionKind | null {
  return actionKind === 'attack' || actionKind === 'spy' ? actionKind : null;
}
