import { Component, computed, input, output } from '@angular/core';
import {
  PvpRankingCopy,
  PvpRankingRow,
} from '../../../../core/domain/pvp/pvp-ranking.model';
import type { GamePageSummaryRow } from '../../../../core/interfaces/game-page-summary-row.interface';
import type {
  DataRow,
  DataRowActionEvent,
} from '../../../../core/types/data-row.types';
import {
  pvpRankingTargetGenericValue,
  pvpRankingTargetGuildDisplay,
  pvpRankingTargetProtectionDisplay,
} from '../../../../core/utils/pvp-ranking-display';
import { SelectedTargetPanelShell } from '../../selected-target-panel-shell/selected-target-panel-shell';

@Component({
  selector: 'app-pvp-ranking-target-panel',
  standalone: true,
  imports: [SelectedTargetPanelShell],
  host: { class: 'd-contents' },
  templateUrl: './pvp-ranking-target-panel.html',
})
export class PvpRankingTargetPanel {
  readonly selected = input<PvpRankingRow | null>(null);
  readonly selectedActionRow = input<DataRow | null>(null);
  readonly copy = input.required<PvpRankingCopy>();
  readonly targetTitle = computed(() => this.selected()?.heroName ?? null);
  readonly targetSubtitle = computed(() => {
    const row = this.selected();

    return row ? pvpRankingTargetGuildDisplay(row, this.copy()) : null;
  });
  readonly factRows = computed<readonly GamePageSummaryRow[]>(() => {
    const row = this.selected();
    const copy = this.copy();

    if (!row) {
      return [];
    }

    return [
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
  readonly startAction = output<DataRowActionEvent<DataRow>>();
}
