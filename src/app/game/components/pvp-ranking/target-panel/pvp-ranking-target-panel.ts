import { Component, computed, input, output } from '@angular/core';
import {
  PvpRankingCopy,
  PvpRankingRow,
} from '../../../../core/domain/pvp/pvp-ranking.model';
import type { GamePageSummaryRow } from '../../../../core/interfaces/game-page-summary-row.interface';
import type {
  VicinityListRow,
  VicinityRowActionEvent,
} from '../../../../core/types/vicinity.types';
import {
  pvpRankingTargetGenericValue,
  pvpRankingTargetGuildDisplay,
  pvpRankingTargetProtectionDisplay,
} from '../../../../core/utils/pvp-ranking-display';
import { VicinityRowActions } from '../../vicinity/row-actions/vicinity-row-actions';

@Component({
  selector: 'app-pvp-ranking-target-panel',
  standalone: true,
  imports: [VicinityRowActions],
  host: { class: 'd-contents' },
  templateUrl: './pvp-ranking-target-panel.html',
})
export class PvpRankingTargetPanel {
  readonly selected = input<PvpRankingRow | null>(null);
  readonly selectedActionRow = input<VicinityListRow | null>(null);
  readonly copy = input.required<PvpRankingCopy>();
  readonly factRows = computed<readonly GamePageSummaryRow[]>(() => {
    const row = this.selected();
    const copy = this.copy();

    if (!row) {
      return [];
    }

    return [
      {
        key: 'guild',
        label: copy.targetPanel.labels.guild,
        value: pvpRankingTargetGuildDisplay(row, copy),
      },
      {
        key: 'address',
        label: copy.targetPanel.labels.address,
        value: row.addressDisplay,
      },
      {
        key: 'attackDuration',
        label: copy.targetPanel.labels.attackDuration,
        value: pvpRankingTargetGenericValue(row.attackDurationDisplay, copy),
      },
      {
        key: 'spyDuration',
        label: copy.targetPanel.labels.spyDuration,
        value: pvpRankingTargetGenericValue(row.spyDurationDisplay, copy),
      },
      {
        key: 'protection',
        label: copy.targetPanel.labels.protection,
        value: pvpRankingTargetProtectionDisplay(row, copy),
      },
    ];
  });
  readonly startAction = output<VicinityRowActionEvent<VicinityListRow>>();
}
