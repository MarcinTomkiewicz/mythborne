import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import type { GamePageSummaryRow } from '../../../../core/interfaces/game-page-summary-row.interface';
import type { PlayerVicinityCopyReadModel } from '../../../../core/domain/vicinity/player-vicinity-page-context.model';
import {
  VicinityListRow,
  VicinityRowActionKind,
} from '../../../../core/types/vicinity.types';

@Component({
  selector: 'app-vicinity-selected-target-panel',
  standalone: true,
  imports: [ButtonModule],
  host: { class: 'd-contents' },
  templateUrl: './vicinity-selected-target-panel.html',
})
export class VicinitySelectedTargetPanel {
  readonly selected = input<VicinityListRow | null>(null);
  readonly labels = input.required<PlayerVicinityCopyReadModel['labels']>();
  readonly summaryCopy = input.required<PlayerVicinityCopyReadModel['summary']>();
  readonly selectedTargetCopy = input.required<PlayerVicinityCopyReadModel['selectedTarget']>();
  readonly addressListCopy = input.required<PlayerVicinityCopyReadModel['addressList']>();
  readonly relocationError = input<string | null>(null);
  readonly relocationSuccess = input<string | null>(null);
  readonly actionButtons = computed(() =>
    this.selected()?.actions ?? [],
  );
  readonly factRows = computed<readonly GamePageSummaryRow[]>(() => {
    const row = this.selected();
    const labels = this.labels();
    const summaryCopy = this.summaryCopy();
    const selectedTargetCopy = this.selectedTargetCopy();

    if (!row) {
      return [];
    }

    const isEnemyTarget = row.kind === 'occupied' && row.candidate !== null;
    const rows: GamePageSummaryRow[] = [
      {
        key: 'target',
        label: selectedTargetCopy.targetLabel,
        value: row.occupantLabel || row.displayLabel,
      },
      {
        key: 'address',
        label: labels.address,
        value: row.addressLabel,
      },
    ];

    if (isEnemyTarget) {
      rows.push({
        key: 'attackTravel',
        label: selectedTargetCopy.attackTravelLabel,
        value: row.attackTravelDisplay,
      },
      {
        key: 'spyTravel',
        label: selectedTargetCopy.spyTravelLabel,
        value: row.spyTravelDisplay,
      },
      );
    }

    const protectionDisplay = targetProtectionDisplay(row, summaryCopy);

    if (protectionDisplay) {
      rows.push({
        key: 'protection',
        label: selectedTargetCopy.protectionLabel,
        value: protectionDisplay,
      });
    }

    return rows;
  });
  readonly startAction = output<{
    row: VicinityListRow;
    actionKind: VicinityRowActionKind;
  }>();
}

function targetProtectionDisplay(
  row: VicinityListRow,
  copy: PlayerVicinityCopyReadModel['summary'],
): string | null {
  if (row.kind === 'empty') {
    return null;
  }

  if (row.protectionDisplay) {
    return row.protectionDisplay;
  }

  if (row.kind === 'occupied' && !row.candidate) {
    return copy.backendDataUnavailableLabel;
  }

  return copy.noActiveProtectionLabel;
}
